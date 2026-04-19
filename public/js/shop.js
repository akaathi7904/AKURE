/* =====================================================
   AKURE – Shop Page (shop.js)
   ===================================================== */

const STATE = {
  category: '',
  search: '',
  sort: 'newest',
  page: 1,
  limit: 12,
  total: 0,
};

document.addEventListener('DOMContentLoaded', async () => {
  try {
    AKURE.initNavbar();
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Read URL params for pre-selected category
    const paramCategory = AKURE.getUrlParam('category');
    if (paramCategory) {
      STATE.category = paramCategory;
      const radio = document.querySelector(`input[name="category"][value="${paramCategory}"]`);
      if (radio) radio.checked = true;
    }

    // Auth nav — use a timeout so slow Supabase never blocks the page
    const sessionPromise = Promise.race([
      AKURE.getSession(),
      new Promise(resolve => setTimeout(() => resolve(null), 3000)),
    ]);
    const session = await sessionPromise;
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

    // Bind filters
    document.querySelectorAll('input[name="category"]').forEach((r) => {
      r.addEventListener('change', () => {
        STATE.category = r.value;
        STATE.page = 1;
        loadProducts();
      });
    });

    const searchInput = document.getElementById('search-input');
    searchInput?.addEventListener('input', AKURE.debounce(() => {
      STATE.search = searchInput.value.trim();
      STATE.page = 1;
      loadProducts();
    }, 400));

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        STATE.sort = e.target.value;
        loadProducts();
      });
    }

    await loadProducts();
  } finally {
    AKURE.hidePageLoader();
  }
});

async function loadProducts() {
  const grid = document.getElementById('products-grid');
  const countEl = document.getElementById('product-count');
  grid.innerHTML = Array(STATE.limit).fill(null).map(() => AKURE_skeletonCard?.() || '').join('');

  try {
    const { data, meta } = await AKURE.getProducts({
      category: STATE.category || undefined,
      search: STATE.search || undefined,
      page: STATE.page,
      limit: STATE.limit,
    });

    STATE.total = meta.total;

    let sorted = [...(data || [])];
    if (STATE.sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    if (STATE.sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);

    if (!sorted.length) {
      grid.innerHTML = `<p class="text-muted" style="grid-column:1/-1;text-align:center;padding:3rem 0;">No products found for your selection.</p>`;
      countEl.textContent = '0 Products';
      renderPagination(0);
      return;
    }

    grid.innerHTML = sorted.map((p) => AKURE_productCardHTML(p)).join('');
    countEl.textContent = `${meta.total} Product${meta.total !== 1 ? 's' : ''}`;
    renderPagination(meta.total);
  } catch (err) {
    console.error('[AKURE] Shop load error:', err);
    grid.innerHTML = `<p class="text-muted" style="grid-column:1/-1;text-align:center;padding:3rem 0;">Failed to load products. Please try again.</p>`;
  }
}

function renderPagination(total) {
  const container = document.getElementById('pagination');
  const totalPages = Math.ceil(total / STATE.limit);
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  let html = '';
  if (STATE.page > 1) html += `<button class="btn btn--outline btn--sm" onclick="changePage(${STATE.page - 1})">← Prev</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="btn btn--sm ${i === STATE.page ? 'btn--primary' : 'btn--ghost'}" onclick="changePage(${i})">${i}</button>`;
  }
  if (STATE.page < totalPages) html += `<button class="btn btn--outline btn--sm" onclick="changePage(${STATE.page + 1})">Next →</button>`;
  container.innerHTML = html;
}

function changePage(page) {
  STATE.page = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadProducts();
}

// ── Product card helpers (self-contained, no home.js dependency) ──
function escapeHtml(str = '') {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function AKURE_productCardHTML(product) {
  // Prefer the global version if home.js also loaded it, else use our own
  if (window.AKURE_productCardHTML && window.AKURE_productCardHTML !== AKURE_productCardHTML) {
    return window.AKURE_productCardHTML(product);
  }
  const productUrl = AKURE.pageUrl(`product.html?id=${encodeURIComponent(product.id)}`);
  const img = product.images?.[0]
    ? `<img src="${product.images[0]}" alt="${escapeHtml(product.name)}" loading="lazy" />`
    : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem;color:var(--color-text-muted);">🌿</div>`;
  const badge = product.is_limited_batch ? `<span class="badge--limited">Limited Batch</span>` : '';
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

function AKURE_skeletonCard() {
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
