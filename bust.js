const fs = require('fs');
const path = require('path');
const d = path.join(__dirname, 'public');

const ts = Date.now();
const files = fs.readdirSync(d).filter(f => f.endsWith('.html'));

files.forEach(f => {
  let p = path.join(d, f);
  let c = fs.readFileSync(p, 'utf8');
  // Replace href="/css/global.css" with href="/css/global.css?v=TS"
  c = c.replace(/href=\"\/css\/global\.css(\?v=\d+)?\"/g, `href="/css/global.css?v=${ts}"`);
  fs.writeFileSync(p, c);
});

console.log('Cache bust applied!');
