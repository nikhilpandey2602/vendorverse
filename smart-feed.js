/**
 * VendorVerse — Smart Marketplace Feed
 * Replaces static lists with a scrolling discovery feed
 * Powered by simulated user preferences (clicks & wishlist)
 */

/* ═══ CONSTANTS & STORAGE KEYS ═══ */
const SF_CLICKS_KEY = 'vendorverse_clicks';
// Relies on WL_KEY from discovery.js and PRODUCT_DATA from discovery.js
// Also relies on VENDOR_PRODUCTS_KEY_CP from creator-profile.js if available
const SF_DROPS_KEY = 'vendorverse_product_drops';
const SF_FOLLOW_KEY = 'vendorverse_followed_creators';
const SF_CREATORS_KEY = 'vendorverse_creators';

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

function getSFDrops() {
    let drops = [];
    try { drops = JSON.parse(localStorage.getItem(SF_DROPS_KEY) || '[]'); } catch { }
    // Also merge drops from creator-drops.js storage (vendorverse_drops)
    try {
        const cdDrops = JSON.parse(localStorage.getItem('vendorverse_drops') || '[]');
        const existingIds = new Set(drops.map(d => d.id));
        cdDrops.forEach(d => { if (!existingIds.has(d.id)) drops.push(d); });
    } catch { }
    return drops;
}

function saveSFDrops(drops) {
    localStorage.setItem(SF_DROPS_KEY, JSON.stringify(drops));
}

function getSFFollowedCreators() {
    try { return JSON.parse(localStorage.getItem(SF_FOLLOW_KEY) || '[]'); }
    catch { return []; }
}

function sfFormatCountdown(endsAt) {
    if (!endsAt) return 'Ended';
    const end = new Date(endsAt).getTime();
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) return 'Ended';
    const totalSec = Math.floor(diff / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m}m left`;
    if (m > 0) return `${m}m ${s}s left`;
    return `${s}s left`;
}

function getCreatorNameByIdSF(creatorId) {
    if (!creatorId) return 'Creator';
    try {
        const creators = JSON.parse(localStorage.getItem(SF_CREATORS_KEY) || '[]');
        const match = creators.find(c => c.creatorId === creatorId);
        return match?.name || 'Creator';
    } catch {
        return 'Creator';
    }
}

function getActiveDropsForFollowedCreators() {
    const drops = getSFDrops();
    const followed = new Set(getSFFollowedCreators());
    const now = Date.now();
    const active = [];
    let changed = false;

    drops.forEach(d => {
        const end = new Date(d.endsAt).getTime();
        if (end <= now) {
            if (d.status !== 'ended') {
                d.status = 'ended';
                changed = true;
            }
            return;
        }
        if (d.status !== 'live') return;
        if (!followed.has(d.creatorId)) return;
        active.push(d);
    });

    if (changed) saveSFDrops(drops);

    active.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return active;
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

    // Active drops — show all live drops (not just followed creators)
    const allDrops = getSFDrops();
    const now = Date.now();
    const activeDrops = allDrops.filter(d => {
        const end = new Date(d.endsAt).getTime();
        return end > now && d.status === 'live';
    });
    activeDrops.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const dropProductIds = new Set(activeDrops.map(d => d.productId));

    // Score and sort non-drop products
    const baseProducts = allProducts.filter(p => !dropProductIds.has(p.id));
    const scoredProducts = baseProducts.map(scoreProduct);
    scoredProducts.sort((a, b) => b.score - a.score);

    // Live Drop Room cards (at very top)
    let liveRoomsHtml = '';
    if (typeof drGetLiveRooms === 'function') {
        const liveRooms = drGetLiveRooms();
        const drops = getSFDrops();
        liveRoomsHtml = liveRooms.map((room, i) => {
            const drop = drops.find(d => d.id === room.dropId);
            if (!drop) return '';
            const creatorName = getCreatorNameByIdSF(room.creatorId);
            const dropPrice = drop.dropPrice || drop.price || 0;
            const isLive = room.status === 'live';
            const statusClass = isLive ? 'live' : 'waiting';
            const statusText = isLive ? '● LIVE' : '⏱ STARTING SOON';
            const unlockTime = new Date(room.unlockAt).getTime();
            const countdown = isLive ? 'Drop is LIVE!' : sfFormatCountdown(room.unlockAt);
            return `
            <article class="sf-live-room ${statusClass}" style="animation-delay:${i * 60}ms">
                <div class="sf-lr-header">
                    <span class="sf-lr-badge ${statusClass}">
                        ${isLive ? '<span class="sf-lr-dot"></span>' : ''}
                        ${statusText}
                    </span>
                    <span class="sf-lr-viewers"><span class="sf-lr-viewer-dot"></span> ${room.viewers || 0} watching</span>
                </div>
                <div class="sf-lr-body">
                    <img class="sf-lr-img" src="${drop.image}" alt="${drop.title}" loading="lazy">
                    <div class="sf-lr-info">
                        <div class="sf-lr-label">DROP ROOM</div>
                        <h3 class="sf-lr-title">${drop.title}</h3>
                        <div class="sf-lr-creator">🎨 ${creatorName}</div>
                        <div class="sf-lr-price">${sfFmt(dropPrice)} ${drop.originalPrice ? '<span class="sf-lr-orig">' + sfFmt(drop.originalPrice) + '</span>' : ''}</div>
                        <div class="sf-lr-countdown">${countdown}</div>
                    </div>
                </div>
                <a href="drop-room?id=${room.id}" class="sf-lr-join">🎥 Join Room →</a>
            </article>`;
        }).join('');
    }

    // Render Drop cards (if any) followed by regular smart feed cards
    const dropsHtml = activeDrops.length ? activeDrops.map((drop, i) => {
        const creatorName = getCreatorNameByIdSF(drop.creatorId);
        const dropPrice = drop.dropPrice || drop.price || 0;
        return `
        <article class="sf-drop-card" data-drop-id="${drop.id}" style="animation-delay:${i * 40}ms;">
            <div class="sf-drop-main">
                <div class="sf-drop-pill-row">
                    <span class="sf-drop-pill">🔥 Creator Drop</span>
                    <span class="sf-drop-creator">${creatorName}</span>
                </div>
                <h3 class="sf-drop-title">${drop.title}</h3>
                <p class="sf-drop-promo">Limited-time collab · Creator 12% · Platform 7% · Vendor 81%</p>
                <div class="sf-drop-price-row">
                    <span class="sf-drop-price">${sfFmt(dropPrice)}</span>
                    ${drop.originalPrice ? `<span class="sf-drop-orig">${sfFmt(drop.originalPrice)}</span>` : ''}
                </div>
                <div class="sf-drop-timer-row">
                    <span class="sf-drop-timer-label">Ends in</span>
                    <span class="sf-drop-countdown" data-drop-countdown="${drop.id}">${sfFormatCountdown(drop.endsAt)}</span>
                </div>
                <a href="creator-drops?id=${drop.id}" class="sf-drop-buy-btn">View Drop →</a>
            </div>
            <div class="sf-drop-image-wrap">
                <img src="${drop.image}" alt="${drop.title}" class="sf-drop-img" loading="lazy">
            </div>
        </article>
        `;
    }).join('') : '';

    const productsHtml = scoredProducts.map((item, i) => {
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

    grid.innerHTML = liveRoomsHtml + dropsHtml + productsHtml;

    attachSmartFeedHandlers(grid, baseProducts);
    attachDropHandlers(grid, allProducts);
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

function attachDropHandlers(grid, feedProducts) {
    // Buy from Drop → cart
    grid.querySelectorAll('.sf-drop-buy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = e.currentTarget.dataset.dropBuy;
            const dropId = e.currentTarget.dataset.dropId;
            const p = feedProducts.find(x => x.id === productId);
            const fallbackProduct = p || null;

            const payload = fallbackProduct ? {
                id: fallbackProduct.id,
                productId: fallbackProduct.id,
                title: fallbackProduct.title || fallbackProduct.name,
                brand: fallbackProduct.brand || 'Creator',
                price: fallbackProduct.price,
                image: fallbackProduct.image
            } : null;

            if (!payload) return;

            if (typeof addToDiscoverCart === 'function') {
                addToDiscoverCart({
                    id: payload.id,
                    productId: payload.id,
                    title: payload.title,
                    brand: payload.brand,
                    price: payload.price,
                    image: payload.image
                });
            } else if (typeof addToCart === 'function') {
                addToCart(payload);
            }

            if (dropId) {
                trackDropSaleSF(dropId, payload.price);
            }
        });
    });

    // Countdown updater
    const countdownEls = grid.querySelectorAll('.sf-drop-countdown');
    if (countdownEls.length === 0) return;

    const updateCountdowns = () => {
        const drops = getSFDrops();
        countdownEls.forEach(el => {
            const dropId = el.dataset.dropCountdown;
            const d = drops.find(x => x.id === dropId);
            if (!d) return;
            el.textContent = sfFormatCountdown(d.endsAt);
        });
    };

    updateCountdowns();
    setInterval(updateCountdowns, 1000);
}

function trackDropSaleSF(dropId, amount) {
    const drops = getSFDrops();
    const idx = drops.findIndex(d => d.id === dropId);
    if (idx === -1) return;
    const d = drops[idx];
    d.soldQuantity = (d.soldQuantity || 0) + 1;
    d.salesAmount = (d.salesAmount || 0) + (amount || 0);
    saveSFDrops(drops);
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
