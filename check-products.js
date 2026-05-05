const axios = require('axios');
async function check() {
  try {
    const res = await axios.get('http://localhost:8083/api/products');
    console.log(JSON.stringify(res.data.data.content, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}
check();
