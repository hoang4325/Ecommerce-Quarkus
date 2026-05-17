const axios = require('axios');

async function testYodyParse() {
  const url = 'https://yody.vn/quan-jeans-nam';
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = res.data;
    
    const startIndex = html.indexOf('self.products = ');
    if (startIndex !== -1) {
      const jsonStart = html.indexOf('[', startIndex);
      if (jsonStart !== -1) {
        let bracketCount = 0;
        let endIndex = -1;
        for (let i = jsonStart; i < html.length; i++) {
          if (html[i] === '[') bracketCount++;
          else if (html[i] === ']') {
            bracketCount--;
            if (bracketCount === 0) {
              endIndex = i;
              break;
            }
          }
        }
        if (endIndex !== -1) {
          const jsonStr = html.substring(jsonStart, endIndex + 1);
          const products = JSON.parse(jsonStr);
          console.log(`✅ Success! Parsed ${products.length} products!`);
          console.log('Sample product:', {
            name: products[0].select_variant?.name,
            price: products[0].select_variant?.price,
            price_with_symbol: products[0].select_variant?.price_with_symbol,
            image_url: products[0].select_variant?.image_url,
            slug: products[0].select_variant?.slug
          });
          return;
        }
      }
    }
    console.log('❌ Failed to parse self.products JSON.');
  } catch (err) {
    console.log('Error:', err.message);
  }
}

testYodyParse();
