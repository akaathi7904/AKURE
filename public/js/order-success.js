/* =====================================================
   AKURE – Order Success Page (order-success.js)
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  AKURE.initNavbar();

  const orderId = AKURE.getUrlParam('order_id');
  const total   = AKURE.getUrlParam('total');

  if (orderId) {
    const shortId = orderId.slice(0, 8).toUpperCase();
    document.getElementById('order-id').textContent = `#AK-${shortId}`;
  }

  if (total) {
    document.getElementById('order-total').textContent = AKURE.formatCurrency(Number(total));
  }

  // Estimated delivery (today + 5-7 days)
  const minDate = new Date(Date.now() + 5 * 86400000);
  const maxDate = new Date(Date.now() + 7 * 86400000);
  const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  document.getElementById('est-delivery').textContent = `${fmt(minDate)} – ${fmt(maxDate)}`;

  AKURE.hidePageLoader();
});
