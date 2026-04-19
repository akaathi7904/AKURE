/* =====================================================
   AKURE – Cart Page (cart.js)
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  try {
    AKURE.initNavbar();
    renderCart();
  } finally {
    AKURE.hidePageLoader();
  }
});

function renderCart() {
  const cart = AKURE.getCart();
  const cartLayout = document.getElementById('cart-layout');
  const emptyCart  = document.getElementById('empty-cart');
  const itemsEl    = document.getElementById('cart-items');

  if (!cart.length) {
    cartLayout?.classList.add('hidden');
    emptyCart?.classList.remove('hidden');
    return;
  }

  cartLayout?.classList.remove('hidden');
  emptyCart?.classList.add('hidden');

  itemsEl.innerHTML = cart.map(cartItemHTML).join('');
  updateSummary();
}

function cartItemHTML(item) {
  const productUrl = AKURE.pageUrl(`product.html?id=${encodeURIComponent(item.id)}`);
  const img = item.image
    ? `<img class="cart-item__img" src="${item.image}" alt="${escHtml(item.name)}" loading="lazy" />`
    : `<div class="cart-item__img" style="display:flex;align-items:center;justify-content:center;background:var(--color-cream);font-size:2rem;">🌿</div>`;

  return `
    <div class="cart-item" data-id="${item.id}">
      <a href="${productUrl}">${img}</a>
      <div class="cart-item__details">
        <a href="${productUrl}" class="cart-item__name">${escHtml(item.name)}</a>
        <p class="cart-item__price">${AKURE.formatCurrency(item.price)} each</p>
      </div>
      <div class="cart-item__actions">
        <span class="cart-item__total">${AKURE.formatCurrency(item.price * item.quantity)}</span>
        <div class="qty-stepper" style="margin-top:var(--space-2);">
          <button onclick="adjustQty('${item.id}', -1)" aria-label="Decrease quantity">−</button>
          <input type="number" value="${item.quantity}" min="1" aria-label="Quantity for ${escHtml(item.name)}"
            onchange="setQty('${item.id}', parseInt(this.value))" />
          <button onclick="adjustQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
        </div>
        <button class="cart-item__remove" onclick="removeItem('${item.id}')">Remove</button>
      </div>
    </div>`;
}

function adjustQty(id, delta) {
  const cart = AKURE.getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  const newQty = item.quantity + delta;
  if (newQty < 1) { removeItem(id); return; }
  AKURE.updateCartQty(id, newQty);
  renderCart();
}

function setQty(id, qty) {
  if (isNaN(qty) || qty < 1) { removeItem(id); return; }
  AKURE.updateCartQty(id, qty);
  renderCart();
}

function removeItem(id) {
  AKURE.removeFromCart(id);
  AKURE.showToast('Item removed from cart', 'info');
  renderCart();
}

function updateSummary() {
  const subtotal = AKURE.getCartTotal();
  document.getElementById('summary-subtotal').textContent = AKURE.formatCurrency(subtotal);
  document.getElementById('summary-total').textContent = AKURE.formatCurrency(subtotal);
}

function escHtml(str = '') {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
