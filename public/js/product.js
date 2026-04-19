/* =====================================================
   AKURE – Product Detail Page (product.js)
   ===================================================== */

let currentProduct = null;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    AKURE.initNavbar();

    const id = AKURE.getUrlParam('id');
    if (!id) {
      window.location.href = AKURE.pageUrl('shop.html');
      return;
    }

    // Admin nav check
    const session = await Promise.race([
      AKURE.getSession?.(),
      new Promise(r => setTimeout(() => r(null), 3000))
    ]);
    const authLink = document.getElementById('nav-auth-link');
    if (session && authLink) {
      if (session.user?.email === 'akure1612@gmail.com') {
        authLink.textContent = 'Admin Panel';
        authLink.href = AKURE.pageUrl('admin.html');
      } else {
        authLink.textContent = 'My Account';
        authLink.href = '#';
        authLink.addEventListener('click', (e) => { e.preventDefault(); AKURE.logout(); });
      }
    }

    await loadProduct(id);
  } finally {
    AKURE.hidePageLoader();
  }
});

async function loadProduct(id) {
  try {
    currentProduct = await AKURE.getProduct(id);
    renderProduct(currentProduct);
    document.getElementById('breadcrumb-name').textContent = currentProduct.name;
    document.title = `${currentProduct.name} – AKURE`;
    loadRelated(currentProduct.category, id);
  } catch (err) {
    document.getElementById('product-detail').innerHTML =
      `<div class="empty-state"><div class="empty-state__icon">🌿</div><h3>Product not found</h3><p>This product may no longer be available.</p><a href="${AKURE.pageUrl('shop.html')}" class="btn btn--primary mt-6">Browse Shop</a></div>`;
  }
}

function renderProduct(p) {
  const images = p.images || [];
  const badge = p.is_limited_batch ? `<span class="badge--limited" style="position:static;display:inline-block;margin-bottom:1rem;">Limited Batch</span>` : '';
  const mainImg = images[0] || null;

  const galleryHTML = `
    <div class="product-gallery">
      <div class="product-gallery__main">
        ${mainImg
          ? `<img id="main-img" src="${mainImg}" alt="${p.name}" loading="eager" />`
          : `<div class="product-gallery__placeholder">🌿</div>`}
      </div>
      ${images.length > 1 ? `
        <div class="product-gallery__thumbs">
          ${images.map((img, i) => `
            <button class="product-gallery__thumb ${i === 0 ? 'active' : ''}"
              onclick="setMainImg('${img}', this)">
              <img src="${img}" alt="${p.name} image ${i + 1}" loading="lazy" />
            </button>`).join('')}
        </div>` : ''}
    </div>`;

  const infoHTML = `
    <div class="product-detail__info">
      ${badge}
      <span class="section-label">${p.category || 'Natural Product'}</span>
      <h1 style="font-size:clamp(1.8rem,4vw,2.6rem);margin-top:var(--space-2);">${p.name}</h1>
      <div class="product-price" style="font-family:var(--font-heading);font-size:1.8rem;font-weight:700;color:var(--color-dark);margin:var(--space-4) 0;">
        ${AKURE.formatCurrency(p.price)}
      </div>
      <div class="divider"></div>
      <p style="margin:var(--space-5) 0;">${p.description || ''}</p>

      ${p.stock === 0
        ? `<p style="color:var(--color-error);font-weight:600;">Out of Stock</p>`
        : `
        <div style="display:flex;align-items:center;gap:var(--space-5);margin-bottom:var(--space-5);flex-wrap:wrap;">
          <div class="qty-stepper">
            <button onclick="changeQty(-1)" aria-label="Decrease quantity">−</button>
            <input type="number" id="qty" value="1" min="1" max="${p.stock}" aria-label="Quantity" />
            <button onclick="changeQty(1)" aria-label="Increase quantity">+</button>
          </div>
          <span style="font-size:0.8rem;color:var(--color-text-muted);">${p.stock} in stock</span>
        </div>
        <button class="btn btn--primary btn--lg btn--full" onclick="handleAddToCart()" id="atc-btn">
          Add to Cart
        </button>`}

      <div class="product-trust-badges">
        <span>🌱 Organic</span>
        <span>🔬 Lab Tested</span>
        <span>✋ Handcrafted</span>
        <span>📦 Free Shipping</span>
      </div>
    </div>`;

  document.getElementById('product-detail').innerHTML = `${galleryHTML}${infoHTML}`;
  document.getElementById('product-detail').className = 'product-detail';
}

function setMainImg(src, btn) {
  const mainImg = document.getElementById('main-img');
  if (mainImg) mainImg.src = src;
  document.querySelectorAll('.product-gallery__thumb').forEach((t) => t.classList.remove('active'));
  btn.classList.add('active');
}

function changeQty(delta) {
  const input = document.getElementById('qty');
  if (!input) return;
  const max = parseInt(input.max) || 99;
  const newVal = Math.max(1, Math.min(max, parseInt(input.value) + delta));
  input.value = newVal;
}

function handleAddToCart() {
  if (!currentProduct) return;
  const qty = parseInt(document.getElementById('qty')?.value || 1);
  AKURE.addToCart(currentProduct, qty);
  const btn = document.getElementById('atc-btn');
  if (btn) {
    btn.textContent = '✓ Added!';
    btn.classList.add('btn--loading');
    setTimeout(() => { btn.textContent = 'Add to Cart'; btn.classList.remove('btn--loading'); }, 1500);
  }
}

async function loadRelated(category, excludeId) {
  const grid = document.getElementById('related-products');
  if (!grid || !category) return;
  try {
    const { data } = await AKURE.getProducts({ category, limit: 4 });
    const filtered = (data || []).filter((p) => p.id !== excludeId).slice(0, 3);
    if (!filtered.length) {
      document.querySelector('.related-section').style.display = 'none';
      return;
    }
    grid.innerHTML = filtered.map((p) => window.AKURE_productCardHTML(p)).join('');
  } catch { /* silent */ }
}
