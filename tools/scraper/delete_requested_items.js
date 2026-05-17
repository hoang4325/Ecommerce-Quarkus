const axios = require('axios');

const API_URL = 'http://localhost:8086/api';

const targetLenNames = [
  'Áo Len Nam Slim Fit Nỉ Cao Cấp - Đen Huyền Bí (164)',
  'Áo Len Nam Mỏng Cổ Cao 5cm',
  'Áo Len Nam Cổ Tròn Cơ Bản',
  'Áo Len Nam Cổ Cao',
  'Áo Len Nam Cổ Bẻ',
  'Áo Len Nam Ngắn Tay Bo Gấu',
  'Áo Len Mùa Hè Họa Tiết Kẻ Nam'
].map(n => n.toLowerCase().trim());

const targetKakiNames = [
  'Quần dài nam dáng ôm',
  'Quần Kaki Nam Slimfit',
  'Quần Kaki Nam Lưng Cao Ống Ôm Co Giãn Nhẹ'
].map(n => n.toLowerCase().trim());

async function deleteRequestedItems() {
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
      const matchName = p.name.trim().toLowerCase();
      
      const isTargetLen = targetLenNames.includes(matchName);
      const isTargetKaki = targetKakiNames.includes(matchName);

      if (isTargetLen || isTargetKaki) {
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
    console.log(`🎉 HOÀN THÀNH XÓA TOÀN BỘ SẢN PHẨM THEO YÊU CẦU! ĐÃ XÓA ${deletedCount} SẢN PHẨM! 🎉`);
    console.log('==================================================');

  } catch (err) {
    console.error('Error during deletion:', err.message);
  }
}

deleteRequestedItems();
