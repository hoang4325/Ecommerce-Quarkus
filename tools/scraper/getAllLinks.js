const puppeteer = require('puppeteer');

async function getAllLinks() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  try {
    await page.goto('https://yody.vn/ao-polo-nam', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 4000));

    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => ({
        href: a.getAttribute('href') || '',
        text: a.innerText.trim()
      })).filter(l => l.href.length > 1);
    });

    console.log(`Found ${links.length} links in total!`);
    console.log('Sample links:', links.slice(0, 40));

  } catch (err) {
    console.log('Error:', err.message);
  }
  await browser.close();
}

getAllLinks();
