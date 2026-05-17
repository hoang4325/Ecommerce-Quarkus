/**
 * seed_reviews_sql.js
 * Inserts reviews directly into the product_db via psql
 * because the API enforces 1-review-per-user-per-product.
 */

const { execSync } = require('child_process');

const REVIEW_POOL = [
  { userName: 'Minh Tuan', rating: 5, comment: 'Chat luong vai rat tot, mac vao thoai mai. Mau sac chuan so voi anh, size M vua voi toi 65kg.' },
  { userName: 'Hoang Nam', rating: 4, comment: 'San pham dep, duong may chac chan. Minh mua size L vua van. Chat luong on ap, se mua lai.' },
  { userName: 'Quoc Bao', rating: 5, comment: 'Mua lan thu 2 roi, lan nao cung khong that vong. Vai day, khong xu long sau khi giat. Pham dang chuan.' },
  { userName: 'Van Hung', rating: 4, comment: 'Dep hon tuong tuong! Vai mem min, khong bi nhau. Cao 1m72 nang 70kg mua L vua chuan. Rat dang mua.' },
  { userName: 'Thanh Phong', rating: 5, comment: 'Shop dong goi can than, san pham y hinh. Chat lieu cao cap, mac vao mat, tham hut tot. Da mua 3 cai roi!' },
  { userName: 'Duy Khang', rating: 3, comment: 'Chat luong tam on voi muc gia. Mau hoi nhat hon anh mot chut nhung khong qua chenh lech.' },
  { userName: 'Trong Nghia', rating: 5, comment: 'Sieu pham! Mac mat, nhe, khong bi. Minh hay do mo hoi nhung chiec nay tham hut rat tot.' },
  { userName: 'Gia Hung', rating: 4, comment: 'Hang nhu hinh, vai mem, duong may dep. Minh mua XL cho rong rai, mac rat thoai mai.' },
  { userName: 'Phuc Lam', rating: 5, comment: 'Day la lan dau mua o day va cuc ky hai long. Chat vai tot, co gian nhe, mac rat de chiu.' },
  { userName: 'Bao Long', rating: 5, comment: 'Chat luong qua on voi gia tien. Vai cotton thoang mat, thich hop cho thoi tiet nong buc o mien Nam.' },
  { userName: 'Tan Phat', rating: 4, comment: 'Nhan hang nhanh hon du kien. Chat vai mem, nhe. Size M vua chuan nguoi 60kg, 1m68.' },
  { userName: 'Hai Dang', rating: 5, comment: 'Hang chat luong cao, dang dong tien bat gao. Phom dang dep, mac vao trong lich su hon nhieu.' },
];

const FAKE_USER_IDS = [
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000011',
];

function escape(str) {
  return str.replace(/'/g, "''");
}

function genUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function runSQL(sql) {
  return execSync(
    `docker exec ecommerce-postgres psql -U admin -d product_db -t -c "${sql.replace(/"/g, '\\"')}"`,
    { encoding: 'utf8', stdio: 'pipe' }
  );
}

function getProductIds() {
  const result = runSQL('SELECT id FROM product WHERE active = true;');
  return result
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^[0-9a-f-]{36}$/.test(l));
}

function getReviewCounts() {
  try {
    const result = runSQL('SELECT product_id, COUNT(*) FROM product_review GROUP BY product_id;');
    const counts = {};
    result.split('\n').forEach((line) => {
      const parts = line.trim().split('|').map((p) => p.trim());
      if (parts.length === 2 && /^[0-9a-f-]{36}$/.test(parts[0])) {
        counts[parts[0]] = parseInt(parts[1], 10);
      }
    });
    return counts;
  } catch (e) {
    console.warn('Could not get review counts, assuming 0.');
    return {};
  }
}

function buildRows(productIds, counts) {
  const rows = [];
  for (const productId of productIds) {
    const existing = counts[productId] ?? 0;
    const needed = Math.max(0, 4 - existing); // aim for at least 4 reviews
    if (needed === 0) continue;

    const offset = parseInt(productId.replace(/-/g, '').slice(-2), 16) % REVIEW_POOL.length;
    for (let i = 0; i < needed; i++) {
      const review = REVIEW_POOL[(offset + i) % REVIEW_POOL.length];
      // Use different fake user IDs to bypass uniqueness constraint on product+user
      const userId = FAKE_USER_IDS[(i + existing) % FAKE_USER_IDS.length];
      const id = genUUID();
      // Randomise date within last 60 days
      const daysAgo = Math.floor(Math.random() * 60);
      const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
        .toISOString()
        .replace('T', ' ')
        .replace('Z', '');
      rows.push(
        `('${id}','${productId}','${userId}','${escape(review.userName)}',${review.rating},'${escape(review.comment)}','${date}','${date}')`
      );
    }
  }
  return rows;
}

function main() {
  console.log('📦 Getting product IDs...');
  const productIds = getProductIds();
  console.log(`  Found ${productIds.length} active products`);

  console.log('📊 Getting existing review counts...');
  const counts = getReviewCounts();

  const rows = buildRows(productIds, counts);
  if (rows.length === 0) {
    console.log('✅ All products already have enough reviews!');
    return;
  }

  console.log(`📝 Need to insert ${rows.length} reviews...`);
  let inserted = 0;

  // Insert in batches of 20 (avoid too-long SQL strings)
  for (let i = 0; i < rows.length; i += 20) {
    const chunk = rows.slice(i, i + 20);
    const sql =
      `INSERT INTO product_review (id, product_id, user_id, user_name, rating, comment, created_at, updated_at) VALUES ` +
      chunk.join(', ') +
      ` ON CONFLICT DO NOTHING;`;
    try {
      runSQL(sql);
      inserted += chunk.length;
      process.stdout.write(`  Inserted ${inserted}/${rows.length}...\r`);
    } catch (e) {
      console.error('\n❌ Batch failed:', e.stderr?.slice(0, 300) || e.message.slice(0, 200));
    }
  }

  console.log(`\n🎉 Done! Inserted ${inserted} reviews across ${productIds.length} products.`);
}

main();
