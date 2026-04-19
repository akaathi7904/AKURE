const { createClient } = require('@supabase/supabase-js');

let _client = null;

function getClient() {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key || url.includes('your_') || url.includes('YOUR_')) {
    const missing = [!url && 'URL', !key && 'KEY'].filter(Boolean).join(', ');
    console.warn(`[AKURE] Supabase missing or using placeholders (${missing}). Using mock data.`);
    return null;
  }

  try {
    _client = createClient(url, key);
    return _client;
  } catch (err) {
    console.warn(`[AKURE] Supabase initialization failed (${err.message}). Using mock data.`);
    return null;
  }
}

// ── Mock Data for unconfigured states ────────────────────────

const mockProducts = [
  { id: '1', name: 'Cold-Pressed Coconut Oil', description: 'Pure virgin coconut oil, hand-extracted.', price: 599, category: 'oils', stock: 50, is_limited_batch: false, images: ['https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=500&q=80'] },
  { id: '2', name: 'Wild Forest Honey', description: 'Raw, unfiltered wild honey.', price: 899, category: 'honey', stock: 20, is_limited_batch: true, images: ['https://images.unsplash.com/photo-1587049352847-81a56d773c1c?w=500&q=80'] },
  { id: '3', name: 'Moringa Leaf Powder', description: 'Certified organic moringa.', price: 449, category: 'herbs', stock: 100, is_limited_batch: false, images: ['https://images.unsplash.com/photo-1563821035272-3f19119280ad?w=500&q=80'] },
  { id: '4', name: 'Black Seed Oil', description: 'First cold-press Nigella sativa oil.', price: 799, category: 'oils', stock: 30, is_limited_batch: true, images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&q=80'] },
  { id: '5', name: 'Turmeric Root Powder', description: 'Stone-ground turmeric root.', price: 349, category: 'herbs', stock: 80, is_limited_batch: false, images: ['https://images.unsplash.com/photo-1615486171448-4fdcb708d745?w=500&q=80'] },
  { id: '6', name: 'Raw Beeswax Lip Balm', description: 'Artisan lip balm with raw beeswax.', price: 299, category: 'skincare', stock: 60, is_limited_batch: false, images: ['https://images.unsplash.com/photo-1584949091598-a6208b082101?w=500&q=80'] },
];

function mockQuery(table) {
  let data = [];
  if (table === 'products') data = [...mockProducts];
  if (table === 'orders') data = [];

  const q = {
    select: () => q,
    insert: () => q,
    update: () => q,
    delete: () => q,
    eq: (col, val) => {
      data = data.filter(item => item[col] == val);
      return q;
    },
    ilike: (col, val) => {
      const term = val.replace(/%/g, '').toLowerCase();
      data = data.filter(item => item[col] && item[col].toLowerCase().includes(term));
      return q;
    },
    range: (from, to) => {
      data = data.slice(from, to + 1);
      return q;
    },
    order: () => q,
    single: () => {
      data = data.length > 0 ? data[0] : null;
      return q;
    },
    then: (res, rej) => {
      if (q._isInsert) {
        return res({ data: { id: 'mock-order-123', total: 0 }, error: null });
      }
      return res({ data, count: mockProducts.length, error: null });
    }
  };

  // Sneaky intercept for inserts
  const insertOrig = q.insert;
  q.insert = (item) => {
    q._isInsert = true;
    return insertOrig(item);
  };

  return q;
}

const supabase = {
  from(table) {
    const client = getClient();
    return client ? client.from(table) : mockQuery(table);
  },
  rpc(fn, args) {
    const client = getClient();
    return client ? client.rpc(fn, args) : Promise.resolve({ error: null });
  },
};

module.exports = supabase;
