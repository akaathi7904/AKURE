/* =====================================================
   AKURE – Checkout Page (checkout.js)
   ===================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    AKURE.initNavbar();

    // Auth guard
    const session = await AKURE.requireAuth();

    // Render cart summary
    const cart = AKURE.getCart();
    if (!cart.length) {
      window.location.href = '/cart.html';
      return;
    }
    renderCheckoutSummary(cart);

    // Form submission
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', handleCheckout);
    }
  } finally {
    AKURE.hidePageLoader();
  }
});

function renderCheckoutSummary(cart) {
  const itemsEl  = document.getElementById('checkout-items');
  const subtotal = AKURE.getCartTotal();

  itemsEl.innerHTML = cart.map((item) => `
    <div class="order-summary__row" style="align-items:center;gap:var(--space-3);">
      <span style="flex:1;font-size:0.85rem;color:var(--color-text);">${escHtml(item.name)} × ${item.quantity}</span>
      <span style="font-weight:600;white-space:nowrap;">${AKURE.formatCurrency(item.price * item.quantity)}</span>
    </div>`).join('');

  document.getElementById('co-subtotal').textContent = AKURE.formatCurrency(subtotal);
  document.getElementById('co-total').textContent    = AKURE.formatCurrency(subtotal);
}

async function handleCheckout(e) {
  e.preventDefault();
  const btn = document.getElementById('place-order-btn');
  const errorEl = document.getElementById('form-error');
  errorEl.textContent = '';

  // Gather form fields
  const fullName     = document.getElementById('full-name').value.trim();
  const phone        = document.getElementById('phone').value.trim();
  const email        = document.getElementById('email').value.trim();
  const addressLine1 = document.getElementById('address-line1').value.trim();
  const addressLine2 = document.getElementById('address-line2').value.trim();
  const city         = document.getElementById('city').value.trim();
  const state        = document.getElementById('state').value.trim();
  const pincode      = document.getElementById('pincode').value.trim();
  const country      = document.getElementById('country').value.trim();

  // Basic validation
  if (!fullName || !phone || !email || !addressLine1 || !city || !state || !pincode) {
    errorEl.textContent = 'Please fill in all required fields.';
    return;
  }
  if (!/^\d{6}$/.test(pincode)) {
    errorEl.textContent = 'Please enter a valid 6-digit pincode.';
    return;
  }

  const cart = AKURE.getCart();
  if (!cart.length) { window.location.href = '/cart.html'; return; }

  btn.textContent = 'Placing Order…';
  btn.classList.add('btn--loading');

  try {
    const payload = {
      items: cart.map((i) => ({ product_id: i.id, quantity: i.quantity, price: i.price })),
      total: AKURE.getCartTotal(),
      shipping_address: { fullName, phone, email, addressLine1, addressLine2, city, state, pincode, country },
    };

    const { order } = await AKURE.createOrder(payload);
    AKURE.clearCart();

    // Redirect to success page with order ID and total
    const params = new URLSearchParams({
      order_id: order.id,
      total: order.total,
    });
    window.location.href = `/order-success.html?${params}`;
  } catch (err) {
    btn.textContent = 'Place Order';
    btn.classList.remove('btn--loading');
    errorEl.textContent = err.message || 'Failed to place order. Please try again.';
    AKURE.showToast('Order failed. Please check your details.', 'error');
  }
}

function escHtml(str = '') {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
