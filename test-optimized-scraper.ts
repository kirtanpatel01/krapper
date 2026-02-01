
import { scrapeIndeedJobs } from './lib/scraper-logic.ts';
import dotenv from 'dotenv';

dotenv.config();

async function runTest() {
    console.log('🧪 Testing Optimized Scraper...');
    try {
        const jobs = await scrapeIndeedJobs('software engineer');
        console.log(`✅ Scraped ${jobs.length} jobs!`);
        
        if (jobs.length > 0) {
            jobs.slice(0, 3).forEach((job, i) => {
                console.log(`\nJob ${i + 1}:`);
                console.log(`- Title: ${job.title}`);
                console.log(`- Company: ${job.company}`);
                console.log(`- Salary: ${job.salary}`);
                console.log(`- URL: ${job.jobUrl}`);
                console.log(`- Description Snippet: ${job.description.substring(0, 100)}...`);
            });
        }
    } catch (error: any) {
        console.error('❌ Test Failed:', error.message);
    }
}

runTest();
