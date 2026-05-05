const axios = require('axios');

const API_URL = 'http://localhost:8086/api';
const AUTH_URL = 'http://localhost:8082/api/auth/login';

async function clearDb() {
  try {
    // 1. Login
    console.log('Logging in...');
    const authRes = await axios.post(AUTH_URL, {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    const token = authRes.data.data.access_token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Login successful!');

    // 2. Delete all products
    console.log('Fetching products...');
    const prodRes = await axios.get(`${API_URL}/products?size=200`);
    const products = prodRes.data.data.content;
    console.log(`Found ${products.length} products to delete.`);

    for (const p of products) {
      await axios.delete(`${API_URL}/products/${p.id}`);
      process.stdout.write('.');
    }
    console.log('\nAll products deleted.');

    // 3. Delete all categories
    console.log('Fetching categories...');
    const catRes = await axios.get(`${API_URL}/categories`);
    const categories = catRes.data.data;
    console.log(`Found ${categories.length} categories to delete.`);

    for (const c of categories) {
      try {
        await axios.post(`${API_URL}/categories/${c.id}/delete`); // Some APIs might use different delete paths
      } catch {
        // Fallback to standard delete if available or just ignore if not supported by simple CRUD
        // Let's check the productApi.ts again for category delete
      }
    }
    // Actually, I'll just check productApi.ts first.
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

clearDb();
