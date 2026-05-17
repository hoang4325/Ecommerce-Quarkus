const axios = require('axios');

const API_URL = 'http://localhost:8086/api';

async function inspectProducts() {
  try {
    const authRes = await axios.post(`http://localhost:8082/api/auth/login`, {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    const token = authRes.data.data.access_token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const catRes = await axios.get(`${API_URL}/categories`);
    const categories = catRes.data.data;

    const kakiCat = categories.find(c => c.name === 'Quần Kaki Nam');
    const lenCat = categories.find(c => c.name === 'Áo Len Nam');

    if (kakiCat) {
      console.log(`\n--- Quần Kaki Nam (ID: ${kakiCat.id}) ---`);
      const prodRes = await axios.get(`${API_URL}/products?categoryId=${kakiCat.id}&size=100`);
      prodRes.data.data.content.forEach(p => {
        console.log(`[${p.id}] ${p.name} | Image: ${p.imageUrl}`);
      });
    }

    if (lenCat) {
      console.log(`\n--- Áo Len Nam (ID: ${lenCat.id}) ---`);
      const prodRes = await axios.get(`${API_URL}/products?categoryId=${lenCat.id}&size=100`);
      prodRes.data.data.content.forEach(p => {
        console.log(`[${p.id}] ${p.name} | Image: ${p.imageUrl}`);
      });
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

inspectProducts();
