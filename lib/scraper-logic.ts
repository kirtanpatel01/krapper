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
            return null;
          }
        }
      }
    }
    i++;
  }
  return null;
}

export async function* scrapeIndeedJobs(
  query: string, 
  maxPages: number = 1,
  apiKey?: string,
  superProxy: boolean = false
): AsyncGenerator<ScrapedJob[]> {
  const SCRAPEDO_TOKEN = (apiKey || process.env.SCRAPEDO_TOKEN || '').trim();

  if (!SCRAPEDO_TOKEN) {
    throw new Error('API Token is missing. Please provide one.');
  }


  
  const seenJobKeys = new Set<string>();

  for (let page = 0; page < maxPages; page++) {
    const start = page * 10;
    const searchUrl = `https://in.indeed.com/jobs?q=${encodeURIComponent(query)}${start > 0 ? `&start=${start}` : ''}&vjs=1&from=searchOnHP`;
    
    // super=true (Super Proxy), render=false
    const scrapeDoUrl = `https://api.scrape.do?token=${SCRAPEDO_TOKEN}&url=${encodeURIComponent(searchUrl)}&super=${superProxy}&render=false`;

    if (page > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    try {

      const response = await axios.get(scrapeDoUrl, { timeout: 15000 });
      const html = response.data;
      const $ = cheerio.load(html);
      
      let pageJobs: ScrapedJob[] = [];
      let foundScriptCount = 0;


      $('script').each((_, el) => {
        const content = $(el).html() || '';
        if (content.includes('mosaic-provider-jobcards')) {
          foundScriptCount++;
          const data = extractJson(content, 'window.mosaic.providerData["mosaic-provider-jobcards"]');
          if (data) {
            const results = data.results || data.metaData?.mosaicProviderJobCardsModel?.results;
            if (results && Array.isArray(results)) {
              results.forEach((job: any) => {
                const jobKey = job.jobkey || job.jk || Math.random().toString(36).substring(7);
                if (!seenJobKeys.has(jobKey)) {
                  seenJobKeys.add(jobKey);
                  pageJobs.push({
                    title: job.displayTitle || job.title,
                    company: job.company,
                    location: job.formattedLocation,
                    salary: job.salarySnippet?.text || 'No Salary Info',
                    jobType: (job.taxonomyAttributes?.find((t: any) => t.label === 'job-types')?.attributes?.[0]?.label) || 'Full-time',
                    description: job.snippet ? job.snippet.replace(/<[^>]*>?/gm, '') : 'No Snippet Available',
                    jobUrl: `https://in.indeed.com/viewjob?jk=${jobKey}`,
                    benefits: job.taxonomyAttributes?.find((t: any) => t.label === 'benefits')?.attributes?.map((a: any) => a.label),
                    qualifications: job.taxonomyAttributes?.find((t: any) => t.label === 'qualifications')?.attributes?.map((a: any) => a.label),
                  });
                }
              });
            }
          }
        }
      });

      if (pageJobs.length === 0) {
        $('script').each((_, el) => {
          const content = $(el).html() || '';
          if (content.includes('window.mosaic.initialData')) {
            foundScriptCount++;
            const data = extractJson(content, 'window.mosaic.initialData');
            const results = data?.metaData?.mosaicProviderPostProcessedData?.['serp-relevant-jobs']?.jobPostings;
            if (results && Array.isArray(results)) {
               results.forEach((job: any) => {
                 const jobKey = job.jobkey || job.jk || Math.random().toString(36).substring(7);
                 if (!seenJobKeys.has(jobKey)) {
                   seenJobKeys.add(jobKey);
                   pageJobs.push({
                     title: job.title,
                     company: job.company,
                     location: job.location,
                     salary: job.salary || 'No Salary Info',
                     jobType: job.jobType || 'Full-time',
                     description: job.snippet || 'No Snippet Available',
                     jobUrl: `https://in.indeed.com/viewjob?jk=${jobKey}`,
                   });
                 }
               });
            }
          }
        });
      }

      if (foundScriptCount === 0) {
        if (html.includes('Captcha') || html.includes('challenge')) {
          break;
        }
      }

      if (pageJobs.length === 0) {
        break;
      }


      yield pageJobs;

    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Your custom Scrape.do API key is invalid, has no credits, or is blocked.');
      }
      throw error; 
    }
  }
}
