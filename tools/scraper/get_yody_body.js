const puppeteer = require('puppeteer');

async function getBody() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  try {
    await page.goto('https://yody.vn/ao-polo-nam', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout?.(5000) || new Promise(r => setTimeout(r, 5000));
    
    // Let's dump all text of the first 10 h2, h3, or h4
    const headings = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5')).map(h => ({
        tag: h.tagName,
        text: h.innerText.trim(),
        class: h.className
      }));
    });
    console.log('Headings:', headings.slice(0, 30));

    // Let's dump some images
    const images = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt,
        class: img.className
      })).slice(0, 15);
    });
    console.log('Images:', images);

    // Let's find all text containing "đ" or "VND"
    const prices = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('*'));
      return all.filter(el => el.children.length === 0 && el.innerText.includes('đ') && /\d/.test(el.innerText))
        .map(el => el.innerText.trim()).slice(0, 15);
    });
    console.log('Prices:', prices);

  } catch (err) {
    console.log('Error:', err.message);
  }
  await browser.close();
}

getBody();
