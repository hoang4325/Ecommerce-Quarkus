const puppeteer = require('puppeteer');

async function printCardHTML() {
  console.log('Inspecting full Canifa card HTML...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  const url = 'https://canifa.com/nam/quan-kaki.html';
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    
    const cardHTML = await page.evaluate(() => {
      const card = document.querySelector('.product-item');
      return card ? card.innerHTML : 'No card found';
    });
    
    console.log('--- Card HTML ---');
    console.log(cardHTML);
    console.log('-----------------');

  } catch (err) {
    console.log('Error:', err.message);
  }
  await browser.close();
}

printCardHTML();
