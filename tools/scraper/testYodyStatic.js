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
    console.log('HTML Length:', html.length);
    
    // Look for product names or image URLs or price patterns in the static HTML
    const includesJeans = html.includes('Jeans') || html.includes('jeans');
    const includesPrice = html.includes('đ') || html.includes('VND');
    const includesYodycdn = html.includes('yodycdn.com');
    
    console.log('Contains "Jeans":', includesJeans);
    console.log('Contains "đ":', includesPrice);
    console.log('Contains "yodycdn.com":', includesYodycdn);
    
    // Let's print a sample of the HTML to see where the product data might be
    const index = html.indexOf('yodycdn.com');
    if (index !== -1) {
      console.log('Sample matching content:', html.substring(index - 100, index + 300));
    }
  } catch (err) {
    console.log('Error:', err.message);
  }
}

testYodyStatic();
