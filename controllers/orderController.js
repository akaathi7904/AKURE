const supabase = require('../config/supabase');

/**
 * POST /api/orders
 * Body: { items: [{product_id, quantity, price}], shipping_address, total }
 * Requires auth
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, shipping_address, total } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      const err = new Error('Order items are required');
      err.status = 400;
      throw err;
    }

    // 1. Create order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: req.user.id,
        status: 'confirmed',
        total,
        shipping_address,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // 3. Update product stock
    for (const item of items) {
      await supabase.rpc('decrement_stock', {
        p_id: item.product_id,
        qty: item.quantity,
      });
    }

    res.status(201).json({ order, message: 'Order placed successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders
 * Returns orders for the authenticated user
 */
const getUserOrders = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, images))')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getUserOrders };
