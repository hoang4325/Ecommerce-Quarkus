const puppeteer = require('puppeteer');
const axios = require('axios');

// Configure our local API endpoint
const API_URL = 'http://localhost:8086/api';

const autoSlug = (name) => {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

const formatPrice = (priceText) => {
  const numericStr = priceText.replace(/[^0-9]/g, '');
  return parseInt(numericStr) || 250000;
};

async function scrapeAndSeed() {
  try {
    // 1. Log in to get authentication token
    const authRes = await axios.post(`http://localhost:8082/api/auth/login`, {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    const token = authRes.data.data.access_token;
    if (!token) throw new Error("No token returned");
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Đăng nhập admin thành công!');
  } catch (err) {
    console.error('❌ Đăng nhập thất bại. Kiểm tra xem backend đã chạy chưa:', err.message);
    return;
  }

  // 2. Fetch existing products to build deduplication sets
  const existingNames = new Set();
  const existingSlugs = new Set();
  try {
    console.log('🔄 Đang đồng bộ danh sách sản phẩm hiện tại để tránh trùng lặp...');
    const prodRes = await axios.get(`${API_URL}/products?size=2000`);
    if (prodRes.data && prodRes.data.data && prodRes.data.data.content) {
      for (const p of prodRes.data.data.content) {
        existingNames.add(p.name.trim().toLowerCase());
        existingSlugs.add(p.slug.trim().toLowerCase());
      }
      console.log(`✅ Đồng bộ thành công! Hiện có ${existingNames.size} sản phẩm trong hệ thống.`);
    }
  } catch (err) {
    console.warn('⚠️ Không thể tải danh sách sản phẩm hiện tại để đối chiếu:', err.message);
  }

  console.log('🚀 Khởi động trình duyệt cào dữ liệu...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    // Target these specific trousers collections that we just verified
    const MAX_PAGES_PER_CATEGORY = 8; 
    const targets = [
      { name: 'Quần Jeans Nam', url: 'https://torano.vn/collections/quan-jeans' },
      { name: 'Quần Âu Nam', url: 'https://torano.vn/collections/quan-au' },
      { name: 'Quần Kaki Nam', url: 'https://torano.vn/collections/quan-kaki-basic' }
    ];

    for (const target of targets) {
      console.log(`\n===========================================`);
      console.log(`📁 Danh mục: ${target.name}`);
      
      // A. Create or Fetch Category ID
      let categoryId = null;
      try {
        const catRes = await axios.post(`${API_URL}/categories`, {
          name: target.name,
          slug: autoSlug(target.name)
        });
        categoryId = catRes.data.data.id;
        console.log(`➕ Đã tạo Category trong DB với ID: ${categoryId}`);
      } catch (err) {
        // Fetch existing category if creation fails
        const allCats = await axios.get(`${API_URL}/categories`);
        const existing = allCats.data.data.find(c => c.name === target.name);
        if (existing) {
          categoryId = existing.id;
          console.log(`ℹ️ Danh mục đã tồn tại, dùng ID: ${categoryId}`);
        } else {
          console.error(`❌ Bỏ qua danh mục ${target.name} do lỗi.`);
          continue;
        }
      }

      // B. Iterate through pages
      for (let pNum = 1; pNum <= MAX_PAGES_PER_CATEGORY; pNum++) {
        const pageUrl = `${target.url}?page=${pNum}`;
        console.log(`\n--- 📄 Trang ${pNum}: ${pageUrl} ---`);
        
        try {
          await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 60000 });
          
          // Wait for products to load
          try {
            await page.waitForSelector('.product-loop', { timeout: 10000 });
          } catch (e) {
            console.log(`Không tìm thấy .product-loop trên trang ${pNum}.`);
          }

          const products = await page.evaluate(() => {
            const items = [];
            const productNodes = document.querySelectorAll('.product-loop');

            productNodes.forEach(node => {
              const titleEl = node.querySelector('.proloop-title a, .product-name a, h3 a');
              const priceEl = node.querySelector('.proloop-price, .current-price, .price');
              const imgEl = node.querySelector('.proloop-image img, .product-image img, img');

              if (titleEl && priceEl && imgEl) {
                const title = titleEl.innerText.trim();
                const price = priceEl.innerText.trim();
                const img = imgEl.getAttribute('data-src') || imgEl.getAttribute('src') || imgEl.getAttribute('data-lazyload');
                
                if (title && price && img && !img.includes('logo.png') && img.length > 10) {
                  items.push({ name: title, price, image: img });
                }
              }
            });
            return items;
          });

          if (products.length === 0) {
            console.log(`Không tìm thấy sản phẩm ở trang ${pNum}. Chuyển danh mục khác.`);
            break;
          }

          console.log(`🔍 Tìm thấy ${products.length} sản phẩm trên web. Đang lọc & lưu vào DB...`);

          // C. Save to DB sequentially to avoid locking and handle stock perfectly
          let successCount = 0;
          let skipCount = 0;

          for (const p of products) {
            const lowerName = p.name.trim().toLowerCase();
            const slug = autoSlug(p.name);

            // DEDUPLICATION GATEWAY
            if (existingNames.has(lowerName) || existingSlugs.has(slug)) {
              skipCount++;
              continue;
            }

            try {
              let imageUrl = p.image;
              if (imageUrl && imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;

              // Insert product
              const prodPostRes = await axios.post(`${API_URL}/products`, {
                name: p.name,
                slug: slug, 
                price: formatPrice(p.price) || 290000,
                categoryId: categoryId,
                imageUrl: imageUrl,
                description: `Quần ${p.name} phom dáng đứng lịch lãm, chất vải mềm mịn bền bỉ, dễ dàng phối hợp trang phục hàng ngày.`
              });

              const newProd = prodPostRes.data.data;
              if (newProd && newProd.id) {
                // Initialize stock inventory
                try {
                  await axios.post(`${API_URL}/inventory`, {
                    productId: newProd.id,
                    productName: newProd.name,
                    quantity: Math.floor(Math.random() * 80) + 20 // random stock 20 to 100
                  });
                } catch (invErr) {
                  console.error(`⚠️ Lỗi tạo kho cho ${p.name}: ${invErr.message}`);
                }

                // Add to existing sets to prevent duplicate in same batch
                existingNames.add(lowerName);
                existingSlugs.add(slug);
                successCount++;
              }
            } catch (err) {
              // Log error silently if it's a conflict or other network error
            }
          }

          console.log(`✅ Kết quả: Đã thêm mới ${successCount} sản phẩm, Bỏ qua ${skipCount} sản phẩm trùng.`);
          
        } catch (pageErr) {
          console.error(`❌ Lỗi khi xử lý trang ${pNum}:`, pageErr.message);
          break;
        }
      }
    }

  } catch (error) {
    console.error('Lỗi nghiêm trọng:', error);
  } finally {
    await browser.close();
    console.log('\n>>> 🎉 HOÀN TẤT CÀO QUẦN NAM <<<');
  }
}

scrapeAndSeed();
