import puppeteer from 'puppeteer';

const SCRAPEDO_TOKEN = (process.env.SCRAPEDO_TOKEN || '').trim();
const PROXY = 'proxy.scrape.do:8080';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  if (!SCRAPEDO_TOKEN || SCRAPEDO_TOKEN === 'YOUR_SCRAPEDO_TOKEN') {
    console.error('❌ Error: SCRAPEDO_TOKEN is missing. Make sure it is in your .env file and you run with --env-file=.env');
    process.exit(1);
  }

  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: false, // keep false while debugging
    ...({ ignoreHTTPSErrors: true } as any),
    args: [
      `--proxy-server=http://${PROXY}`,
      '--ignore-certificate-errors',
      '--ignore-certificate-errors-spki-list'
    ],
  });

  const page = await browser.newPage();

  // �️ OPTIMIZATION: Block images, fonts, and CSS to save Scrape.do credits
  // Each request (even for an image) costs 1 credit when using a proxy.
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const resourceType = request.resourceType();
    if (['image', 'font', 'stylesheet', 'media'].includes(resourceType)) {
      request.abort();
    } else {
      request.continue();
    }
  });

  // �🔐 Scrape.do auth
  await page.authenticate({
    username: SCRAPEDO_TOKEN,
    password: 'render=false',
  });

  // 🧍 Human-like UA
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
  );

  // 🚀 Go to search page
  console.log('📡 Navigating to Indeed (this may take a moment via proxy)...');
  try {
    await page.goto(
      'https://in.indeed.com/jobs?q=full+stack+developer',
      { 
        waitUntil: 'domcontentloaded',
        timeout: 90000 // Upped to 90s for more stability
      }
    );
  } catch (error: any) {
    console.error('❌ Navigation failed:', error.message);
    if (error.message.includes('ERR_INVALID_AUTH_CREDENTIALS')) {
      console.error('👉 Tip: Check if your SCRAPEDO_TOKEN is correct and has no extra spaces.');
    }
    await browser.close();
    process.exit(1);
  }

  // ⏳ Wait for job cards
  console.log('⏳ Waiting for job cards...');
  const jobSelector = 'a[href*="/rc/clk?jk="], a[href*="/viewjob?jk="]';
  await page.waitForSelector(jobSelector, { timeout: 60000 });

  console.log('🔗 Extracting job links...');
  const jobLinks = await page.evaluate((selector) => {
    const links = Array.from(document.querySelectorAll(selector));
    return links
      .map(link => (link as HTMLAnchorElement).href)
      .filter((href, index, self) => self.indexOf(href) === index); // unique
  }, jobSelector);

  const results: any[] = [];
  const limit = Math.min(jobLinks.length, 5);
  
  console.log(`🎯 Found ${jobLinks.length} jobs. Scraping the first ${limit}...`);

  for (let i = 0; i < limit; i++) {
    const jobUrl = jobLinks[i];
    console.log(`\n🔍 Scraping job ${i + 1}/${limit}:`);
    console.log(`🔗 ${jobUrl.substring(0, 60)}...`);

    try {
      // 🚀 Direct navigation is much more reliable than clicking
      await page.goto(jobUrl, { 
        waitUntil: 'domcontentloaded', 
        timeout: 45000 
      });

      const job = await page.evaluate(() => {
        // Indeed ViewJob page selectors
        const titleEl = document.querySelector('h1') || document.querySelector('h2.jobsearch-JobInfoHeader-title');
        const title = (titleEl as HTMLElement)?.innerText.replace(/\n/g, ' ').trim() || 'No Title Found';

        const descEl = document.querySelector('#jobDescriptionText');
        const description = (descEl as HTMLElement)?.innerText.trim() || 'No Description Found';

        return { title, description };
      });

      console.log(`✅ Success: ${job.title.substring(0, 50)}...`);
      results.push(job);
    } catch (e: any) {
      console.warn(`⚠️ Error on job ${i + 1}: ${e.message.split('\n')[0]}`);
    }

    // ⏸ Respectful delay
    await delay(3000);
  }

  console.log('\nFINAL RESULT:\n', results);

  await browser.close();
})();
