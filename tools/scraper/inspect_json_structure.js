const fs = require('fs');

try {
  const content = fs.readFileSync('script_sample_11.json', 'utf8');
  console.log('File length:', content.length);
  console.log('Starts with:', content.substring(0, 100));
  console.log('Ends with:', content.substring(content.length - 100));
} catch (err) {
  console.log('Error:', err.message);
}
