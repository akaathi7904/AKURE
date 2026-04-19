const supabase = require('../config/supabase');

/**
 * GET /api/products
 * - Supports query params: category, page (default 1), limit (default 12)
 */
const getProducts = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 12, search } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({
      data,
      meta: { total: count, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      const err = new Error('Product not found');
      err.status = 404;
      throw err;
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProductById };
