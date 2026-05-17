/**
 * seed_reviews.js
 * Seeds realistic Vietnamese reviews for every product in the system.
 * Usage: node tools/scraper/seed_reviews.js
 * Requires: npm install axios  (already present via test_thresholds)
 */

const axios = require('axios');

const BASE = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@ecommerce.com';
const ADMIN_PASSWORD = 'admin123';

// Pool of realistic Vietnamese reviewers & comments
const REVIEW_POOL = [
  { userName: 'Minh Tuấn', rating: 5, comment: 'Chất lượng vải rất tốt, mặc vào thoải mái, không bị ngứa hay khó chịu. Màu sắc chuẩn so với ảnh, size M vừa với tôi 65kg. Sẽ ủng hộ shop dài dài!' },
  { userName: 'Hoàng Nam', rating: 4, comment: 'Sản phẩm đẹp, đường may chắc chắn. Mình mua size L vừa vặn. Chỉ trừ 1 sao vì giao hàng hơi lâu, nhưng chất lượng thì ổn áp. Recommend cho mọi người!' },
  { userName: 'Quốc Bảo', rating: 5, comment: 'Mua lần thứ 2 rồi, lần nào cũng không thất vọng. Vải dày, không xù lông sau khi giặt. Phom dáng chuẩn, mặc đi làm rất lịch sự.' },
  { userName: 'Văn Hùng', rating: 4, comment: 'Đẹp hơn tưởng tượng! Vải mềm mịn, không bị nhàu. Mình cao 1m72 nặng 70kg mua L vừa chuẩn. Giá này thì quá ổn, sẽ mua thêm màu khác.' },
  { userName: 'Thanh Phong', rating: 5, comment: 'Shop đóng gói cẩn thận, sản phẩm y hình. Chất liệu cao cấp, mặc vào mát, thấm hút tốt. Đã mua 3 cái rồi và cái nào cũng đẹp!' },
  { userName: 'Duy Khang', rating: 3, comment: 'Chất lượng tạm ổn với mức giá. Màu hơi nhạt hơn ảnh một chút nhưng không quá chênh lệch. Sẽ giặt thêm vài lần xem có bị phai không.' },
  { userName: 'Trọng Nghĩa', rating: 5, comment: 'Siêu phẩm! Mặc mát, nhẹ, không bí. Mình hay đổ mồ hôi nhưng chiếc này thấm hút rất tốt. Mua 2 cái một lúc, cả 2 đều ok.' },
  { userName: 'Gia Hưng', rating: 4, comment: 'Hàng như hình, vải mềm, đường may đẹp. Mình mua XL cho rộng rãi, mặc rất thoải mái. Giá bình dân nhưng chất không hề rẻ.' },
  { userName: 'Phúc Lâm', rating: 5, comment: 'Đây là lần đầu mua ở đây và cực kỳ hài lòng. Chất vải tốt, co giãn nhẹ, mặc rất dễ chịu. Giao hàng nhanh, đóng gói đẹp. 5 sao toàn phần!' },
  { userName: 'Minh Đức', rating: 4, comment: 'Mua về cho ba làm quà, ổng mặc rất vừa ý. Vải dày dặn, không nhìn thấu trong ánh sáng. Màu cũng đẹp, giống hình. Sẽ mua thêm!' },
  { userName: 'Bảo Long', rating: 5, comment: 'Chất lượng quá ổn với giá tiền. Vải cotton thoáng mát, thích hợp cho thời tiết nóng bức ở miền Nam. Mua rồi mua lại, không thất vọng lần nào.' },
  { userName: 'Tấn Phát', rating: 4, comment: 'Nhìn thật hơn ảnh. Chất vải mềm, nhẹ. Size tôi mua M vừa chuẩn người 60kg, 1m68. Màu đẹp, không bị phai sau 5 lần giặt.' },
  { userName: 'Hải Đăng', rating: 5, comment: 'Hàng chất lượng cao, đáng đồng tiền bát gạo. Phom dáng đẹp, mặc vào trông lịch sự hơn nhiều so với tưởng tượng. Sẽ giới thiệu cho bạn bè!' },
  { userName: 'Công Tuấn', rating: 3, comment: 'Ổn với tầm giá. Size hơi nhỏ hơn bình thường nên tôi khuyên nên lên 1 size. Chất vải trung bình, nhưng màu đẹp đúng với ảnh.' },
  { userName: 'Xuân Thịnh', rating: 5, comment: 'Cực kỳ hài lòng! Đây là lần thứ 3 tôi mua sản phẩm này. Chất vải tốt, bền, không bị co sau khi giặt máy nhiều lần. Giao hàng siêu nhanh!' },
  { userName: 'Ngọc Tuấn', rating: 4, comment: 'Sản phẩm đẹp như hình, chất lượng ổn áp. Tôi cao 1m75, 72kg mua L vừa đẹp. Vải thoáng mát, thích hợp mặc quanh năm ở Sài Gòn.' },
  { userName: 'Anh Kiệt', rating: 5, comment: 'Hàng ngon, giá tốt. Vải mịn, mặc không bị ngứa, màu giữ tốt. Mua 4 cái đủ màu về mặc cả tuần. Shop ship nhanh, đóng gói cẩn thận.' },
  { userName: 'Trung Hiếu', rating: 4, comment: 'Nhận hàng nhanh hơn dự kiến. Sản phẩm chất lượng, vải dày vừa phải, không quá nóng. Màu thực tế đẹp hơn ảnh một chút. Rất đáng mua!' },
];

// Shuffle array deterministically for a product
function getReviewsForProduct(productId) {
  // Use product id last char code as seed offset
  const offset = productId.charCodeAt(productId.length - 1) % REVIEW_POOL.length;
  const rotated = [...REVIEW_POOL.slice(offset), ...REVIEW_POOL.slice(0, offset)];
  return rotated.slice(0, 5); // At least 5 reviews per product
}

async function getAdminToken() {
  const res = await axios.post(`${BASE}/api/auth/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  return res.data?.data?.access_token || res.data?.data?.accessToken;
}

async function getAllProducts(token) {
  const res = await axios.get(`${BASE}/api/products?page=0&size=500`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data?.data?.content ?? [];
}

async function getExistingReviews(productId, token) {
  try {
    const res = await axios.get(`${BASE}/api/products/${productId}/reviews?page=0&size=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.data?.totalElements ?? 0;
  } catch {
    return 0;
  }
}

async function createReview(productId, review, token) {
  await axios.post(
    `${BASE}/api/products/${productId}/reviews`,
    { rating: review.rating, comment: review.comment },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

async function main() {
  console.log('🔐 Logging in as admin...');
  let token;
  try {
    token = await getAdminToken();
  } catch (e) {
    console.error('❌ Login failed:', e.response?.data || e.message);
    process.exit(1);
  }
  console.log('✅ Got admin token');

  console.log('📦 Fetching all products...');
  const products = await getAllProducts(token);
  console.log(`Found ${products.length} products`);

  let created = 0;
  let skipped = 0;

  for (const product of products) {
    const existingCount = await getExistingReviews(product.id, token);

    if (existingCount >= 3) {
      console.log(`  ⏭️  ${product.name} — already has ${existingCount} reviews, skipping`);
      skipped++;
      continue;
    }

    const reviews = getReviewsForProduct(product.id);
    const toCreate = reviews.slice(0, Math.max(3, reviews.length));

    console.log(`  📝 ${product.name} — creating ${toCreate.length} reviews...`);
    for (const review of toCreate) {
      try {
        await createReview(product.id, review, token);
        created++;
        // Small delay to avoid hammering the server
        await new Promise((r) => setTimeout(r, 80));
      } catch (e) {
        console.warn(`    ⚠️  Failed to create review: ${e.response?.data?.message || e.message}`);
      }
    }
    console.log(`    ✅ Done for ${product.name}`);
  }

  console.log(`\n🎉 Seed complete! Created ${created} reviews, skipped ${skipped} products.`);
}

main().catch((e) => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
