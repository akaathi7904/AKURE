/* =====================================================
   AKURE – Cart & Utility Module (utils.js)
   ===================================================== */

// ── Toast Notifications ──────────────────────────────
const TOAST_DURATION = 3000;

function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✓', error: '✕', info: '●' };
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  }, TOAST_DURATION);
}

// ── Cart (localStorage) ──────────────────────────────
const CART_KEY = 'akure_cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product, quantity = 1) {
  const cart = getCart();
  const idx = cart.findIndex((i) => i.id === product.id);
  if (idx > -1) {
    cart[idx].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      quantity,
    });
  }
  saveCart(cart);
  showToast(`"${product.name}" added to cart`, 'success');
}

function removeFromCart(productId) {
  const cart = getCart().filter((i) => i.id !== productId);
  saveCart(cart);
}

function updateCartQty(productId, quantity) {
  const cart = getCart();
  const idx = cart.findIndex((i) => i.id === productId);
  if (idx > -1) {
    if (quantity <= 0) {
      cart.splice(idx, 1);
    } else {
      cart[idx].quantity = quantity;
    }
    saveCart(cart);
  }
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

function getCartCount() {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}

function getCartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const count = getCartCount();
  badges.forEach((b) => {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ── Page Loader ───────────────────────────────────────
function hidePageLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 400);
  }
}

// ── Format Currency (INR) ─────────────────────────────
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Debounce ──────────────────────────────────────────
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ── URL Params ────────────────────────────────────────
function getUrlParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

// ── Navbar scroll + hamburger ─────────────────────────
function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;

  const hamburger = nav.querySelector('.navbar__hamburger');
  const mobile = document.querySelector('.navbar__mobile');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  if (hamburger && mobile) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobile.classList.toggle('open');
    });
  }

  // Highlight active link
  const links = nav.querySelectorAll('.navbar__links a, .navbar__mobile a');
  links.forEach((link) => {
    if (link.href === window.location.href) link.classList.add('active');
  });

  updateCartBadge();
}

// Export API
window.AKURE = window.AKURE || {};
Object.assign(window.AKURE, {
  showToast,
  getCart, addToCart, removeFromCart, updateCartQty, clearCart,
  getCartCount, getCartTotal,
  hidePageLoader, formatCurrency, debounce, getUrlParam, initNavbar,
});
