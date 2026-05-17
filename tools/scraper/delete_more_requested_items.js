const axios = require('axios');

const API_URL = 'http://localhost:8086/api';

const targetNames = [
  'Quần dài nam dáng regular',
  'Áo len nam cổ tròn',
  'Áo len nam cộc tay dáng suông',
  'Áo len nam',
  'Áo len nam cổ tim',
  'Áo len nam dệt kẻ có hình thêu',
  'Áo polo len nam ngắn tay cotton linen dáng rộng',
  'Áo len nam cotton linen ngắn tay cổ tròn'
].map(n => n.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, ""));

async function deleteMoreRequested() {
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
      
      const isTarget = targetNames.includes(normName);

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

    console.log('\n==================================================');
    console.log(`🎉 HOÀN THÀNH XÓA CÁC SẢN PHẨM THEO YÊU CẦU! ĐÃ XÓA ${deletedCount} SẢN PHẨM! 🎉`);
    console.log('==================================================');

  } catch (err) {
    console.error('Error during deletion:', err.message);
  }
}

deleteMoreRequested();
