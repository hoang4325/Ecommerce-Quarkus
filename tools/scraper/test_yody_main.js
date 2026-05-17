const axios = require('axios');

function extractYodyProducts(html) {
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
        try {
          const jsonStr = html.substring(jsonStart, endIndex + 1);
          return JSON.parse(jsonStr);
        } catch (e) {}
      }
    }
  }
  return [];
}

async function testMain() {
  const url = 'https://yody.vn/nam';
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const prods = extractYodyProducts(res.data);
    console.log(`✅ [200] ${url} | products extracted: ${prods.length}`);
    if (prods.length > 0) {
      console.log('Sample product name:', prods[0].select_variant?.name);
    }
  } catch (err) {
    console.log(`❌ [${err.response?.status || 'ERR'}] ${url}`);
  }
}

testMain();
