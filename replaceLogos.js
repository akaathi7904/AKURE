const fs = require('fs');
const path = require('path');
const d = path.join(__dirname, 'public');

const files = fs.readdirSync(d).filter(f => f.endsWith('.html'));

const navLogoImg = `<img src="/images/logo-bg.png" alt="AKURE" style="height: 48px; width: auto; mix-blend-mode: multiply; margin: 0; padding: 0;" />`;
const footerLogoImg = `<img src="/images/logo-bg.png" alt="AKURE" style="height: 64px; width: auto; mix-blend-mode: multiply; margin-bottom: 1rem;" />`;

files.forEach(f => {
  let p = path.join(d, f);
  let c = fs.readFileSync(p, 'utf8');

  // Replace navbar logo
  c = c.replace(/<a href="\/" class="navbar__logo"[^>]*>.*?<\/a>/gs, `<a href="/" class="navbar__logo" style="display:flex; align-items:center;">${navLogoImg}</a>`);
  
  // Replace footer logo (both div and a versions)
  c = c.replace(/<(div|a)[^>]*class="footer__logo"[^>]*>.*?<\/\1>/gs, `<a href="/" class="footer__logo" style="display:block;">${footerLogoImg}</a>`);

  fs.writeFileSync(p, c);
});

console.log('Logos inserted successfully!');
