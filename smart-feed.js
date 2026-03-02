/**
 * VendorVerse — Smart Marketplace Feed
 * Replaces static lists with a scrolling discovery feed
 * Powered by simulated user preferences (clicks & wishlist)
 */

/* ═══ CONSTANTS & STORAGE KEYS ═══ */
const SF_CLICKS_KEY = 'vendorverse_clicks';
// Relies on WL_KEY from discovery.js and PRODUCT_DATA from discovery.js
// Also relies on VENDOR_PRODUCTS_KEY_CP from creator-profile.js if available

/* ═══ UTILITIES ═══ */
function getSFClicks() {
    try { return JSON.parse(localStorage.getItem(SF_CLICKS_KEY) || '{}'); }
    catch { return {}; }
}

function saveSFClick(category) {
    if (!category || category === 'all') return;
    const clicks = getSFClicks();
    clicks[category] = (clicks[category] || 0) + 1;
    localStorage.setItem(SF_CLICKS_KEY, JSON.stringify(clicks));
}

function sfFmt(n) { return '₹' + n.toLocaleString('en-IN'); }

function sfStars(rating) {
    let s = '';
    for (let i = 1; i <= 5; i++) s += i <= Math.round(rating) ? '★' : '☆';
    return s;
}

/* ═══ PERSONALIZATION ENGINE ═══ */
function scoreProduct(product) {
    let score = 0;
    const clicks = getSFClicks();
    let reason = null;

    // Base score from rating (0-5)
    score += (product.rating || 4);

    // Score from category clicks (1 point per click, max 10)
    if (clicks[product.category]) {
        const catScore = Math.min(clicks[product.category], 10);
        score += catScore;
        if (catScore > 2) reason = `✨ Because you viewed ${product.category}`;
    }

    // Score from being on wishlist
    try {
        const wl = JSON.parse(localStorage.getItem('vendorverse_wishlist') || '[]');
        if (wl.includes(product.id)) {
            score += 15; // huge boost
            reason = `❤️ From your wishlist`;
        }
    } catch { }

    // Random noise to keep feed fresh (0-3)
    score += Math.random() * 3;

    // Badges give a slight boost
    if (product.badge === 'Trending') { score += 2; if (!reason) reason = `🔥 Trending Right Now`; }
    if (product.badge === 'New') { score += 1.5; if (!reason) reason = `🆕 New Drop`; }
    if (product.category === 'local') { score += 1; if (!reason) reason = `📍 Local Seller`; }

    // Fallback reason
    if (!reason && score > 6) reason = `👍 Recommended for you`;

    return { product, score, reason };
}

/* ═══ RENDER SMART FEED ═══ */
function renderSmartFeed() {
    const grid = document.getElementById('smart-feed-grid');
    if (!grid) return;

    // Combine standard products (PRODUCT_DATA) with creator products if available
    let allProducts = typeof PRODUCT_DATA !== 'undefined' ? [...PRODUCT_DATA] : [];

    try {
        const vendorProducts = JSON.parse(localStorage.getItem('vendorverse_vendor_products') || '[]');
        // Filter live creator products and add to pool
        const liveVP = vendorProducts.filter(p => p.status === 'live');
        allProducts = [...allProducts, ...liveVP];
    } catch (e) {
        console.warn('Could not load vendor products for feed');
    }

    // Deduplicate by ID
    const uniqueMap = new Map();
    allProducts.forEach(p => uniqueMap.set(p.id, p));
    allProducts = Array.from(uniqueMap.values());

    // Score and sort
    const scoredProducts = allProducts.map(scoreProduct);
    scoredProducts.sort((a, b) => b.score - a.score);

    // Render cards
    grid.innerHTML = scoredProducts.map((item, i) => {
        const p = item.product;
        // Determine if wishlisted
        let wishlisted = false;
        try {
            const wl = JSON.parse(localStorage.getItem('vendorverse_wishlist') || '[]');
            wishlisted = wl.includes(p.id);
        } catch { }

        // Badges HTML
        let badgesHtml = '';
        if (p.badge) badgesHtml += `<span class="sf-badge trending">${p.badge}</span>`;
        // Add random "Fast Delivery" badge to some products
        if (!p.badge && Math.random() > 0.7) badgesHtml += `<span class="sf-badge local">Fast Delivery</span>`;

        // Resolve vendor logic if this was from creator-profiles
        const brandName = p.brand || 'VendorVerse Creator';
        const vendorId = p.vendorId || null;

        return `
        <article class="smart-prod-card" data-id="${p.id}" data-cat="${p.category || 'all'}" style="animation-delay: ${i * 40}ms;">
            <div class="sf-img-wrap sf-trigger-view" data-id="${p.id}">
                <img src="${p.image}" alt="${p.title || p.name}" loading="lazy" class="sf-img">
                <div class="sf-badges">
                    ${badgesHtml}
                </div>
                <button class="sf-wishlist-btn ${wishlisted ? 'active' : ''}" data-id="${p.id}" aria-label="Toggle Wishlist">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="${wishlisted ? '#ef4444' : 'none'}" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
                ${item.reason ? `<div class="sf-reason-tag">${item.reason}</div>` : ''}
            </div>
            
            <div class="sf-body">
                <div class="sf-brand-row">
                    <span class="sf-brand">${brandName}</span>
                    <span class="sf-rating">${sfStars(p.rating || 4.5)} <span style="font-size:0.65rem">(${p.ratingCount || 0})</span></span>
                </div>
                <h3 class="sf-title sf-trigger-view" data-id="${p.id}">${p.title || p.name}</h3>
                
                <div class="sf-footer">
                    <div class="sf-price-wrap">
                        <span class="sf-price">${sfFmt(p.price)}</span>
                        ${p.originalPrice ? `<span class="sf-orig-price">${sfFmt(p.originalPrice)}</span>` : ''}
                    </div>
                    <div class="sf-actions">
                        ${vendorId ? `
                        <button class="sf-btn sf-btn-view sf-vendor-link ripple-container" data-vid="${vendorId}" title="Visit Store">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                        </button>
                        ` : ''}
                        <button class="sf-btn sf-btn-cart ripple-container sf-trigger-cart" data-id="${p.id}" title="Add to Cart">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </article>
        `;
    }).join('');

    attachSmartFeedHandlers(grid, allProducts);
}

/* ═══ HANDLERS ═══ */
function attachSmartFeedHandlers(grid, feedProducts) {

    // 1. Click tracking + Quick View
    grid.querySelectorAll('.sf-trigger-view').forEach(el => {
        el.addEventListener('click', (e) => {
            const card = e.currentTarget.closest('.smart-prod-card');
            if (card && card.dataset.cat) saveSFClick(card.dataset.cat);

            const pId = e.currentTarget.dataset.id;
            const p = feedProducts.find(x => x.id === pId);

            // Re-use openQuickView from discovery.js if available
            if (p && typeof openQuickView === 'function') {
                // Ensure field mappings for Quick View (title vs name)
                const qvProduct = {
                    ...p,
                    title: p.title || p.name,
                    brand: p.brand || 'Creator'
                };
                openQuickView(qvProduct);
            }
        });
    });

    // 2. Add to Cart
    grid.querySelectorAll('.sf-trigger-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const pId = e.currentTarget.dataset.id;
            const p = feedProducts.find(x => x.id === pId);

            if (p) {
                // Re-use from discovery.js or cart.js
                if (typeof addToDiscoverCart === 'function') {
                    addToDiscoverCart({ ...p, title: p.title || p.name, brand: p.brand || 'Creator' });
                } else if (typeof addToCart === 'function') {
                    addToCart({
                        id: p.id, productId: p.id, title: p.title || p.name,
                        brand: p.brand || 'Creator', price: p.price, image: p.image, quantity: 1
                    });
                }
            }
        });
    });

    // 3. Wishlist (reuses toggleWishlist from discovery.js when possible)
    grid.querySelectorAll('.sf-wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const pId = e.currentTarget.dataset.id;

            if (typeof toggleWishlist === 'function') {
                toggleWishlist(pId, btn);
            } else {
                // Fallback direct localStorage manipulation
                try {
                    const wl = JSON.parse(localStorage.getItem('vendorverse_wishlist') || '[]');
                    const idx = wl.indexOf(pId);
                    if (idx > -1) {
                        wl.splice(idx, 1);
                        btn.classList.remove('active');
                        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
                        if (typeof showToast === 'function') showToast('Removed from wishlist', 'info');
                    } else {
                        wl.push(pId);
                        btn.classList.add('active');
                        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
                        if (typeof showToast === 'function') showToast('Added to wishlist', 'success');
                    }
                    localStorage.setItem('vendorverse_wishlist', JSON.stringify(wl));
                    if (typeof updateWishlistBadge === 'function') updateWishlistBadge();
                } catch (e) { }
            }
        });
    });

    // 4. Vendor Link
    grid.querySelectorAll('.sf-vendor-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const vendorId = e.currentTarget.dataset.vid;
            window.location.href = `creator.html?id=${vendorId}`;
        });
    });
}

function interceptCategoryChipsClicks() {
    // Also track clicks on the existing category chips from discovery.js
    const chips = document.querySelectorAll('.category-chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            saveSFClick(chip.dataset.cat);
        });
    });
}

/* ═══ BOOT ═══ */
document.addEventListener('DOMContentLoaded', () => {
    // Only run on pages with the feed grid (index.html usually)
    if (document.getElementById('smart-feed-grid')) {
        // Delay slightly to let discovery.js data load if needed
        setTimeout(() => {
            renderSmartFeed();
            interceptCategoryChipsClicks();
        }, 300);
    }
});
