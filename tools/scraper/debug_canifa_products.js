const puppeteer = require('puppeteer');

async function debugCanifa() {
  console.log('Inspecting product-item structure on Canifa...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const url = 'https://canifa.com/nam/ao-len.html';
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    const products = await page.evaluate(() => {
      const items = [];
      const nodes = document.querySelectorAll('.product-item');
      nodes.forEach(node => {
        const titleEl = node.querySelector('.product-item-name a, a.product-item-link, a');
        const priceEl = node.querySelector('.price, .special-price, .normal-price');
        const imgEl = node.querySelector('img');
        
        items.push({
          title: titleEl?.innerText.trim(),
          price: priceEl?.innerText.trim(),
          img: imgEl?.src || imgEl?.getAttribute('data-src')
        });
      });
      return items;
    });
    console.log('Sample parsed products from Canifa:', products);

  } catch (err) {
    console.log('Error:', err.message);
  }
  await browser.close();
}

debugCanifa();
