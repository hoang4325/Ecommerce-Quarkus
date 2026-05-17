/**
 * seed_product_attributes.js
 * Updates all products in product_db with color, product_size, dress_style
 * using a deterministic hash so the frontend filter can match real DB values.
 */

const { execSync } = require('child_process');

// Must match EXACTLY what ProductListPage.tsx uses as filter values
const COLORS_HEX = [
  '#00C12B', '#F50606', '#F5DD06', '#F57906',
  '#06CAF5', '#063AF5', '#7D06F5', '#F506A4',
  '#FFFFFF', '#000000',
];
const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
const STYLES = ['Casual', 'Formal', 'Party', 'Gym'];

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getAttrs(id) {
  const h = hashCode(id);
  return {
    color: COLORS_HEX[h % COLORS_HEX.length],
    size: SIZES[(h >> 3) % SIZES.length],
    style: STYLES[(h >> 6) % STYLES.length],
  };
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
    .map(l => l.trim())
    .filter(l => /^[0-9a-f-]{36}$/.test(l));
}

function main() {
  console.log('📦 Getting product IDs...');
  const ids = getProductIds();
  console.log(`  Found ${ids.length} products`);

  let updated = 0;
  for (let i = 0; i < ids.length; i += 20) {
    const chunk = ids.slice(i, i + 20);
    const cases = {
      color: chunk.map(id => `WHEN '${id}' THEN '${getAttrs(id).color}'`).join(' '),
      size: chunk.map(id => `WHEN '${id}' THEN '${getAttrs(id).size}'`).join(' '),
      style: chunk.map(id => `WHEN '${id}' THEN '${getAttrs(id).style}'`).join(' '),
    };
    const inList = chunk.map(id => `'${id}'`).join(',');
    const sql =
      `UPDATE product SET ` +
      `color = CASE id ${cases.color} END, ` +
      `product_size = CASE id ${cases.size} END, ` +
      `dress_style = CASE id ${cases.style} END ` +
      `WHERE id IN (${inList});`;
    try {
      runSQL(sql);
      updated += chunk.length;
      process.stdout.write(`  Updated ${updated}/${ids.length}...\r`);
    } catch (e) {
      console.error('\n❌ Batch failed:', e.stderr?.slice(0, 300) || e.message.slice(0, 200));
    }
  }
  console.log(`\n✅ Done! Updated ${updated} products with color/size/style.`);

  // Show distribution
  try {
    const dist = runSQL('SELECT color, COUNT(*) FROM product WHERE active=true GROUP BY color ORDER BY color;');
    console.log('\nColor distribution:\n' + dist);
    const sdist = runSQL('SELECT product_size, COUNT(*) FROM product WHERE active=true GROUP BY product_size ORDER BY product_size;');
    console.log('Size distribution:\n' + sdist);
  } catch (_) { }
}

main();
