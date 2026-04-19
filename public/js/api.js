/* =====================================================
   AKURE - API Layer (api.js)
   Uses the Express backend when available and falls back
   to a static demo dataset on GitHub Pages.
   ===================================================== */

const BASE_URL = String(window.__AKURE_ENV__?.API_BASE_URL || '').replace(/\/+$/, '');
const DEMO_ORDER_KEY = 'akure_demo_orders';
let staticProductsPromise = null;

async function request(path, options = {}) {
  if (!BASE_URL) {
    throw new Error('API unavailable in static demo mode.');
  }

  const session = await AKURE.getSession?.();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

async function loadStaticProducts() {
  if (!staticProductsPromise) {
    staticProductsPromise = fetch(AKURE.pageUrl('data/products.json')).then(async (res) => {
      if (!res.ok) {
        throw new Error('Failed to load demo products.');
      }
      return res.json();
    });
  }
  return staticProductsPromise;
}

async function getStaticProducts({ category, page = 1, limit = 12, search } = {}) {
  let products = [...await loadStaticProducts()];

  if (category) {
    products = products.filter((product) => product.category === category);
  }
  if (search) {
    const term = search.toLowerCase();
    products = products.filter((product) => product.name.toLowerCase().includes(term));
  }

  const total = products.length;
  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit);

  return {
    data: products.slice(from, to),
    meta: { total, page: Number(page), limit: Number(limit), demo: true },
  };
}

async function getStaticProduct(id) {
  const products = await loadStaticProducts();
  const product = products.find((entry) => String(entry.id) === String(id));
  if (!product) throw new Error('Product not found');
  return product;
}

function getDemoOrders() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_ORDER_KEY)) || [];
  } catch {
    return [];
  }
}

function saveDemoOrders(orders) {
  localStorage.setItem(DEMO_ORDER_KEY, JSON.stringify(orders));
}

function createDemoOrder(payload) {
  const order = {
    id: `demo-${Date.now()}`,
    total: payload.total,
    status: 'demo',
    created_at: new Date().toISOString(),
    shipping_address: payload.shipping_address,
    items: payload.items,
  };

  const orders = getDemoOrders();
  orders.unshift(order);
  saveDemoOrders(orders);

  return { order };
}

async function getProducts({ category, page = 1, limit = 12, search } = {}) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (search) params.set('search', search);
  params.set('page', page);
  params.set('limit', limit);

  if (!BASE_URL) {
    return getStaticProducts({ category, page, limit, search });
  }

  try {
    return await request(`/products?${params}`);
  } catch (err) {
    if (AKURE.isStaticDemo()) {
      return getStaticProducts({ category, page, limit, search });
    }
    throw err;
  }
}

async function getProduct(id) {
  if (!BASE_URL) {
    return getStaticProduct(id);
  }

  try {
    return await request(`/products/${id}`);
  } catch (err) {
    if (AKURE.isStaticDemo()) {
      return getStaticProduct(id);
    }
    throw err;
  }
}

async function createOrder(payload) {
  if (!BASE_URL) {
    return createDemoOrder(payload);
  }

  try {
    return await request('/orders', { method: 'POST', body: JSON.stringify(payload) });
  } catch (err) {
    if (AKURE.isStaticDemo()) {
      return createDemoOrder(payload);
    }
    throw err;
  }
}

async function getUserOrders() {
  if (!BASE_URL) {
    return { orders: getDemoOrders() };
  }

  try {
    return await request('/orders');
  } catch (err) {
    if (AKURE.isStaticDemo()) {
      return { orders: getDemoOrders() };
    }
    throw err;
  }
}

window.AKURE = window.AKURE || {};
Object.assign(window.AKURE, { getProducts, getProduct, createOrder, getUserOrders });
