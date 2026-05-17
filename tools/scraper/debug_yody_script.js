const axios = require('axios');
const fs = require('fs');

async function testYodyScript() {
  const url = 'https://yody.vn/quan-jeans-nam';
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = res.data;
    
    // Find script tags
    const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let count = 0;
    while ((match = scriptRegex.exec(html)) !== null) {
      const content = match[1];
      if (content.includes('window.__') || content.includes('__NUXT__') || content.includes('__NEXT_DATA__') || content.includes('price') || content.includes('data')) {
        console.log(`\n===========================================`);
        console.log(`Script tag #${count} (Length: ${content.length})`);
        console.log(content.substring(0, 1000));
        
        // Save a sample of the script to check it
        fs.writeFileSync(`script_sample_${count}.json`, content);
      }
      count++;
    }
  } catch (err) {
    console.log('Error:', err.message);
  }
}

testYodyScript();
