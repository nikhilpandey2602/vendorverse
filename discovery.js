/**
 * VendorVerse — Discovery Module
 * 7 features: Live Search, Category Chips, Filter Panel,
 * Wishlist, Interactive Ratings, Quick View, Micro-animations
 */

/* ────────────────────────────────────────────
   PRODUCT DATA — centralised catalogue
   (extend this array freely)
   ──────────────────────────────────────────── */
const PRODUCT_DATA = [
    {
        id: 'prod_001',
        title: 'Smart Watch Pro X1',
        brand: 'TechPro',
        price: 4999,
        originalPrice: 6999,
        discount: '29% off',
        category: 'tech',
        rating: 4.2,
        ratingCount: 2345,
        badge: '25% OFF',
        delivery: '🚀 Free Delivery',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
        description: 'Premium smartwatch with health tracking, GPS, and 5-day battery life. Pairs seamlessly with iOS and Android.'
    },
    {
        id: 'prod_002',
        title: 'Wireless Earbuds Elite',
        brand: 'SoundMax',
        price: 2499,
        originalPrice: 3999,
        discount: '38% off',
        category: 'tech',
        rating: 5,
        ratingCount: 5678,
        badge: 'Best Seller',
        delivery: '🚀 Free Delivery',
        image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop',
        description: 'Active noise cancellation, 30-hour total playtime, and crystal-clear audio powered by custom-tuned drivers.'
    },
    {
        id: 'prod_003',
        title: 'Ultra Boost Running Shoes',
        brand: 'SprintX',
        price: 3299,
        originalPrice: 4499,
        discount: '27% off',
        category: 'lifestyle',
        rating: 4,
        ratingCount: 1234,
        badge: null,
        delivery: '📦 2-day delivery',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        description: 'Engineered with responsive foam and breathable knit upper for all-day comfort and peak performance.'
    },
    {
        id: 'prod_004',
        title: 'Instant Film Camera Kit',
        brand: 'SnapShot',
        price: 5499,
        originalPrice: 7200,
        discount: '24% off',
        category: 'creator',
        rating: 4.5,
        ratingCount: 876,
        badge: 'New',
        delivery: '🚀 Free Delivery',
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop',
        description: 'Capture memories in an instant. Retro-inspired design with modern optics and 10-pack film included.'
    },
    {
        id: 'prod_005',
        title: 'Minimalist Desk Lamp',
        brand: 'LumeLab',
        price: 1899,
        originalPrice: 2499,
        discount: '24% off',
        category: 'minimal',
        rating: 4.7,
        ratingCount: 654,
        badge: null,
        delivery: '📦 3-day delivery',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        description: 'Adjustable warm/cool LED with touch control dimmer. Slim aluminium body that elevates any workspace.'
    },
    {
        id: 'prod_006',
        title: 'Smart Air Purifier',
        brand: 'AirBreeze',
        price: 8999,
        originalPrice: 12000,
        discount: '25% off',
        category: 'smart-living',
        rating: 4.6,
        ratingCount: 1120,
        badge: 'Trending',
        delivery: '🚀 Free Delivery',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        description: 'HEPA H13 filtration with real-time AQI display and smart home integration. Whisper-quiet at 25dB.'
    },
    {
        id: 'prod_007',
        title: 'Portable Keyboard 75%',
        brand: 'KeyCraft',
        price: 6299,
        originalPrice: 8500,
        discount: '26% off',
        category: 'creator',
        rating: 4.8,
        ratingCount: 432,
        badge: null,
        delivery: '🚀 Free Delivery',
        image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop',
        description: 'Wireless mechanical keyboard with hot-swappable switches, PBT keycaps, and 3-mode connectivity.'
    },
    {
        id: 'prod_008',
        title: 'Linen Throw Blanket',
        brand: 'HomeCraft',
        price: 1299,
        originalPrice: 1999,
        discount: '35% off',
        category: 'minimal',
        rating: 4.3,
        ratingCount: 2891,
        badge: null,
        delivery: '📦 2-day delivery',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
        description: 'Soft pre-washed linen blend. Naturally breathable and gets softer with every wash. 150×200cm.'
    },
    {
        id: 'prod_009',
        title: 'Noise-Cancelling Headphones',
        brand: 'SoundMax',
        price: 12999,
        originalPrice: 17999,
        discount: '28% off',
        category: 'tech',
        rating: 4.9,
        ratingCount: 8734,
        badge: 'Top Rated',
        delivery: '🚀 Free Delivery',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        description: 'Industry-leading active noise cancellation with 40hr battery life and plush memory-foam ear cushions.'
    },
    {
        id: 'prod_010',
        title: 'Premium Yoga Mat',
        brand: 'FlexFit',
        price: 2199,
        originalPrice: 3499,
        discount: '37% off',
        category: 'lifestyle',
        rating: 4.4,
        ratingCount: 3210,
        badge: null,
        delivery: '📦 Free Delivery',
        image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=400&fit=crop',
        description: 'Natural rubber with superior grip texture. 5mm cushioning for joint protection in every pose.'
    },
    {
        id: 'prod_011',
        title: 'Smart LED Strip Kit',
        brand: 'LumiHome',
        price: 1499,
        originalPrice: 2499,
        discount: '40% off',
        category: 'smart-living',
        rating: 4.2,
        ratingCount: 4156,
        badge: '40% OFF',
        delivery: '🚀 Free Delivery',
        image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&h=400&fit=crop',
        description: '5m RGBIC strip with music sync, app control, and 16 million colours. Works with Alexa & Google.'
    },
    {
        id: 'prod_012',
        title: 'Vlogging Microphone',
        brand: 'AudioPro',
        price: 3799,
        originalPrice: 5200,
        discount: '27% off',
        category: 'creator',
        rating: 4.6,
        ratingCount: 1087,
        badge: null,
        delivery: '🚀 Free Delivery',
        image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=400&fit=crop',
        description: 'Cardioid condenser mic with USB-C, 96kHz recording, and plug-and-play for creators and podcasters.'
    }
];

/* ────────────────────────────────────────────
   LOCAL STORAGE KEYS
   ──────────────────────────────────────────── */
const WL_KEY    = 'vendorverse_wishlist';
const RATE_KEY  = 'vendorverse_ratings';
const FILT_KEY  = 'vendorverse_filters';

/* ────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────── */
const getWishlist = () => { try { return JSON.parse(localStorage.getItem(WL_KEY) || '[]'); } catch { return []; } };
const saveWishlist = (wl) => localStorage.setItem(WL_KEY, JSON.stringify(wl));

const getRatings = () => { try { return JSON.parse(localStorage.getItem(RATE_KEY) || '{}'); } catch { return {}; } };
const saveRatings = (r) => localStorage.setItem(RATE_KEY, JSON.stringify(r));

const fmt = (n) => '₹' + n.toLocaleString('en-IN');

function starsHTML(rating) {
    let s = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) s += '★';
        else if (i - rating < 1) s += '½';
        else s += '☆';
    }
    return s;
}

function addRipple(btn, e) {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple-wave';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
}

/* ════════════════════════════════════════════
   1. LIVE SEARCH OVERLAY
   ════════════════════════════════════════════ */
function initLiveSearch() {
    const overlay    = document.getElementById('search-overlay');
    const input      = document.getElementById('search-overlay-input');
    const closeBtn   = document.getElementById('search-overlay-close');
    const resultsEl  = document.getElementById('search-results');
    const openTriggers = document.querySelectorAll('.search-open-btn, .search-btn, .mobile-voice-btn');

    if (!overlay || !input) return;

    const openOverlay = () => {
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        setTimeout(() => input.focus(), 80);
        renderSearchResults('');
    };

    const closeOverlay = () => {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        input.value = '';
    };

    openTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openOverlay();
        });
    });

    closeBtn?.addEventListener('click', closeOverlay);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeOverlay();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeOverlay();
    });

    let debounceT;
    input.addEventListener('input', () => {
        clearTimeout(debounceT);
        debounceT = setTimeout(() => renderSearchResults(input.value.trim()), 120);
    });

    function renderSearchResults(query) {
        if (!resultsEl) return;

        const q = query.toLowerCase();
        const filtered = q.length === 0
            ? PRODUCT_DATA.slice(0, 8)
            : PRODUCT_DATA.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.brand.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q)
            );

        const label = document.getElementById('search-results-label');
        if (label) label.textContent = q ? `Results for "${query}"` : 'All Products';

        if (filtered.length === 0) {
            resultsEl.innerHTML = `<p class="search-no-results">No products found for "${query}"</p>`;
            return;
        }

        resultsEl.innerHTML = filtered.map(p => `
            <div class="search-result-card" data-product-id="${p.id}">
                <img src="${p.image}" alt="${p.title}" loading="lazy">
                <div class="search-result-name">${p.title}</div>
                <div class="search-result-price">${fmt(p.price)}</div>
            </div>
        `).join('');

        resultsEl.querySelectorAll('.search-result-card').forEach(card => {
            card.addEventListener('click', () => {
                const product = PRODUCT_DATA.find(p => p.id === card.dataset.productId);
                if (product) {
                    closeOverlay();
                    openQuickView(product);
                }
            });
        });
    }
}

/* ════════════════════════════════════════════
   2. CURATED CATEGORY CHIPS + DISCOVER GRID
   ════════════════════════════════════════════ */
const CATEGORIES = [
    { id: 'all',          label: 'All',               icon: '✦' },
    { id: 'tech',         label: 'Tech',              icon: '⚡' },
    { id: 'creator',      label: 'Creator Gear',      icon: '🎥' },
    { id: 'lifestyle',    label: 'Lifestyle',         icon: '🌿' },
    { id: 'smart-living', label: 'Smart Living',      icon: '🏠' },
    { id: 'minimal',      label: 'Minimal Essentials',icon: '◻' }
];

let activeCategory  = 'all';
let activePriceMax  = 20000;
let activeRating    = 0;

function initCategoryChips() {
    const chipsWrap = document.getElementById('category-chips');
    if (!chipsWrap) return;

    chipsWrap.innerHTML = CATEGORIES.map(c => `
        <button class="category-chip${c.id === 'all' ? ' active' : ''}"
                data-cat="${c.id}" type="button">
            <span class="chip-icon">${c.icon}</span>${c.label}
        </button>
    `).join('');

    chipsWrap.querySelectorAll('.category-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            chipsWrap.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeCategory = chip.dataset.cat;
            renderDiscoverGrid();
        });
    });

    renderDiscoverGrid();
}

function renderDiscoverGrid() {
    const grid = document.getElementById('discover-grid');
    if (!grid) return;

    let products = PRODUCT_DATA.filter(p => {
        const catOk  = activeCategory === 'all' || p.category === activeCategory;
        const priceOk = p.price <= activePriceMax;
        const rateOk  = p.rating >= activeRating;
        return catOk && priceOk && rateOk;
    });

    if (products.length === 0) {
        grid.innerHTML = `<div class="discover-empty">No products match your filters.</div>`;
        return;
    }

    const wishlist = getWishlist();
    const ratings  = getRatings();

    grid.innerHTML = products.map((p, i) => {
        const wishlisted = wishlist.includes(p.id);
        const userRating = ratings[p.id] || p.rating;
        return `
        <article class="product-card lazy-reveal" data-product-id="${p.id}"
                 style="animation-delay:${i * 60}ms">
            <div class="product-image-container">
                <img src="${p.image}" alt="${p.title}" class="product-image" loading="lazy">
                ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
                <button class="wishlist-btn${wishlisted ? ' wishlisted' : ''}"
                        data-id="${p.id}" aria-label="Toggle wishlist">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="${wishlisted ? '#ef4444' : 'none'}"
                         stroke="${wishlisted ? '#ef4444' : 'currentColor'}" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
                                 a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
                                 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
                <div class="card-quick-actions">
                    <button class="qa-btn qa-cart ripple-container" data-id="${p.id}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        Add to Cart
                    </button>
                    <button class="qa-btn qa-wishlist" data-id="${p.id}">
                        ♡ Wishlist
                    </button>
                    <button class="qa-btn qa-quickview" data-id="${p.id}">
                        ⊕ Quick View
                    </button>
                </div>
            </div>
            <div class="product-info">
                <span class="product-brand">${p.brand}</span>
                <h3 class="product-title">${p.title}</h3>
                <div class="product-rating">
                    <div class="interactive-stars" data-product-id="${p.id}">
                        ${[1,2,3,4,5].map(n => `
                            <button class="star-btn${n <= Math.round(userRating) ? ' filled' : ''}"
                                    data-star="${n}" type="button">★</button>
                        `).join('')}
                    </div>
                    <span class="rating-count">(${p.ratingCount.toLocaleString()})</span>
                </div>
                <div class="product-price">
                    <span class="current-price">${fmt(p.price)}</span>
                    <span class="original-price">${fmt(p.originalPrice)}</span>
                    <span class="discount">${p.discount}</span>
                </div>
                <span class="delivery-info">${p.delivery}</span>
            </div>
            <button class="add-to-cart-btn ripple-container" data-id="${p.id}">Add to Cart</button>
        </article>`;
    }).join('');

    // Attach sub-feature handlers
    attachCardHandlers(grid);
    triggerLazyReveal(grid.querySelectorAll('.lazy-reveal'));
}

/* ════════════════════════════════════════════
   3. FLOATING FILTER PANEL
   ════════════════════════════════════════════ */
function initFilterPanel() {
    const fab     = document.getElementById('filter-fab');
    const panel   = document.getElementById('filter-panel');
    const overlay = document.getElementById('filter-panel-overlay');
    const closeBtn = document.getElementById('filter-panel-close');
    const priceSlider  = document.getElementById('filter-price');
    const priceDisplay = document.getElementById('price-display');
    const applyBtn  = document.getElementById('filter-apply');
    const resetBtn  = document.getElementById('filter-reset');

    if (!fab || !panel) return;

    const openPanel = () => {
        panel.classList.add('open');
        overlay?.classList.add('open');
    };

    const closePanel = () => {
        panel.classList.remove('open');
        overlay?.classList.remove('open');
    };

    fab.addEventListener('click', openPanel);
    closeBtn?.addEventListener('click', closePanel);
    overlay?.addEventListener('click', closePanel);

    priceSlider?.addEventListener('input', () => {
        if (priceDisplay) priceDisplay.textContent = `Up to ${fmt(priceSlider.value)}`;
        updateSliderFill(priceSlider);
    });

    // Rating filter buttons
    document.querySelectorAll('.rating-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.rating-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    applyBtn?.addEventListener('click', () => {
        const selRating = document.querySelector('.rating-filter-btn.active');
        activePriceMax = Number(priceSlider?.value || 20000);
        activeRating   = selRating ? Number(selRating.dataset.rating) : 0;
        renderDiscoverGrid();
        closePanel();
    });

    resetBtn?.addEventListener('click', () => {
        activePriceMax = 20000;
        activeRating   = 0;
        if (priceSlider) { priceSlider.value = 20000; if (priceDisplay) priceDisplay.textContent = `Up to ${fmt(20000)}`; }
        document.querySelectorAll('.rating-filter-btn').forEach(b => b.classList.remove('active'));
        renderDiscoverGrid();
    });
}

function updateSliderFill(slider) {
    const min = Number(slider.min) || 0;
    const max = Number(slider.max) || 20000;
    const val = Number(slider.value);
    const pct = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${pct}%, var(--color-border) ${pct}%)`;
}

/* ════════════════════════════════════════════
   4. WISHLIST SYSTEM
   ════════════════════════════════════════════ */
function initWishlistSystem() {
    updateWishlistBadge();
}

function toggleWishlist(productId, btn) {
    let wl = getWishlist();
    const idx = wl.indexOf(productId);

    if (idx === -1) {
        wl.push(productId);
        btn?.classList.add('wishlisted');
        if (btn) {
            const svg = btn.querySelector('svg');
            if (svg) { svg.setAttribute('fill', '#ef4444'); svg.setAttribute('stroke', '#ef4444'); }
            btn.classList.add('wishlist-pop');
            setTimeout(() => btn.classList.remove('wishlist-pop'), 300);
        }
        if (typeof showToast === 'function') showToast('Added to wishlist', 'success');
    } else {
        wl.splice(idx, 1);
        btn?.classList.remove('wishlisted');
        if (btn) {
            const svg = btn.querySelector('svg');
            if (svg) { svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); }
        }
        if (typeof showToast === 'function') showToast('Removed from wishlist', 'info');
    }

    saveWishlist(wl);
    updateWishlistBadge();
}

function updateWishlistBadge() {
    const wl = getWishlist();
    const badge = document.getElementById('wishlist-badge');
    if (!badge) return;
    if (wl.length > 0) {
        badge.textContent = wl.length;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

/* ════════════════════════════════════════════
   5. INTERACTIVE RATINGS
   ════════════════════════════════════════════ */
function attachRatings(container) {
    container.querySelectorAll('.interactive-stars').forEach(starsEl => {
        const productId = starsEl.dataset.productId;
        const stars  = starsEl.querySelectorAll('.star-btn');

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const val = Number(star.dataset.star);
                const ratings = getRatings();
                ratings[productId] = val;
                saveRatings(ratings);

                // Update visual
                stars.forEach((s, i) => {
                    s.classList.toggle('filled', i < val);
                });

                if (typeof showToast === 'function') showToast(`Rated ${val} star${val !== 1 ? 's' : ''}`, 'success');
            });

            // Hover preview
            star.addEventListener('mouseenter', () => {
                const hoverVal = Number(star.dataset.star);
                stars.forEach((s, i) => s.classList.toggle('filled', i < hoverVal));
            });
        });

        starsEl.addEventListener('mouseleave', () => {
            const ratings = getRatings();
            const saved = ratings[productId] || PRODUCT_DATA.find(p => p.id === productId)?.rating || 0;
            stars.forEach((s, i) => s.classList.toggle('filled', i < Math.round(saved)));
        });
    });
}

/* ════════════════════════════════════════════
   6. QUICK VIEW MODAL
   ════════════════════════════════════════════ */
function initQuickView() {
    const modal   = document.getElementById('quickview-modal');
    const closeBtn = document.getElementById('quickview-close');
    if (!modal) return;

    modal.querySelector('.modal-backdrop')?.addEventListener('click', closeQuickView);
    closeBtn?.addEventListener('click', closeQuickView);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeQuickView();
    });
}

function openQuickView(product) {
    const modal = document.getElementById('quickview-modal');
    if (!modal) return;

    const wl = getWishlist();
    const wishlisted = wl.includes(product.id);

    modal.querySelector('#qv-image').src   = product.image;
    modal.querySelector('#qv-image').alt   = product.title;
    modal.querySelector('#qv-brand').textContent  = product.brand;
    modal.querySelector('#qv-title').textContent  = product.title;
    modal.querySelector('#qv-stars').textContent  = starsHTML(product.rating);
    modal.querySelector('#qv-count').textContent  = `(${product.ratingCount.toLocaleString()} reviews)`;
    modal.querySelector('#qv-price').textContent  = fmt(product.price);
    modal.querySelector('#qv-orig').textContent   = fmt(product.originalPrice);
    modal.querySelector('#qv-disc').textContent   = product.discount;
    modal.querySelector('#qv-desc').textContent   = product.description;
    modal.querySelector('#qv-cat').textContent    = CATEGORIES.find(c => c.id === product.category)?.label || product.category;
    if (product.badge) {
        modal.querySelector('#qv-badge').textContent = product.badge;
        modal.querySelector('#qv-badge').style.display = '';
    } else {
        modal.querySelector('#qv-badge').style.display = 'none';
    }

    // Cart button
    const addBtn = modal.querySelector('#qv-add-cart');
    addBtn.onclick = () => {
        addToDiscoverCart(product);
        closeQuickView();
    };

    // Wishlist button
    const wlBtn = modal.querySelector('#qv-wishlist-btn');
    wlBtn.style.color = wishlisted ? '#ef4444' : '';
    wlBtn.onclick = () => { toggleWishlist(product.id, null); closeQuickView(); };

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeQuickView() {
    const modal = document.getElementById('quickview-modal');
    modal?.classList.remove('open');
    document.body.style.overflow = '';
}

/* ════════════════════════════════════════════
   7. MICRO-ANIMATIONS
   ════════════════════════════════════════════ */
function triggerLazyReveal(elements) {
    if (!elements || elements.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
}

function initMicroAnimations() {
    // Ripple on any .ripple-container
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.ripple-container');
        if (btn) addRipple(btn, e);
    });

    // Lazy reveal existing product cards (from the HTML)
    document.querySelectorAll('.product-card').forEach(card => {
        card.classList.add('lazy-reveal');
    });
    triggerLazyReveal(document.querySelectorAll('.product-card.lazy-reveal'));
}

/* ════════════════════════════════════════════
   CARD EVENT DELEGATION (attach to a grid container)
   ════════════════════════════════════════════ */
function attachCardHandlers(container) {
    // Wishlist buttons
    container.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(btn.dataset.id, btn);
        });
    });

    // Quick-action: Add to Cart
    container.querySelectorAll('.qa-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const product = PRODUCT_DATA.find(p => p.id === btn.dataset.id);
            if (product) addToDiscoverCart(product);
        });
    });

    // Quick-action: Wishlist
    container.querySelectorAll('.qa-wishlist').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.product-card');
            const wlBtn = card?.querySelector('.wishlist-btn');
            toggleWishlist(btn.dataset.id, wlBtn);
        });
    });

    // Quick-action: Quick View
    container.querySelectorAll('.qa-quickview').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const product = PRODUCT_DATA.find(p => p.id === btn.dataset.id);
            if (product) openQuickView(product);
        });
    });

    // Add to Cart (bottom of card)
    container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const product = PRODUCT_DATA.find(p => p.id === btn.dataset.id);
            if (product) addToDiscoverCart(product);
        });
    });

    // Interactive ratings
    attachRatings(container);
}

/* ════════════════════════════════════════════
   ADD TO CART BRIDGE
   calls existing cart.js addToCart or falls back
   ════════════════════════════════════════════ */
function addToDiscoverCart(product) {
    const cartItem = {
        id: product.id,
        productId: product.id,
        title: product.title,
        brand: product.brand,
        price: product.price,
        image: product.image,
        quantity: 1
    };

    if (typeof window.addToCart === 'function') {
        window.addToCart(cartItem);
    } else {
        const CART_KEY = 'vendorverse_cart';
        let cart = [];
        try { cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch {}
        const existing = cart.find(i => i.id === product.id);
        if (existing) { existing.quantity += 1; }
        else { cart.push({ ...cartItem }); }
        localStorage.setItem(CART_KEY, JSON.stringify(cart));

        // Update badge
        if (typeof updateCartBadgeCount === 'function') updateCartBadgeCount();
        if (typeof showToast === 'function') showToast('Added to cart', 'success');
    }
}

/* ════════════════════════════════════════════
   ALSO attach handlers to existing HTML product cards
   (the ones hard-coded in index.html)
   ════════════════════════════════════════════ */
function upgradeExistingCards() {
    document.querySelectorAll('.product-card').forEach((card, idx) => {
        // Skip cards that already have quick-actions
        if (card.querySelector('.card-quick-actions')) return;

        // Try to find a product match by title text
        const titleEl = card.querySelector('.product-title');
        const priceEl = card.querySelector('.current-price');
        const imgEl   = card.querySelector('.product-image');
        const brandEl = card.querySelector('.product-brand');

        const title = titleEl?.textContent?.trim() || '';
        const match = PRODUCT_DATA.find(p => p.title === title);
        const productId = match ? match.id : `card_${idx}`;
        const price = match ? match.price : parseInt((priceEl?.textContent || '0').replace(/[₹,]/g, '')) || 0;
        const image = imgEl?.src || '';
        const brand = brandEl?.textContent?.trim() || '';

        // Inject quick-action overlay into image container
        const imgContainer = card.querySelector('.product-image-container');
        if (imgContainer && !imgContainer.querySelector('.card-quick-actions')) {
            const overlay = document.createElement('div');
            overlay.className = 'card-quick-actions';
            overlay.innerHTML = `
                <button class="qa-btn qa-cart ripple-container" data-id="${productId}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    Add to Cart
                </button>
                <button class="qa-btn qa-quickview" data-id="${productId}">⊕ Quick View</button>
            `;
            imgContainer.appendChild(overlay);
        }

        // Ensure wishlist-btn has data-id
        const wlBtn = card.querySelector('.wishlist-btn');
        if (wlBtn && !wlBtn.dataset.id) wlBtn.dataset.id = productId;

        // Add data-id to add-to-cart-btn
        const atcBtn = card.querySelector('.add-to-cart-btn');
        if (atcBtn && !atcBtn.dataset.id) atcBtn.dataset.id = productId;

        // Store fallback data for quick view
        if (!match) {
            PRODUCT_DATA.push({
                id: productId, title, brand, price, originalPrice: price,
                discount: '', category: 'all', rating: 4, ratingCount: 0,
                badge: null, delivery: '', image,
                description: `Premium product — ${title} by ${brand}.`
            });
        }
    });

    // Delegate events on whole document for existing cards
    document.querySelectorAll('.product-card').forEach(card => {
        const wlBtn  = card.querySelector('.wishlist-btn');
        const atcBtn = card.querySelector('.add-to-cart-btn');

        wlBtn?.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            toggleWishlist(wlBtn.dataset.id, wlBtn);
        });

        card.querySelector('.qa-cart')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const p = PRODUCT_DATA.find(x => x.id === e.currentTarget.dataset.id);
            if (p) addToDiscoverCart(p);
        });

        card.querySelector('.qa-quickview')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const p = PRODUCT_DATA.find(x => x.id === e.currentTarget.dataset.id);
            if (p) openQuickView(p);
        });
    });
}

/* ════════════════════════════════════════════
   BOOT — runs after DOM ready
   ════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    initLiveSearch();
    initCategoryChips();
    initFilterPanel();
    initWishlistSystem();
    initQuickView();
    initMicroAnimations();
    upgradeExistingCards();

    // Init price slider fill on load
    const slider = document.getElementById('filter-price');
    if (slider) updateSliderFill(slider);

    console.log('%c🚀 VendorVerse Discovery Module Loaded', 'color: #8b5cf6; font-weight: bold;');
});
