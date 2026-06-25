// Cart management — localStorage-backed
(function() {
  function getCart() {
    try { return JSON.parse(localStorage.getItem('kh_cart') || '[]'); } catch(e) { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem('kh_cart', JSON.stringify(cart));
    updateCartBadge(cart);
  }

  function updateCartBadge(cart) {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-block' : 'none';
    });
  }

  window.addToCart = function(id, name, price, qty = 1) {
    const cart = getCart();
    const existing = cart.find(i => i.id === id);
    if (existing) { existing.qty += qty; } else { cart.push({ id, name, price, qty }); }
    saveCart(cart);
    showToast(`${name} added to cart`);
  };

  window.removeFromCart = function(id) {
    saveCart(getCart().filter(i => i.id !== id));
  };

  window.getCart = getCart;

  window.getCartTotal = function() {
    return getCart().reduce((s, i) => s + i.price * i.qty, 0);
  };

  function showToast(msg) {
    let toast = document.getElementById('kh-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'kh-toast';
      toast.style.cssText = 'position:fixed;bottom:100px;right:28px;background:#1a3a2a;color:#fff;padding:12px 20px;border-radius:8px;font-size:0.88rem;z-index:9999;border-left:4px solid #c9a84c;opacity:0;transition:opacity 0.3s;pointer-events:none;';
      document.body.appendChild(toast);
    }
    toast.textContent = '🌿 ' + msg;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2800);
  }

  // Init badge on load
  document.addEventListener('DOMContentLoaded', () => updateCartBadge(getCart()));
})();
