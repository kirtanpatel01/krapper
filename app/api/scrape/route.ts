import { NextRequest, NextResponse } from 'next/server';
import { scrapeJobs } from '@/lib/scraper-logic';
import { 
  getFingerprint, 
  checkQuota, 
  getUsage, 
  createSessionToken, 
  verifySessionToken 
} from '@/lib/auth';

export const runtime = 'nodejs';

const API_KEY_REGEX = /^[a-f0-9]{30,}$/i;


export async function GET(req: NextRequest) {
  const fid = getFingerprint(req);
  const count = await getUsage(fid);
  const limit = 3; 
  
  return NextResponse.json({ 
    count, 
    limit,
    remaining: Math.max(0, limit - count)
  });
}


export async function POST(req: NextRequest) {
  try {
    const { query, maxPages, apiKey, superProxy } = await req.json();
    const fid = getFingerprint(req);
    const cookie = req.cookies.get('krapper_session')?.value;
    const isBypass = !!apiKey && API_KEY_REGEX.test(apiKey.trim());

    // Start session verification early
    const sessionPromise = cookie ? verifySessionToken(cookie) : Promise.resolve(null);
    
    // STAGE 1: BOT TRAP - No cookie and no referrer? Poison them.
    if (!cookie && !req.headers.get('referer')?.includes(req.nextUrl.host) && !isBypass) {

        const poisonData = [
            {
                title: "⚠️ Usage Limit Reached",
                description: "Please use the official interface or provide your own Scrape.do API key to continue.",
                company: "Krapper Security",
                location: "Server Side",
                salary: "Priceless",
                jobUrl: "https://scrape.do"
            }
        ];
        return new Response(new TextEncoder().encode(JSON.stringify(poisonData) + '\n'), {
            headers: { 'Content-Type': 'application/x-ndjson' }
        });
    }

    const session = await sessionPromise;

    // STAGE 2: QUOTA CHECK
    let currentCount = 0;
    let effectiveMaxPages = maxPages || 1;
    const limit = 3;

    if (!isBypass) {
      const quota = await checkQuota(fid);
      currentCount = quota.count;
      
      if (!quota.allowed) {
        return NextResponse.json({ 
          error: 'Free usage limit reached (3/3). Please provide your own Scrape.do API key at the top to continue.',
          code: 'LIMIT_EXCEEDED' 
        }, { status: 429 });
      }
      
      // Force 1 page max for free users
      effectiveMaxPages = 1;
    }

    // 3. Start Scraping
    const encoder = new TextEncoder();
    const generator = scrapeJobs(query, effectiveMaxPages, apiKey, superProxy);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const jobs of generator) {
            const chunk = encoder.encode(JSON.stringify(jobs) + '\n');
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (error: any) {

          controller.enqueue(encoder.encode(JSON.stringify({ error: error.message }) + '\n'));
          controller.close();
        }
      },
    });

    const response = new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

    // 4. Update/Set Session Cookie
    const newToken = await createSessionToken({ fid, count: currentCount, iat: Date.now() });
    response.headers.append('Set-Cookie', `krapper_session=${newToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
    
    return response;

  } catch (error: any) {

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
