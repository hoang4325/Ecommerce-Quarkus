const puppeteer = require('puppeteer');

async function debugCanifa() {
  console.log('Inspecting product-item inner HTML...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const url = 'https://canifa.com/nam/ao-len.html';
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    const sampleHtml = await page.evaluate(() => {
      const node = document.querySelector('.product-item');
      if (!node) return 'No product-item found!';
      return {
        outerHTML: node.outerHTML.substring(0, 2000),
        descendants: Array.from(node.querySelectorAll('*')).map(el => ({
          tag: el.tagName,
          class: el.className,
          text: el.innerText.trim()
        })).filter(x => x.text.length > 0 || x.tag === 'IMG')
      };
    });
    console.log('Canifa product-item HTML Sample:', sampleHtml);

  } catch (err) {
    console.log('Error:', err.message);
  }
  await browser.close();
}

debugCanifa();
