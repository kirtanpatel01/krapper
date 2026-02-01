
import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function testIndeedScrape() {
    const SCRAPEDO_TOKEN = process.env.SCRAPEDO_TOKEN;
    if (!SCRAPEDO_TOKEN) {
        console.error("❌ SCRAPEDO_TOKEN missing");
        return;
    }

    const query = 'software engineer';
    const url = `https://in.indeed.com/jobs?q=${encodeURIComponent(query)}`;
    
    // Scrape.do API URL
    // super=true for residential proxy (needed for Indeed)
    // render=false to save credits (hopefully it works)
    const scrapeDoUrl = `https://api.scrape.do?token=${SCRAPEDO_TOKEN}&url=${encodeURIComponent(url)}&super=true&render=false`;

    console.log(`📡 Fetching: ${url} via Scrape.do...`);
    
    try {
        const response = await axios.get(scrapeDoUrl);
        const html = response.data;
        fs.writeFileSync('indeed-raw.html', html);
        const $ = cheerio.load(html);

        console.log(`✅ Success! Status: ${response.status}`);
        
        // Create a robust function to extract JSON from JS assignment
        function extractJson(content: string, varName: string): any {
            const marker = `${varName} = `;
            const startIndex = content.indexOf(marker);
            if (startIndex === -1) return null;

            const jsonStart = content.indexOf('{', startIndex + marker.length);
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

        // Check each script tag
        let dataFound = false;
        $('script').each((i, el) => {
            const content = $(el).html() || '';
            const jobCardsData = extractJson(content, 'window.mosaic.providerData["mosaic-provider-jobcards"]');
            
            if (jobCardsData) {
                console.log(`🎯 Found jobcards script tag! Length: ${content.length}`);
                dataFound = true;
                
                const results = jobCardsData.results || jobCardsData.metaData?.mosaicProviderJobCardsModel?.results;
                if (results && Array.isArray(results)) {
                    console.log(`✅ Extracted ${results.length} jobs from jobcards!`);
                    results.slice(0, 3).forEach((job: any, index: number) => {
                        console.log(`\nJob ${index + 1}:`);
                        console.log(`- Title: ${job.displayTitle || job.title}`);
                        console.log(`- Company: ${job.company}`);
                        console.log(`- Location: ${job.formattedLocation}`);
                        console.log(`- Salary: ${job.salarySnippet?.text || 'N/A'}`);
                        console.log(`- Key: ${job.jobkey}`);
                    });
                    fs.writeFileSync('indeed-data.json', JSON.stringify(jobCardsData, null, 2));
                }
            }

            // Fallback to initialData if needed
            if (!dataFound) {
                const initialData = extractJson(content, 'window.mosaic.initialData');
                if (initialData) {
                    console.log(`🎯 Found initialData script tag!`);
                    dataFound = true;
                    fs.writeFileSync('indeed-initial-data.json', JSON.stringify(initialData, null, 2));
                }
            }
        });


        if (!dataFound) {
            console.log("❌ No initialData script found. Might need render=true or Indeed changed structure.");
            // Log a bit of the body to see what we got
            console.log($('body').text().substring(0, 500));
        }

    } catch (error: any) {
        console.error(`❌ Failed: ${error.message}`);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${JSON.stringify(error.response.data)}`);
        }
    }
}

testIndeedScrape();
