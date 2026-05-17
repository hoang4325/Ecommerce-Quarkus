const axios = require('axios');

async function testYodyStatic() {
  const url = 'https://yody.vn/quan-jeans-nam';
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = res.data;
    
    // Let's find matches of image links: https://*.yodycdn.com/...
    const imgRegex = /https:\/\/[^\s"'<>\\]+yodycdn\.com\/[^\s"'<>\\]+\.(webp|jpg|png|jpeg)/g;
    const images = html.match(imgRegex) || [];
    console.log(`Found ${images.length} image matches! Sample:`, [...new Set(images)].slice(0, 10));

    // Let's find matches of product details path or href:
    // On Yody, product links are usually /quan-jeans-nam-something or /ao-polo-nam-something
    const hrefRegex = /href="\/([a-z0-9-]+)"/g;
    let match;
    const hrefs = [];
    while ((match = hrefRegex.exec(html)) !== null) {
      hrefs.push(match[1]);
    }
    console.log(`Found ${hrefs.length} href links! Sample:`, [...new Set(hrefs)].slice(0, 20));

  } catch (err) {
    console.log('Error:', err.message);
  }
}

testYodyStatic();
