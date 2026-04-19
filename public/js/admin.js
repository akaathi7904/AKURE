/* =====================================================
   AKURE – Admin Dashboard
   ===================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    if (AKURE.isStaticDemo()) {
      document.body.innerHTML = '<div style="max-width:680px;margin:12vh auto;padding:2rem;text-align:center;"><h2>Admin is not available on GitHub Pages</h2><p>The GitHub Pages version is a storefront demo only. Deploy the Express app to Render, Railway, or another Node host to use admin tools.</p><p><a href="./index.html" class="btn btn--primary">Back to Store</a></p></div>';
      return;
    }

    // 1. Authenticate and verify role (handled fully by backend)
    const session = await AKURE.getSession();
    if (!session) {
      const redirectTarget = AKURE.pageUrl('admin.html');
      window.location.href = `${AKURE.pageUrl('login.html')}?redirect=${encodeURIComponent(redirectTarget)}`;
      return;
    }

    // Attempt to load stats as an auth check
    const isAuth = await checkAdminAccess(session.access_token);
    if (!isAuth) {
      document.body.innerHTML = `<div style="text-align:center;margin-top:10vh;"><h2>Access Denied</h2><p>You must be an admin to view this page.</p><a href="${AKURE.pageUrl('index.html')}">Go Home</a></div>`;
      return;
    }

    // Unhide the dashboard
    document.getElementById('admin-dashboard').style.display = 'grid';

    // 2. Load the initial products
    await loadAdminProducts();

    // 3. Setup the form submit logic
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);

    // 4. Setup upload listener
    document.getElementById('product-upload').addEventListener('change', handleImageUpload);

  } finally {
    AKURE.hidePageLoader();
  }
});

let _adminToken = null;
let currentProducts = [];

async function checkAdminAccess(token) {
  try {
    const res = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return false;
    const data = await res.json();
    document.getElementById('stats-total').textContent = `${data.totalProducts} Total Products`;
    _adminToken = token;
    return true;
  } catch {
    return false;
  }
}

async function loadAdminProducts() {
  const tbody = document.getElementById('admin-product-list');
  tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Loading products...</td></tr>';
  
  try {
    // Reuse the public api because admin still views the same products list
    const { data } = await AKURE.getProducts({ limit: 100 });
    currentProducts = data || [];
    renderTable();
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="color:var(--color-error)">Failed to load.</td></tr>';
  }
}

function renderTable() {
  const tbody = document.getElementById('admin-product-list');
  if (!currentProducts.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No products yet.</td></tr>';
    return;
  }

  tbody.innerHTML = currentProducts.map(p => {
    const imgStr = p.images?.[0] ? `<img src="${p.images[0]}" style="width:40px;height:40px;border-radius:4px;object-fit:cover;" />` : '🌿';
    return `
      <tr>
        <td>${imgStr}</td>
        <td style="font-weight:600;">${AKURE.escapeHtml ? AKURE.escapeHtml(p.name) : p.name}</td>
        <td><span class="section-label" style="font-size:0.7rem;padding:0.2rem 0.5rem">${p.category}</span></td>
        <td>${AKURE.formatCurrency(p.price)}</td>
        <td>${p.stock}</td>
        <td class="action-btns">
          <button class="btn btn--outline btn--sm" onclick="editProduct('${p.id}')">Edit</button>
          <button class="btn btn--outline btn--sm" style="color:var(--color-error);border-color:var(--color-error);" onclick="confirmDelete('${p.id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ── Modals & Forms ────────────────────────────────────

function openProductModal() {
  document.getElementById('product-form').reset();
  document.getElementById('product-id').value = '';
  document.getElementById('modal-title').textContent = 'Add New Product';
  document.getElementById('product-modal').classList.add('active');
}

function closeProductModal() {
  document.getElementById('product-modal').classList.remove('active');
}

function editProduct(id) {
  const p = currentProducts.find(x => x.id === id);
  if (!p) return;
  
  document.getElementById('modal-title').textContent = 'Edit Product';
  document.getElementById('product-id').value = p.id;
  document.getElementById('product-name').value = p.name;
  document.getElementById('product-desc').value = p.description || '';
  document.getElementById('product-price').value = p.price;
  document.getElementById('product-stock').value = p.stock;
  document.getElementById('product-category').value = p.category || 'oils';
  document.getElementById('product-limited').checked = !!p.is_limited_batch;
  document.getElementById('product-images').value = p.images ? p.images.join(', ') : '';
  document.getElementById('product-upload').value = '';
  document.getElementById('upload-status').textContent = 'Select images to auto-upload. URLs will be appended above.';
  document.getElementById('upload-preview').innerHTML = '';
  
  document.getElementById('product-modal').classList.add('active');
}

async function handleImageUpload(e) {
  const files = Array.from(e.target.files);
  if (!files.length) return;
  
  const statusEl = document.getElementById('upload-status');
  const previewBox = document.getElementById('upload-preview');
  const urlBox = document.getElementById('product-images');
  
  statusEl.textContent = `Uploading ${files.length} image(s)... please wait.`;
  statusEl.style.color = 'var(--color-gold)';
  
  let uploadedUrls = [];
  
  for (const file of files) {
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${_adminToken}`
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          base64: base64
        })
      });

      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      uploadedUrls.push(url);
      
      // Inline preview
      const thumb = document.createElement('img');
      thumb.src = url;
      thumb.style = 'width: 60px; height: 60px; object-fit: cover; border-radius: 4px;';
      previewBox.appendChild(thumb);
      
    } catch (err) {
      console.error(err);
      AKURE.showToast(`Failed to upload ${file.name}`, 'error');
    }
  }

  statusEl.textContent = `Upload complete. URLs added above.`;
  statusEl.style.color = 'green';
  
  // Append new urls to existing comma-separated list
  const existing = urlBox.value.split(',').map(s=>s.trim()).filter(Boolean);
  urlBox.value = [...existing, ...uploadedUrls].join(', ');
}

async function handleProductSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('product-id').value;
  const imageStr = document.getElementById('product-images').value;
  const images = imageStr.split(',').map(s => s.trim()).filter(Boolean);
  
  const payload = {
    name: document.getElementById('product-name').value,
    description: document.getElementById('product-desc').value,
    price: parseFloat(document.getElementById('product-price').value),
    stock: parseInt(document.getElementById('product-stock').value, 10),
    category: document.getElementById('product-category').value,
    is_limited_batch: document.getElementById('product-limited').checked,
    images
  };

  try {
    const url = id ? `/api/admin/products/${id}` : `/api/admin/products`;
    const method = id ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${_adminToken}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      throw new Error(error || 'Submission failed');
    }
    
    AKURE.showToast(id ? 'Product updated!' : 'Product added!', 'success');
    closeProductModal();
    loadAdminProducts(); // refresh
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

async function confirmDelete(id) {
  if (!confirm('Are you certain you want to delete this product? This cannot be undone.')) return;
  
  try {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${_adminToken}` }
    });
    
    if (!res.ok) throw new Error('Delete failed');
    AKURE.showToast('Product deleted.', 'info');
    loadAdminProducts();
  } catch (err) {
    alert(err.message);
  }
}

// Polyfill escapeHtml if missed
if (!window.AKURE.escapeHtml) {
  window.AKURE.escapeHtml = (str = '') => String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
