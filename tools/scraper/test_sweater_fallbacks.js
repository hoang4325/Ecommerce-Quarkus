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

const urls = [
  'https://www.coolmate.me/collection/ao-len',
  'https://www.coolmate.me/collection/ao-len-nam',
  'https://yody.vn/ao-cardigan-nu',
  'https://yody.vn/ao-khoac-cardigan-nam'
];

async function testPaths() {
  console.log('Testing sweater fallback paths...');
  for (const url of urls) {
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (url.includes('yody.vn')) {
        const prods = extractYodyProducts(res.data);
        console.log(`✅ [200] ${url} | Yody products extracted: ${prods.length}`);
      } else {
        console.log(`✅ [200] ${url} (length: ${res.data.length})`);
      }
    } catch (err) {
      console.log(`❌ [${err.response?.status || 'ERR'}] ${url}`);
    }
  }
}

testPaths();
