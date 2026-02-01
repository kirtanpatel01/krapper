import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedJob {
  title: string;
  description: string;
  company?: string;
  location?: string;
  salary?: string;
  jobType?: string;
  jobUrl?: string;
  benefits?: string[];
  qualifications?: string[];
}

/**
 * Robust JSON extraction from a script tag content (window.variable = { ... })
 */
function extractJson(content: string, varName: string): any {
  const startIndex = content.indexOf(varName);
  if (startIndex === -1) return null;

  // Find the first '{' after the variable name and '='
  const assignmentIndex = content.indexOf('=', startIndex + varName.length);
  if (assignmentIndex === -1) return null;

  const jsonStart = content.indexOf('{', assignmentIndex);
  if (jsonStart === -1) return null;

  let braceCount = 0;
  let i = jsonStart;
  let inString = false;
  let escape = false;

  while (i < content.length) {
    const char = content[i];
    if (escape) {
      escape = false;
    } else if (char === '\\') {
      escape = true;
    } else if (char === '"') {
      inString = !inString;
    } else if (!inString) {
      if (char === '{') braceCount++;
      else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          const jsonStr = content.substring(jsonStart, i + 1);
          try {
            return JSON.parse(jsonStr);
          } catch (e: any) {
            console.error(`❌ JSON Parse Error for ${varName}: ${e.message}`);
            return null;
          }
        }
      }
    }
    i++;
  }
  return null;
}

export async function scrapeIndeedJobs(query: string): Promise<ScrapedJob[]> {
  const SCRAPEDO_TOKEN = (process.env.SCRAPEDO_TOKEN || '').trim();

  if (!SCRAPEDO_TOKEN) {
    throw new Error('SCRAPEDO_TOKEN is missing in environment variables.');
  }

  console.log(`🚀 Starting LIVE optimized scrape (REST API) for: "${query}"`);
  
  const searchUrl = `https://in.indeed.com/jobs?q=${encodeURIComponent(query)}`;
  // super=true (Residential Proxy), render=false (High performance, low cost)
  const scrapeDoUrl = `https://api.scrape.do?token=${SCRAPEDO_TOKEN}&url=${encodeURIComponent(searchUrl)}&super=true&render=false`;

  try {
    const response = await axios.get(scrapeDoUrl);
    const html = response.data;
    const $ = cheerio.load(html);
    
    let scrapedJobs: ScrapedJob[] = [];

    // Indeed embeds data in script tags. We look for 'mosaic-provider-jobcards'
    $('script').each((_, el) => {
      const content = $(el).html() || '';
      if (content.includes('mosaic-provider-jobcards')) {
        const data = extractJson(content, 'window.mosaic.providerData["mosaic-provider-jobcards"]');
        if (data) {
          const results = data.results || data.metaData?.mosaicProviderJobCardsModel?.results;
          if (results && Array.isArray(results)) {
            console.log(`✅ Extracted ${results.length} live jobs from Indeed.`);
            scrapedJobs = results.map((job: any) => ({
              title: job.displayTitle || job.title,
              company: job.company,
              location: job.formattedLocation,
              salary: job.salarySnippet?.text || 'No Salary Info',
              jobType: (job.taxonomyAttributes?.find((t: any) => t.label === 'job-types')?.attributes?.[0]?.label) || 'Full-time',
              description: job.snippet ? job.snippet.replace(/<[^>]*>?/gm, '') : 'No Snippet Available',
              jobUrl: `https://in.indeed.com/viewjob?jk=${job.jobkey}`,
              benefits: job.taxonomyAttributes?.find((t: any) => t.label === 'benefits')?.attributes?.map((a: any) => a.label),
              qualifications: job.taxonomyAttributes?.find((t: any) => t.label === 'qualifications')?.attributes?.map((a: any) => a.label),
            }));
          }
        }
      }
    });

    // Fallback to initialData if jobcards failed
    if (scrapedJobs.length === 0) {
      $('script').each((_, el) => {
        const content = $(el).html() || '';
        if (content.includes('window.mosaic.initialData')) {
          const data = extractJson(content, 'window.mosaic.initialData');
          const results = data?.metaData?.mosaicProviderPostProcessedData?.['serp-relevant-jobs']?.jobPostings;
          if (results && Array.isArray(results)) {
             console.log(`✅ Extracted ${results.length} jobs from initialData fallback.`);
             scrapedJobs = results.map((job: any) => ({
               title: job.title,
               company: job.company,
               location: job.location,
               salary: job.salary || 'No Salary Info',
               jobType: job.jobType || 'Full-time',
               description: job.snippet || 'No Snippet Available',
               jobUrl: `https://in.indeed.com/viewjob?jk=${job.jobkey}`,
             }));
          }
        }
      });
    }

    if (scrapedJobs.length === 0) {
      if (html.includes('Access Denied') || html.includes('captcha')) {
        throw new Error('Indeed block detected (Captcha or Access Denied).');
      }
      throw new Error(`No jobs found for "${query}". Indeed might have changed their structure.`);
    }

    return scrapedJobs;
  } catch (error: any) {
    console.error(`❌ Scraping failed: ${error.message}`);
    throw error; // Re-throw to be handled by the server action
  }
}


