/**
 * VendorVerse — Wishlist Page Logic
 * Vanilla JS — localStorage driven
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'vendorverse_wishlist';
  const CART_KEY = 'vendorverse_cart';

  // ═══ DEMO DATA (seeded if wishlist is empty for demo purposes) ═══
  const DEMO_ITEMS = [
    { id:'w1', name:'Premium Smart Watch Pro', vendor:'TechNova', price:4999, orig:6999, sale:true, saleText:'-29%', rating:4.8, reviews:248, stock:true, image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', addedAt:Date.now()-1000 },
    { id:'w2', name:'Wireless Noise Cancelling Earbuds', vendor:'SoundCraft', price:3299, orig:4499, sale:true, saleText:'-27%', rating:4.6, reviews:189, stock:true, image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', addedAt:Date.now()-2000 },
    { id:'w3', name:'Artisan Handwoven Silk Scarf', vendor:'Artisan Collective', price:1899, orig:0, sale:false, saleText:'', rating:4.9, reviews:87, stock:true, image:'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&h=400&fit=crop', addedAt:Date.now()-3000 },
    { id:'w4', name:'Italian Leather Bifold Wallet', vendor:'Heritage Leather', price:2499, orig:3200, sale:true, saleText:'SALE', rating:4.7, reviews:134, stock:true, image:'https://images.unsplash.com/photo-1491637417460-6a94da76af72?w=400&h=400&fit=crop', addedAt:Date.now()-4000 },
    { id:'w5', name:'Handcrafted Ceramic Vase Set', vendor:'Studio Earth', price:3750, orig:0, sale:false, saleText:'', rating:4.5, reviews:62, stock:false, image:'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=400&fit=crop', addedAt:Date.now()-5000 },
    { id:'w6', name:'Bluetooth Portable Speaker X3', vendor:'AudioMax', price:5499, orig:7999, sale:true, saleText:'-31%', rating:4.4, reviews:203, stock:true, image:'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop', addedAt:Date.now()-6000 },
    { id:'w7', name:'Organic Cotton Throw Blanket', vendor:'EcoHome', price:1299, orig:1799, sale:true, saleText:'-28%', rating:4.8, reviews:94, stock:true, image:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop', addedAt:Date.now()-7000 },
    { id:'w8', name:'Minimalist Desk Lamp LED', vendor:'LightCo', price:2199, orig:0, sale:false, saleText:'', rating:4.3, reviews:156, stock:true, image:'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop', addedAt:Date.now()-8000 },
  ];

  // ═══ STORAGE HELPERS ═══
  function getWishlist() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
  }
  function saveWishlist(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    updateBadge();
  }
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
  }
  function saveCart(items) { localStorage.setItem(CART_KEY, JSON.stringify(items)); }

  // ═══ BADGE UPDATE ═══
  function updateBadge() {
    const count = getWishlist().length;
    const badge = document.getElementById('wishlist-badge');
    if (badge) badge.textContent = count;
    const countEl = document.getElementById('wl-item-count');
    if (countEl) countEl.textContent = count + ' Item' + (count !== 1 ? 's' : '') + ' Saved';
  }

  // ═══ TOAST ═══
  function showToast(msg) {
    const t = document.getElementById('wl-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  // ═══ STAR GENERATOR ═══
  function starsHTML(rating) {
    let s = '';
    for (let i = 1; i <= 5; i++) s += i <= Math.round(rating) ? '★' : '☆';
    return s;
  }

  // ═══ RENDER GRID ═══
  function renderGrid() {
    const items = getWishlist();
    const grid = document.getElementById('wl-grid');
    const empty = document.getElementById('wl-empty');
    const toolbar = document.getElementById('wl-toolbar');
    if (!grid) return;

    if (items.length === 0) {
      grid.innerHTML = '';
      grid.style.display = 'none';
      if (toolbar) toolbar.style.display = 'none';
      if (empty) empty.style.display = 'flex';
      return;
    }

    grid.style.display = 'grid';
    if (toolbar) toolbar.style.display = 'flex';
    if (empty) empty.style.display = 'none';

    grid.innerHTML = items.map((item, i) => `
      <div class="wl-card" data-id="${item.id}" style="--i:${i}">
        <div class="wl-card-img">
          <a href="product-detail.html?name=${encodeURIComponent(item.name)}&price=${item.price}&image=${encodeURIComponent(item.image || '')}&vendor=${encodeURIComponent(item.vendor || '')}">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
          </a>
          ${item.sale ? `<span class="wl-card-sale">${item.saleText}</span>` : ''}
          <div class="wl-card-actions">
            <button class="wl-card-action-btn heart-active" data-remove="${item.id}" title="Remove from wishlist">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            <button class="wl-card-action-btn" title="Share">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="wl-card-body">
          <a href="product-detail.html?name=${encodeURIComponent(item.name)}&price=${item.price}&image=${encodeURIComponent(item.image || '')}&vendor=${encodeURIComponent(item.vendor || '')}" class="wl-card-name" style="display:block;color:inherit;text-decoration:none;">${item.name}</a>
          <div class="wl-card-vendor">🏪 ${item.vendor}</div>
          <div class="wl-card-rating">
            <span class="wl-card-stars">${starsHTML(item.rating)}</span>
            <span>${item.rating}</span>
            <span>(${item.reviews})</span>
          </div>
          <div class="wl-card-price-row">
            <span class="wl-card-price">₹${item.price.toLocaleString('en-IN')}</span>
            ${item.orig ? `<span class="wl-card-orig">₹${item.orig.toLocaleString('en-IN')}</span>` : ''}
          </div>
          <div class="wl-card-stock ${item.stock ? 'in' : 'out'}">
            <span class="wl-card-stock-dot"></span>
            ${item.stock ? 'In Stock' : 'Out of Stock'}
          </div>
        </div>
        <button class="wl-card-cart" ${!item.stock ? 'disabled' : ''} data-cart="${item.id}">
          ${item.stock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    `).join('');

    // Remove handlers
    grid.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => removeItem(btn.dataset.remove));
    });

    // Add to cart handlers
    grid.querySelectorAll('[data-cart]').forEach(btn => {
      if (btn.disabled) return;
      btn.addEventListener('click', () => addToCart(btn.dataset.cart));
    });
  }

  // ═══ REMOVE ITEM ═══
  function removeItem(id) {
    const card = document.querySelector(`.wl-card[data-id="${id}"]`);
    if (card) {
      card.classList.add('removing');
      setTimeout(() => {
        const items = getWishlist().filter(i => i.id !== id);
        saveWishlist(items);
        renderGrid();
      }, 300);
    }
  }

  // ═══ ADD SINGLE TO CART ═══
  function addToCart(id) {
    const items = getWishlist();
    const item = items.find(i => i.id === id);
    if (!item || !item.stock) return;
    const cart = getCart();
    if (!cart.find(c => c.id === id)) {
      cart.push({ id: item.id, name: item.name, price: item.price, image: item.image, qty: 1 });
      saveCart(cart);
    }
    showToast('Added to cart!');
    // Update cart badge if exists
    const cb = document.querySelector('.cart-badge');
    if (cb) cb.textContent = getCart().length;
  }

  // ═══ ADD ALL TO CART ═══
  function addAllToCart() {
    const items = getWishlist().filter(i => i.stock);
    if (items.length === 0) return;
    const cart = getCart();
    items.forEach(item => {
      if (!cart.find(c => c.id === item.id)) {
        cart.push({ id: item.id, name: item.name, price: item.price, image: item.image, qty: 1 });
      }
    });
    saveCart(cart);
    showToast('All items added to cart!');
    const cb = document.querySelector('.cart-badge');
    if (cb) cb.textContent = getCart().length;
  }

  // ═══ CLEAR WISHLIST (with modal) ═══
  function showClearModal() {
    const modal = document.getElementById('wl-modal');
    if (modal) modal.style.display = 'flex';
  }
  function hideClearModal() {
    const modal = document.getElementById('wl-modal');
    if (modal) modal.style.display = 'none';
  }
  function clearWishlist() {
    saveWishlist([]);
    hideClearModal();
    renderGrid();
    showToast('Wishlist cleared');
  }

  // ═══ SORT ═══
  function sortWishlist(by) {
    const items = getWishlist();
    switch(by) {
      case 'price-low': items.sort((a,b) => a.price - b.price); break;
      case 'price-high': items.sort((a,b) => b.price - a.price); break;
      case 'name': items.sort((a,b) => a.name.localeCompare(b.name)); break;
      default: items.sort((a,b) => (b.addedAt||0) - (a.addedAt||0)); break;
    }
    saveWishlist(items);
    renderGrid();
  }

  // ═══ INIT ═══
  document.addEventListener('DOMContentLoaded', () => {
    // Validate existing data — if items lack required fields, reseed with demo
    const existing = getWishlist();
    const isValid = Array.isArray(existing) && existing.length > 0 &&
      existing.every(i => i && i.name && i.price !== undefined && i.image && i.vendor);
    if (!isValid) {
      saveWishlist(DEMO_ITEMS);
    }

    updateBadge();
    renderGrid();

    // Update cart badge
    const cb = document.querySelector('.cart-badge');
    if (cb) cb.textContent = getCart().length;

    // Event listeners
    document.getElementById('wl-add-all')?.addEventListener('click', addAllToCart);
    document.getElementById('wl-clear')?.addEventListener('click', showClearModal);
    document.getElementById('wl-modal-cancel')?.addEventListener('click', hideClearModal);
    document.getElementById('wl-modal-confirm')?.addEventListener('click', clearWishlist);
    document.getElementById('wl-sort')?.addEventListener('change', e => sortWishlist(e.target.value));

    // Close modal on overlay click
    document.getElementById('wl-modal')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) hideClearModal();
    });

    // Scroll navbar solid
    const header = document.getElementById('header');
    if (header) {
      window.addEventListener('scroll', () => {
        header.classList.toggle('nav-solid', window.scrollY > 50);
      }, { passive: true });
    }
  });

})();
