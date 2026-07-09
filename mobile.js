/**
 * VendorVerse — Mobile JavaScript Interactions
 * Scoped for screens below 768px
 */

document.addEventListener('DOMContentLoaded', () => {
    // Only execute on screens below 768px
    if (window.innerWidth >= 768) return;

    initMobileRedesign();
});

function initMobileRedesign() {
    // ── 1. BOTTOM NAVIGATION BAR INJECTION ──
    injectBottomNav();

    // ── 2. MOBILE NAVBAR INTERACTIONS ──
    setupMobileNavbar();

    // ── 3. PAGE-SPECIFIC ENHANCEMENTS ──
    enhancePageSpecifics();
}

function injectBottomNav() {
    if (document.querySelector('.vv-bottom-nav')) return;

    const bottomNav = document.createElement('div');
    bottomNav.className = 'vv-bottom-nav';

    // Get current filename to determine active tab
    const path = window.location.pathname.toLowerCase();
    const isWishlist = path.includes('wishlist');
    const isCart = path.includes('cart');
    const isAccount = path.includes('dashboard') || path.includes('creator') || path.includes('studio');
    const isCategories = window.location.hash === '#categories';
    const isHome = !isWishlist && !isCart && !isAccount && !isCategories;

    bottomNav.innerHTML = `
        <a href="index.html" class="vv-bottom-nav-tab ${isHome ? 'active' : ''}" id="tab-home">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Home</span>
        </a>
        <a href="index.html#categories" class="vv-bottom-nav-tab ${isCategories ? 'active' : ''}" id="tab-categories">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            <span>Categories</span>
        </a>
        <a href="wishlist.html" class="vv-bottom-nav-tab ${isWishlist ? 'active' : ''}" id="tab-wishlist">
            <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span>Wishlist</span>
        </a>
        <a href="cart.html" class="vv-bottom-nav-tab ${isCart ? 'active' : ''}" id="tab-cart">
            <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span>Cart</span>
        </a>
        <a href="#" class="vv-bottom-nav-tab ${isAccount ? 'active' : ''}" id="tab-account">
            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>Account</span>
        </a>
    `;

    document.body.appendChild(bottomNav);

    // Categories tab scroll behavior
    const catTab = bottomNav.querySelector('#tab-categories');
    catTab.addEventListener('click', (e) => {
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
            e.preventDefault();
            const catNav = document.querySelector('.category-nav');
            if (catNav) {
                catNav.scrollIntoView({ behavior: 'smooth', block: 'center' });
                window.location.hash = '#categories';
                document.querySelectorAll('.vv-bottom-nav-tab').forEach(t => t.classList.remove('active'));
                catTab.classList.add('active');
            }
        }
    });

    // Account tab click behavior
    const accTab = bottomNav.querySelector('#tab-account');
    accTab.addEventListener('click', (e) => {
        e.preventDefault();
        const accBtn = document.querySelector('.mobile-account-btn');
        if (accBtn) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
                accBtn.click();
            }, 300);
        } else {
            // Fallback: if already logged in, go to dashboard, else show login modal
            const user = localStorage.getItem('vendorverse_user');
            if (user) {
                window.location.href = 'vendor-dashboard.html';
            } else if (typeof openAuthModal === 'function') {
                openAuthModal('login');
            } else {
                window.location.href = 'index.html';
            }
        }
    });
}

function setupMobileNavbar() {
    // Hide standard mobile menu btn since we don't use it
    const stdMenuBtn = document.getElementById('mobile-menu-btn');
    if (stdMenuBtn) stdMenuBtn.style.display = 'none';

    // Find header container on page (support .header-container and .checkout-header-inner)
    const headerContainer = document.querySelector('.header-container') || document.querySelector('.checkout-header-inner');
    if (!headerContainer) return;

    // Create right-side actions container
    if (!headerContainer.querySelector('.mobile-header-actions')) {
        const actions = document.createElement('div');
        actions.className = 'mobile-header-actions';
        actions.innerHTML = `
            <button class="mobile-nav-icon-btn mobile-search-btn" aria-label="Search">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </button>
            <button class="mobile-nav-icon-btn mobile-account-btn" aria-label="Account">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </button>
        `;
        headerContainer.appendChild(actions);
    }

    // Inject Expandable Search Bar below header/checkout-header
    const headerEl = document.querySelector('.header') || document.querySelector('.checkout-header');
    if (headerEl && !document.querySelector('.mobile-search-expand')) {
        const searchExpand = document.createElement('div');
        searchExpand.className = 'mobile-search-expand';
        searchExpand.innerHTML = `
            <input type="search" placeholder="Search VendorVerse..." id="mobile-search-input-box">
        `;
        headerEl.after(searchExpand);

        // Bind enter key search event
        const searchInput = searchExpand.querySelector('input');
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim()) {
                window.location.href = `product.html?search=${encodeURIComponent(searchInput.value.trim())}`;
            }
        });
    }

    // Inject Mobile Account Dropdown
    if (!document.querySelector('.mobile-account-dropdown')) {
        const accDropdown = document.createElement('div');
        accDropdown.className = 'mobile-account-dropdown';
        
        // Detect login status
        const isLoggedIn = !!localStorage.getItem('vendorverse_token');
        if (isLoggedIn) {
            accDropdown.innerHTML = `
                <a href="vendor-dashboard.html">Dashboard</a>
                <a href="creator-studio.html">Creator Studio</a>
                <a href="orders.html">My Orders</a>
                <button id="mobile-logout-btn">Logout</button>
            `;
        } else {
            accDropdown.innerHTML = `
                <a href="#" id="mobile-login-link">Login</a>
                <a href="#" id="mobile-register-link">Register</a>
            `;
        }
        document.body.appendChild(accDropdown);

        // Logout listener
        const logoutBtn = accDropdown.querySelector('#mobile-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('vendorverse_token');
                localStorage.removeItem('vendorverse_user');
                window.location.reload();
            });
        }

        // Login / Register click handling
        const loginLink = accDropdown.querySelector('#mobile-login-link');
        const regLink = accDropdown.querySelector('#mobile-register-link');
        if (loginLink) {
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                accDropdown.classList.remove('active');
                if (typeof openAuthModal === 'function') {
                    openAuthModal('login');
                } else {
                    window.location.href = 'index.html?action=login';
                }
            });
        }
        if (regLink) {
            regLink.addEventListener('click', (e) => {
                e.preventDefault();
                accDropdown.classList.remove('active');
                if (typeof openAuthModal === 'function') {
                    openAuthModal('register');
                } else {
                    window.location.href = 'index.html?action=register';
                }
            });
        }
    }

    // Bind Toggle Actions
    const searchBtn = headerContainer.querySelector('.mobile-search-btn');
    const accBtn = headerContainer.querySelector('.mobile-account-btn');
    const searchBar = document.querySelector('.mobile-search-expand');
    const accDropdown = document.querySelector('.mobile-account-dropdown');

    if (searchBtn && searchBar) {
        searchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            searchBar.classList.toggle('active');
            if (accDropdown) accDropdown.classList.remove('active');
            if (searchBar.classList.contains('active')) {
                searchBar.querySelector('input').focus();
            }
        });
    }

    if (accBtn && accDropdown) {
        accBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            accDropdown.classList.toggle('active');
            if (searchBar) searchBar.classList.remove('active');
        });
    }

    // Click outside closes modals
    document.addEventListener('click', (e) => {
        if (searchBar && !searchBar.contains(e.target) && !searchBtn.contains(e.target)) {
            searchBar.classList.remove('active');
        }
        if (accDropdown && !accDropdown.contains(e.target) && !accBtn.contains(e.target)) {
            accDropdown.classList.remove('active');
        }
    });
}

function enhancePageSpecifics() {
    // ── Category Link Text Wrapper ──
    document.querySelectorAll('.category-link').forEach(link => {
        Array.from(link.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                const span = document.createElement('span');
                span.textContent = node.textContent.trim();
                link.replaceChild(span, node);
            }
        });
    });

    // ── Homepage Headings & Section Links ──
    document.querySelectorAll('.vv-product-section').forEach(section => {
        const header = section.querySelector('.vv-section-header');
        const viewAllBtn = section.querySelector('.vv-view-all-btn');
        if (header && viewAllBtn) {
            if (!header.querySelector('.vv-section-header-link')) {
                const link = document.createElement('a');
                link.className = 'vv-section-header-link';
                link.href = viewAllBtn.getAttribute('href') || 'product.html';
                link.innerText = 'View All →';
                header.appendChild(link);
            }
        }
    });

    // ── Checkout Page summary toggle and step labels ──
    const path = window.location.pathname.toLowerCase();
    if (path.includes('checkout')) {
        const toggleBtn = document.getElementById('mobile-summary-toggle');
        if (toggleBtn) {
            const leftTextDiv = toggleBtn.querySelector('.mobile-summary-toggle-left');
            if (leftTextDiv) {
                leftTextDiv.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    Show Order Summary
                `;
                toggleBtn.addEventListener('click', () => {
                    setTimeout(() => {
                        const isExpanded = toggleBtn.classList.contains('expanded');
                        leftTextDiv.innerHTML = `
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            ${isExpanded ? 'Hide Order Summary' : 'Show Order Summary'}
                        `;
                    }, 50);
                });
            }
        }
    }

    // ── Product Detail Page sticky bottom ──
    if (path.includes('product-detail') || path.includes('product.html')) {
        const mainContainer = document.querySelector('.pd-container');
        const priceEl = document.getElementById('pd-price');
        const addCartBtn = document.getElementById('pd-add-cart');
        
        if (mainContainer && priceEl && addCartBtn && !document.querySelector('.pd-mobile-sticky-bottom')) {
            const stickyBottom = document.createElement('div');
            stickyBottom.className = 'pd-mobile-sticky-bottom';
            stickyBottom.innerHTML = `
                <span class="pd-sticky-price">${priceEl.textContent}</span>
                <button class="pd-sticky-btn">Add to Cart</button>
            `;
            document.body.appendChild(stickyBottom);

            const stickyAddBtn = stickyBottom.querySelector('.pd-sticky-btn');
            stickyAddBtn.addEventListener('click', () => {
                addCartBtn.click();
            });
        }
    }
}
