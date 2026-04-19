const fs = require('fs');
const path = require('path');
const d = path.join(__dirname, 'public');

const files = fs.readdirSync(d).filter(f => f.endsWith('.html'));

files.forEach(f => {
  let p = path.join(d, f);
  let c = fs.readFileSync(p, 'utf8');

  // Replace header navbar logo style
  c = c.replace(/style="height: 48px; width: auto; margin: 0; padding: 0;"/g, 'style="height: 120px; width: auto; margin: -30px 0; max-height: unset; object-fit: contain; transform: scale(1.6); transform-origin: left center;"');
  
  // Apply a simpler regex match to catch variations just in case
  c = c.replace(/height:\s*48px;\s*width:\s*auto;[^\"]*\"/g, 'height: 48px; width: auto; transform: scale(3.5); transform-origin: left center;"');
  c = c.replace(/height:\s*64px;\s*width:\s*auto;[^\"]*\"/g, 'height: 64px; width: auto; transform: scale(4); transform-origin: bottom center; margin-bottom: 3rem;"');

  fs.writeFileSync(p, c);
});

console.log('Logos scaled up massively!');
