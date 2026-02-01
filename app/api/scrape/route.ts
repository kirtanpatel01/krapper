import { NextRequest, NextResponse } from 'next/server';
import { scrapeIndeedJobs } from '@/lib/scraper-logic';

export const runtime = 'nodejs'; // Use nodejs runtime for axios and cheerio

export async function POST(req: NextRequest) {
  try {
    const { query, maxPages } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const generator = scrapeIndeedJobs(query, maxPages || 1);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const jobs of generator) {
            // Encode the jobs array as a JSON chunk followed by a delimiter
            // We use a simple newline-delimited JSON or just stream the arrays
            const chunk = encoder.encode(JSON.stringify(jobs) + '\n');
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (error: any) {
          console.error('Streaming Error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
