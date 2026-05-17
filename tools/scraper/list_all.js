const axios = require('axios');

const API_URL = 'http://localhost:8086/api';

async function listAllProducts() {
  try {
    const authRes = await axios.post(`http://localhost:8082/api/auth/login`, {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    const token = authRes.data.data.access_token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const prodRes = await axios.get(`${API_URL}/products?size=2000`);
    const products = prodRes.data.data.content;
    
    console.log(`\n--- Total ${products.length} Products in Database ---`);
    products.forEach(p => {
      console.log(`[${p.id}] "${p.name}"`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  }
}

listAllProducts();
