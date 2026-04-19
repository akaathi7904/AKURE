require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const IMAGES = {
  'Cold-Pressed Coconut Oil': [
    'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=700&q=80',
    'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=700&q=80',
  ],
  'Wild Forest Honey': [
    'https://images.unsplash.com/photo-1587049352847-81a56d773c1c?w=700&q=80',
    'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=700&q=80',
  ],
  'Moringa Leaf Powder': [
    'https://images.unsplash.com/photo-1515586000433-45406d8e6662?w=700&q=80',
    'https://images.unsplash.com/photo-1563821035272-3f19119280ad?w=700&q=80',
  ],
  'Black Seed Oil': [
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=700&q=80',
    'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=700&q=80',
  ],
  'Turmeric Root Powder': [
    'https://images.unsplash.com/photo-1615486171448-4fdcb708d745?w=700&q=80',
    'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=700&q=80',
  ],
  'Raw Beeswax Lip Balm': [
    'https://images.unsplash.com/photo-1584949091598-a6208b082101?w=700&q=80',
    'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=700&q=80',
  ],
};

async function run() {
  console.log('🌿 Updating product images in Supabase...\n');
  const { data: products, error } = await supabase.from('products').select('id, name');
  if (error) { console.error('Error fetching products:', error.message); process.exit(1); }

  for (const product of products) {
    const images = IMAGES[product.name];
    if (!images) { console.log(`  ⏭  No image mapping for: ${product.name}`); continue; }
    const { error: updateErr } = await supabase
      .from('products')
      .update({ images })
      .eq('id', product.id);
    if (updateErr) {
      console.error(`  ✕  Failed to update ${product.name}:`, updateErr.message);
    } else {
      console.log(`  ✓  Updated: ${product.name}`);
    }
  }
  console.log('\n✅ Done!');
}

run();
