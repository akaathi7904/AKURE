/* =====================================================
   AKURE – API Layer (api.js)
   All calls go to the Express backend at /api/*
   ===================================================== */

const BASE_URL = '/api';

async function request(path, options = {}) {
  const session = await AKURE.getSession?.();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// ── Product API ───────────────────────────────────────
async function getProducts({ category, page = 1, limit = 12, search } = {}) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (search)   params.set('search', search);
  params.set('page', page);
  params.set('limit', limit);
  return request(`/products?${params}`);
}

async function getProduct(id) {
  return request(`/products/${id}`);
}

// ── Order API ─────────────────────────────────────────
async function createOrder(payload) {
  return request('/orders', { method: 'POST', body: JSON.stringify(payload) });
}

async function getUserOrders() {
  return request('/orders');
}

// Export
window.AKURE = window.AKURE || {};
Object.assign(window.AKURE, { getProducts, getProduct, createOrder, getUserOrders });
