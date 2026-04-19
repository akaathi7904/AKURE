/* =====================================================
   AKURE – Home Page (home.js)
   ===================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    AKURE.initNavbar();

    // Set footer year
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Update nav auth link — with timeout so slow auth never hangs
    const session = await Promise.race([
      AKURE.getSession(),
      new Promise(resolve => setTimeout(() => resolve(null), 3000)),
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

    // Load featured products (first 6)
    await loadFeaturedProducts();

    // Newsletter form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('newsletter-email').value.trim();
        if (!email) return;
        AKURE.showToast('You\'re subscribed! Expect great things. 🌿', 'success');
        newsletterForm.reset();
      });
    }
  } finally {
    AKURE.hidePageLoader();
  }
});

async function loadFeaturedProducts() {
  const grid = document.getElementById('featured-products');
  if (!grid) return;

  // Show skeletons
  grid.innerHTML = Array(6).fill(null).map(() => skeletonCard()).join('');

  try {
    const { data } = await AKURE.getProducts({ limit: 6 });
    if (!data || data.length === 0) {
      grid.innerHTML = '<p class="text-muted text-center" style="grid-column:1/-1;">No products found.</p>';
      return;
    }
    grid.innerHTML = data.map(productCardHTML).join('');
  } catch (err) {
    console.error('[AKURE] Failed to load products:', err);
    grid.innerHTML = '<p class="text-muted text-center" style="grid-column:1/-1;">Could not load products right now.</p>';
  }
}

function productCardHTML(product) {
  const productUrl = AKURE.pageUrl(`product.html?id=${encodeURIComponent(product.id)}`);
  const img = product.images?.[0]
    ? `<img src="${product.images[0]}" alt="${escapeHtml(product.name)}" loading="lazy" />`
    : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem;color:var(--color-text-muted);">🌿</div>`;

  const badge = product.is_limited_batch
    ? `<span class="badge--limited">Limited Batch</span>`
    : '';

  return `
    <article class="product-card" onclick="window.location='${productUrl}'" role="button" tabindex="0"
             onkeydown="if(event.key==='Enter')window.location='${productUrl}'"
             aria-label="${escapeHtml(product.name)}">
      <div class="product-card__img-wrap">
        ${badge}
        ${img}
      </div>
      <div class="product-card__body">
        <div class="product-card__category">${escapeHtml(product.category || 'Natural')}</div>
        <h3 class="product-card__name">${escapeHtml(product.name)}</h3>
        <p class="product-card__desc">${escapeHtml(product.description || '')}</p>
        <div class="product-card__footer">
          <span class="product-card__price">${AKURE.formatCurrency(product.price)}</span>
          <button class="product-card__add-btn" aria-label="Add ${escapeHtml(product.name)} to cart"
            onclick="event.stopPropagation();AKURE.addToCart(${JSON.stringify({id:product.id,name:product.name,price:product.price,images:product.images}).replace(/"/g,'&quot;')})">+</button>
        </div>
      </div>
    </article>`;
}

function skeletonCard() {
  return `<div class="product-card product-card--skeleton">
    <div class="product-card__img-wrap"></div>
    <div class="product-card__body">
      <div class="product-card__category">&nbsp;</div>
      <div class="product-card__name">&nbsp;</div>
      <div class="product-card__desc">&nbsp;</div>
      <div class="product-card__footer">
        <span class="product-card__price">&nbsp;</span>
        <button class="product-card__add-btn"></button>
      </div>
    </div>
  </div>`;
}

function escapeHtml(str = '') {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Expose card helpers globally for reuse
window.AKURE_productCardHTML = productCardHTML;
window.AKURE_skeletonCard = skeletonCard;
window.AKURE_escapeHtml = escapeHtml;
