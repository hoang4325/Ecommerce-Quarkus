const axios = require('axios');

const API_URL = 'http://localhost:8086/api';

async function searchSimilarKaki() {
  try {
    const authRes = await axios.post(`http://localhost:8082/api/auth/login`, {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    const token = authRes.data.data.access_token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const prodRes = await axios.get(`${API_URL}/products?size=2000`);
    const products = prodRes.data.data.content;

    const catRes = await axios.get(`${API_URL}/categories`);
    const categories = catRes.data.data;
    const catMap = {};
    categories.forEach(c => { catMap[c.id] = c.name; });
    
    console.log('\n--- 🔍 Search for similar products ---');
    products.forEach(p => {
      const name = p.name.toLowerCase();
      const catName = catMap[p.categoryId] || 'Unknown';
      if (name.includes('premium') || name.includes('dáng ôm') || name.includes('dang om') || name.includes('basic') || name.includes('kaki') || name.includes('khaki')) {
        console.log(`[${p.id}] "${p.name}" | Category: ${catName}`);
      }
    });

  } catch (err) {
    console.error('Error:', err.message);
  }
}

searchSimilarKaki();
