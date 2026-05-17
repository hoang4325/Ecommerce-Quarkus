const axios = require('axios');

const API_URL = 'http://localhost:8086/api';

const targetAuNamNames = [
  'QUẦN GIÓ NAM CHỐNG THẤM NƯỚC',
  'QUẦN DÀI NGƯỜI LỚN VIETNAM ON THE PITCH',
  'QUẦN GIÓ ACTIVE NAM CHỐNG THẤM NƯỚC',
  'QUẦN NỈ NAM WICKING, ANTI UV, EASY CARE'
].map(n => n.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, ""));

async function deleteRequestedAuNam() {
  try {
    const authRes = await axios.post(`http://localhost:8082/api/auth/login`, {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    const token = authRes.data.data.access_token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Đăng nhập admin thành công!');

    // 1. Fetch all products
    const prodRes = await axios.get(`${API_URL}/products?size=2000`);
    const products = prodRes.data.data.content;
    console.log(`✅ Đã tải ${products.length} sản phẩm từ cơ sở dữ liệu.`);

    let deletedCount = 0;

    for (const p of products) {
      const normName = p.name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
      
      const isTarget = targetAuNamNames.some(t => normName.includes(t) || t.includes(normName));

      if (isTarget) {
        console.log(`🗑️ Thực hiện xóa sản phẩm: "${p.name}"`);
        try {
          // Delete inventory first
          try {
            await axios.delete(`${API_URL}/inventory/${p.id}`);
          } catch (e) {}
          
          await axios.delete(`${API_URL}/products/${p.id}`);
          deletedCount++;
        } catch (err) {
          console.error(`  ❌ Lỗi khi xóa sản phẩm ${p.id}:`, err.message);
        }
      }
    }

    // 2. Fetch and print remaining products in Quần Âu Nam category
    const catRes = await axios.get(`${API_URL}/categories`);
    const categories = catRes.data.data;
    const auNamCat = categories.find(c => c.name === 'Quần Âu Nam');

    if (auNamCat) {
      console.log(`\n--- 👖 Danh sách Quần Âu Nam còn lại (ID: ${auNamCat.id}) ---`);
      const prodResUpdated = await axios.get(`${API_URL}/products?categoryId=${auNamCat.id}&size=100`);
      prodResUpdated.data.data.content.forEach(p => {
        console.log(`[${p.id}] "${p.name}" | Image: ${p.imageUrl}`);
      });
    }

    console.log('\n==================================================');
    console.log(`🎉 HOÀN THÀNH XÓA CÁC SẢN PHẨM QUẦN ÂU THEO YÊU CẦU! ĐÃ XÓA ${deletedCount} SẢN PHẨM! 🎉`);
    console.log('==================================================');

  } catch (err) {
    console.error('Error during deletion:', err.message);
  }
}

deleteRequestedAuNam();
