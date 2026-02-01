'use server';

import { scrapeIndeedJobs, ScrapedJob } from '@/lib/scraper-logic';

export async function scrapeAction(query: string): Promise<{ success: boolean; data?: ScrapedJob[]; error?: string }> {
  try {
    if (!query || query.trim().length === 0) {
      return { success: false, error: 'Please provide a search query.' };
    }

    const data = await scrapeIndeedJobs(query);
    return { success: true, data };
  } catch (error: any) {
    console.error('Scrape Action Error:', error);
    return { success: false, error: error.message || 'An unexpected error occurred while scraping.' };
  }
}
