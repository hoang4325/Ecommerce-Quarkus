const axios = require('axios');
const API_URL = 'http://localhost:8086/api';

async function checkDb() {
  try {
    const prodRes = await axios.get(`${API_URL}/products?size=2000`);
    const products = prodRes.data.data.content;
    const catRes = await axios.get(`${API_URL}/categories`);
    const categories = catRes.data.data;

    console.log(`\n================ DATABASE SUMMARY ================`);
    console.log(`Tổng số Categories: ${categories.length}`);
    categories.forEach(c => {
      const count = products.filter(p => p.categoryId === c.id).length;
      console.log(`- Danh mục: "${c.name}" | ID: ${c.id} | Số sản phẩm: ${count}`);
    });
    console.log(`--------------------------------------------------`);
    console.log(`Tổng số sản phẩm hiện tại: ${products.length}`);
    console.log(`==================================================\n`);
  } catch (err) {
    console.error('Lỗi khi lấy dữ liệu:', err.message);
  }
}

checkDb();
