/**
 * VendorVerse — Creator Profile Storefront
 * Loads creator data, featured product, and collection grid
 */

/* ═══════ CONSTANTS ═══════ */
const CREATORS_KEY = 'vendorverse_creators';
const VENDOR_PRODUCTS_KEY_CP = 'vendorverse_vendor_products';
const WISHLIST_KEY_CP = 'vendorverse_wishlist';
const CART_KEY_CP = 'vendorverse_cart';

/* ═══════ DEFAULT CREATORS ═══════ */
const DEFAULT_CREATORS = [
    {
        creatorId: 'creator_artisan',
        name: 'Artisan Studio',
        bio: 'Crafting premium lifestyle products with minimalist aesthetics and sustainable materials.',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AS&backgroundColor=6366f1&textColor=ffffff',
        joinDate: '2025-03-15',
        rating: 4.8,
        followers: 12400
    },
    {
        creatorId: 'creator_techpro',
        name: 'TechPro Labs',
        bio: 'Next-gen consumer electronics designed for the modern creator. Innovation meets elegance.',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TP&backgroundColor=0ea5e9&textColor=ffffff',
        joinDate: '2024-11-01',
        rating: 4.6,
        followers: 8700
    },
    {
        creatorId: 'creator_zenspace',
        name: 'ZenSpace Home',
        bio: 'Curated home essentials that bring calm and beauty to your everyday spaces.',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=ZH&backgroundColor=10b981&textColor=ffffff',
        joinDate: '2025-01-20',
        rating: 4.9,
        followers: 5300
    }
];

/* ═══════ STORAGE ═══════ */
function getCreators() {
    try { return JSON.parse(localStorage.getItem(CREATORS_KEY) || '[]'); }
    catch { return []; }
}

function saveCreators(creators) {
    localStorage.setItem(CREATORS_KEY, JSON.stringify(creators));
}

function getCreatorById(id) {
    let creators = getCreators();
    let creator = creators.find(c => c.creatorId === id);
    if (!creator) {
        // Check defaults
        creator = DEFAULT_CREATORS.find(c => c.creatorId === id);
        if (creator) {
            creators.push(creator);
            saveCreators(creators);
        } else {
            // Auto-generate for unknown vendor IDs
            creator = {
                creatorId: id,
                name: 'Creator ' + id.replace('vendor_', '').slice(0, 6),
                bio: 'A VendorVerse creator building amazing products.',
                avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${id.slice(-4)}&backgroundColor=8b5cf6&textColor=ffffff`,
                joinDate: new Date().toISOString().split('T')[0],
                rating: 4.0 + +(Math.random() * 0.9).toFixed(1),
                followers: Math.floor(Math.random() * 5000) + 500
            };
            creators.push(creator);
            saveCreators(creators);
        }
    }
    return creator;
}

function getCreatorProducts(creatorId) {
    try {
        const all = JSON.parse(localStorage.getItem(VENDOR_PRODUCTS_KEY_CP) || '[]');
        return all.filter(p => p.vendorId === creatorId);
    } catch { return []; }
}

function getWishlistCP() {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY_CP) || '[]'); } catch { return []; }
}

function saveWishlistCP(wl) { localStorage.setItem(WISHLIST_KEY_CP, JSON.stringify(wl)); }

/* ═══════ HELPERS ═══════ */
function fmtPrice(n) { return '₹' + n.toLocaleString('en-IN'); }

function starsString(rating) {
    let s = '';
    for (let i = 1; i <= 5; i++) {
        s += i <= Math.round(rating) ? '★' : '☆';
    }
    return s;
}

function toastCP(msg, type) {
    if (typeof showToast === 'function') showToast(msg, type);
    else console.log('[Toast]', msg);
}

/* ═══════ WISHLIST TOGGLE ═══════ */
function toggleWishlistCP(productId, btn) {
    let wl = getWishlistCP();
    const idx = wl.indexOf(productId);
    if (idx === -1) {
        wl.push(productId);
        btn?.classList.add('active');
        if (btn) { const svg = btn.querySelector('svg'); if (svg) { svg.setAttribute('fill', '#ef4444'); svg.setAttribute('stroke', '#ef4444'); } }
        toastCP('Added to wishlist', 'success');
    } else {
        wl.splice(idx, 1);
        btn?.classList.remove('active');
        if (btn) { const svg = btn.querySelector('svg'); if (svg) { svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); } }
        toastCP('Removed from wishlist', 'info');
    }
    saveWishlistCP(wl);
}

/* ═══════ ADD TO CART ═══════ */
function addToCartCP(product) {
    let cart = [];
    try { cart = JSON.parse(localStorage.getItem(CART_KEY_CP) || '[]'); } catch { }
    const existing = cart.find(i => i.id === product.id);
    if (existing) { existing.quantity += 1; }
    else {
        cart.push({
            id: product.id,
            productId: product.id,
            title: product.name,
            brand: 'Creator',
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    localStorage.setItem(CART_KEY_CP, JSON.stringify(cart));
    if (typeof updateCartBadgeCount === 'function') updateCartBadgeCount();
    toastCP('Added to cart', 'success');
}

/* ═══════ RENDER PROFILE PAGE ═══════ */
function renderCreatorProfile() {
    const params = new URLSearchParams(window.location.search);
    const creatorId = params.get('id');
    if (!creatorId) {
        document.getElementById('cp-content').innerHTML = '<div class="cp-empty"><div class="cp-empty-icon">🔍</div><p class="cp-empty-text">No creator specified. Go back to the store.</p></div>';
        return;
    }

    const creator = getCreatorById(creatorId);
    const products = getCreatorProducts(creatorId);
    const wishlist = getWishlistCP();

    // Header
    document.getElementById('cp-name').textContent = creator.name;
    document.getElementById('cp-bio').textContent = creator.bio;
    document.getElementById('cp-avatar').src = creator.avatar;
    document.getElementById('cp-avatar').alt = creator.name;
    document.getElementById('cp-join-date').textContent = new Date(creator.joinDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    document.getElementById('cp-followers').textContent = creator.followers.toLocaleString();
    document.getElementById('cp-rating-stars').textContent = starsString(creator.rating);
    document.getElementById('cp-rating-num').textContent = creator.rating.toFixed(1);

    // Featured product
    const featuredSection = document.getElementById('cp-featured');
    if (products.length > 0) {
        const featured = products[products.length - 1]; // latest
        const isFeaturedWished = wishlist.includes(featured.id);
        featuredSection.innerHTML = `
            <h2 class="cp-section-title">✦ Featured</h2>
            <div class="cp-featured-card">
                <img class="cp-featured-img" src="${featured.image}" alt="${featured.name}" loading="lazy">
                <div class="cp-featured-body">
                    <span class="cp-featured-badge">★ Latest</span>
                    <h3 class="cp-featured-name">${featured.name}</h3>
                    <p class="cp-featured-desc">${featured.description || 'A premium product by ' + creator.name + '.'}</p>
                    <div class="cp-featured-price-row">
                        <span class="cp-featured-price">${fmtPrice(featured.price)}</span>
                        ${featured.originalPrice ? `<span class="cp-featured-original">${fmtPrice(featured.originalPrice)}</span>` : ''}
                    </div>
                    <div class="cp-featured-actions">
                        <button class="cp-btn-cart" id="featured-cart-btn">Add to Cart</button>
                        <button class="cp-btn-wish${isFeaturedWished ? ' active' : ''}" id="featured-wish-btn" aria-label="Wishlist">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFeaturedWished ? '#ef4444' : 'none'}" stroke="${isFeaturedWished ? '#ef4444' : 'currentColor'}" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>`;
        document.getElementById('featured-cart-btn')?.addEventListener('click', () => addToCartCP(featured));
        document.getElementById('featured-wish-btn')?.addEventListener('click', function () { toggleWishlistCP(featured.id, this); });
    } else {
        featuredSection.innerHTML = '';
    }

    // Collection grid
    const gridEl = document.getElementById('cp-grid');
    if (products.length === 0) {
        gridEl.innerHTML = `
            <div class="cp-empty">
                <div class="cp-empty-icon">🎨</div>
                <p class="cp-empty-text">This creator is preparing their first collection.</p>
            </div>`;
        return;
    }

    gridEl.innerHTML = products.map((p, i) => {
        const isWished = wishlist.includes(p.id);
        const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) + '% off' : '';
        return `
        <div class="cp-product-card" style="animation-delay:${i * 60}ms" data-id="${p.id}">
            <div class="cp-card-img-wrap">
                <img class="cp-card-img" src="${p.image}" alt="${p.name}" loading="lazy">
                ${p.status === 'live' ? '<span class="cp-card-badge">Live</span>' : ''}
                <button class="cp-card-wishlist${isWished ? ' active' : ''}" data-id="${p.id}" aria-label="Wishlist">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="${isWished ? '#ef4444' : 'none'}" stroke="${isWished ? '#ef4444' : 'currentColor'}" stroke-width="2.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
                <div class="cp-card-actions-overlay">
                    <button class="cp-qa-btn cp-add-cart" data-id="${p.id}">Add to Cart</button>
                </div>
            </div>
            <div class="cp-card-body">
                <div class="cp-card-name">${p.name}</div>
                <div class="cp-card-rating">
                    <span class="cp-card-stars">${starsString(p.rating || 4)}</span>
                    <span>(${(p.ratingCount || 0).toLocaleString()})</span>
                </div>
                <div class="cp-card-price-row">
                    <span class="cp-card-price">${fmtPrice(p.price)}</span>
                    ${p.originalPrice ? `<span class="cp-card-orig">${fmtPrice(p.originalPrice)}</span>` : ''}
                    ${discount ? `<span class="cp-card-discount">${discount}</span>` : ''}
                </div>
            </div>
        </div>`;
    }).join('');

    // Event delegation for grid
    gridEl.querySelectorAll('.cp-card-wishlist').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleWishlistCP(btn.dataset.id, btn);
        });
    });

    gridEl.querySelectorAll('.cp-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const product = products.find(p => p.id === btn.dataset.id);
            if (product) addToCartCP(product);
        });
    });
}

/* ═══════ FLOATING NAVBAR SCROLL ═══════ */
function initNavbarScroll() {
    const navbar = document.getElementById('cp-navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 200);
    }, { passive: true });
}

/* ═══════ "VIEW CREATOR" INJECTION (for other pages) ═══════ */
function injectViewCreatorLinks() {
    // Only run on pages with product cards (not the creator profile page itself)
    if (document.getElementById('creator-profile-page')) return;

    // For discovery grid product cards - inject "View Creator" link
    const vendorProducts = (() => {
        try { return JSON.parse(localStorage.getItem(VENDOR_PRODUCTS_KEY_CP) || '[]'); } catch { return []; }
    })();

    // Map product IDs to vendor IDs
    const productVendorMap = {};
    vendorProducts.forEach(vp => { productVendorMap[vp.id] = vp.vendorId; });

    // Also register default creators for PRODUCT_DATA items
    if (typeof PRODUCT_DATA !== 'undefined') {
        PRODUCT_DATA.forEach(p => {
            if (p.badge === 'Creator' && p.id && !productVendorMap[p.id]) {
                // Find matching vendor product
                const vp = vendorProducts.find(v => v.id === p.id);
                if (vp) productVendorMap[p.id] = vp.vendorId;
            }
        });
    }

    // Inject "View Creator" into .product-card elements that have a data-product-id
    document.querySelectorAll('.product-card[data-product-id]').forEach(card => {
        const productId = card.dataset.productId;
        const vendorId = productVendorMap[productId];
        if (!vendorId) return;
        if (card.querySelector('.view-creator-link')) return; // skip if already injected

        const infoSection = card.querySelector('.product-info');
        if (infoSection) {
            const link = document.createElement('a');
            link.className = 'view-creator-link';
            link.href = `creator.html?id=${vendorId}`;
            link.innerHTML = `
                ★ View Creator
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>`;
            infoSection.appendChild(link);
        }
    });
}

/* ═══════ SEED DEFAULT PRODUCTS FOR DEFAULT CREATORS ═══════ */
function seedDefaultCreatorProducts() {
    const existing = (() => {
        try { return JSON.parse(localStorage.getItem(VENDOR_PRODUCTS_KEY_CP) || '[]'); } catch { return []; }
    })();

    // Only seed if no vendor products exist yet
    if (existing.length > 0) return;

    const seedProducts = [
        {
            id: 'vp_seed_1', vendorId: 'creator_artisan', name: 'Handmade Ceramic Mug',
            description: 'Earth-toned ceramic mug with matte glaze. Microwave safe, 350ml capacity.',
            price: 899, originalPrice: 1299, category: 'minimal',
            image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop',
            rating: 4.7, ratingCount: 340, createdAt: '2025-06-01T10:00:00Z', status: 'live'
        },
        {
            id: 'vp_seed_2', vendorId: 'creator_artisan', name: 'Linen Tote Bag',
            description: 'Oversized washed linen tote with internal pocket. Natural dye, every piece unique.',
            price: 1499, originalPrice: 2199, category: 'lifestyle',
            image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop',
            rating: 4.5, ratingCount: 210, createdAt: '2025-07-10T12:00:00Z', status: 'live'
        },
        {
            id: 'vp_seed_3', vendorId: 'creator_techpro', name: 'USB-C Charging Dock',
            description: '6-in-1 aluminium dock with 100W PD, HDMI 4K, and SD/microSD slots.',
            price: 3499, originalPrice: 4999, category: 'tech',
            image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&h=400&fit=crop',
            rating: 4.6, ratingCount: 780, createdAt: '2025-05-20T09:00:00Z', status: 'live'
        },
        {
            id: 'vp_seed_4', vendorId: 'creator_techpro', name: 'Ergonomic Mouse Pad',
            description: 'Memory foam wrist rest, micro-weave surface, non-slip base. 30×25cm.',
            price: 799, originalPrice: 1199, category: 'tech',
            image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
            rating: 4.3, ratingCount: 1200, createdAt: '2025-08-01T14:00:00Z', status: 'live'
        },
        {
            id: 'vp_seed_5', vendorId: 'creator_zenspace', name: 'Soy Wax Candle Set',
            description: 'Set of 3 hand-poured soy candles. Lavender, vanilla, and sandalwood. 40hr burn each.',
            price: 1299, originalPrice: 1899, category: 'minimal',
            image: 'https://images.unsplash.com/photo-1602607742011-63004513a267?w=400&h=400&fit=crop',
            rating: 4.9, ratingCount: 560, createdAt: '2025-04-15T08:00:00Z', status: 'live'
        },
        {
            id: 'vp_seed_6', vendorId: 'creator_zenspace', name: 'Bamboo Desk Organizer',
            description: 'Modular bamboo organiser with phone stand, pen holder, and cable groove.',
            price: 1699, originalPrice: 2499, category: 'smart-living',
            image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop',
            rating: 4.7, ratingCount: 430, createdAt: '2025-09-05T11:00:00Z', status: 'live'
        }
    ];

    localStorage.setItem(VENDOR_PRODUCTS_KEY_CP, JSON.stringify(seedProducts));
}

/* ═══════ BOOT ═══════ */
document.addEventListener('DOMContentLoaded', () => {
    // Seed default creator products on first visit
    seedDefaultCreatorProducts();

    // If on creator profile page
    if (document.getElementById('creator-profile-page')) {
        renderCreatorProfile();
        initNavbarScroll();
    }

    // On any page: inject "View Creator" links into product cards
    // Delayed slightly so discovery.js renders cards first
    setTimeout(() => injectViewCreatorLinks(), 300);
});
