const supabase = require('../config/supabase');

// Helper to use Supabase Service Key client for admin operations so RLS doesn't block us
const { createClient } = require('@supabase/supabase-js');
const getAdminSupabase = () => {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
};

const getAdminStats = async (req, res, next) => {
  try {
    const adminSupa = getAdminSupabase();
    
    // Get total products
    const { count: productCount, error: pErr } = await adminSupa
      .from('products')
      .select('*', { count: 'exact', head: true });
      
    if (pErr) throw pErr;

    // We can also fetch total orders, but for now let's just return products count
    // Assuming you have an orders table, you can add that later

    res.json({
      totalProducts: productCount || 0
    });
  } catch (err) {
    next(err);
  }
};

const addProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock, is_limited_batch, images } = req.body;
    
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const adminSupa = getAdminSupabase();
    const { data, error } = await adminSupa
      .from('products')
      .insert([{
        name,
        description,
        price: Number(price),
        category,
        stock: Number(stock || 0),
        is_limited_batch: Boolean(is_limited_batch),
        images: Array.isArray(images) ? images : []
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock, is_limited_batch, images } = req.body;

    const authSupa = getAdminSupabase();
    const { data, error } = await authSupa
      .from('products')
      .update({
        name,
        description,
        price: price !== undefined ? Number(price) : undefined,
        category,
        stock: stock !== undefined ? Number(stock) : undefined,
        is_limited_batch: is_limited_batch !== undefined ? Boolean(is_limited_batch) : undefined,
        images: Array.isArray(images) ? images : undefined
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const authSupa = getAdminSupabase();
    
    const { error } = await authSupa
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Product deleted successfully', id });
  } catch (err) {
    next(err);
  }
};

const uploadImage = async (req, res, next) => {
  try {
    const { filename, base64, contentType } = req.body;
    if (!filename || !base64) return res.status(400).json({ error: 'Missing file data' });

    const buffer = Buffer.from(base64, 'base64');
    const path = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const adminSupa = getAdminSupabase();

    const { data, error } = await adminSupa.storage
      .from('products')
      .upload(path, buffer, {
        contentType: contentType || 'image/jpeg',
        upsert: false
      });

    if (error) throw error;

    const { data: publicData } = adminSupa.storage
      .from('products')
      .getPublicUrl(path);

    res.json({ url: publicData.publicUrl });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminStats,
  addProduct,
  updateProduct,
  deleteProduct,
  uploadImage
};
