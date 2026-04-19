const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'public');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
const newLine = `<script>window.__AKURE_ENV__ = { SUPABASE_URL: 'https://ldlxruqfqgvvclwwjfgh.supabase.co', SUPABASE_ANON: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkbHhydXFmcWd2dmNsd3dqZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMzAzMDUsImV4cCI6MjA5MTYwNjMwNX0.iWLX17xU153PxozUAQ2ZpvfzCzrzSnrfOsCNYCm8-JY' };</script>`;

files.forEach(f => {
  let fp = path.join(dir, f);
  let content = fs.readFileSync(fp, 'utf8');
  content = content.replace(/<script>window\.__AKURE_ENV__[\s\S]*?<\/script>/, newLine);
  fs.writeFileSync(fp, content);
});
console.log('Fixed HTML files');

// Also safely copy .env.example to .env
if (fs.existsSync('.env.example')) {
  fs.copyFileSync('.env.example', '.env');
  console.log('Copied .env.example to .env');
}
