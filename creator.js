/**
 * VendorVerse — Creator Studio
 * All dashboard logic: activation, wizard, products, orders, analytics
 */

/* ═══════ Constants ═══════ */
const VENDOR_PRODUCTS_KEY = 'vendorverse_vendor_products';
const CREATOR_MODE_KEY = 'vendorverse_creator_mode';
const VENDOR_ID = 'vendor_' + (Math.random().toString(36).slice(2, 8));

const WIZARD_CATEGORIES = [
    { id: 'tech', label: 'Tech', icon: '⚡' },
    { id: 'creator', label: 'Creator Gear', icon: '🎥' },
    { id: 'lifestyle', label: 'Lifestyle', icon: '🌿' },
    { id: 'smart-living', label: 'Smart Living', icon: '🏠' },
    { id: 'minimal', label: 'Minimal Essentials', icon: '◻' }
];

const MOCK_BUYERS = ['Aarav K.', 'Priya S.', 'Rahul M.', 'Neha D.', 'Vikram J.', 'Sneha T.', 'Arjun P.', 'Isha R.'];
const MOCK_STATUSES = ['delivered', 'shipped', 'pending', 'delivered', 'shipped'];

/* ═══════ Storage Helpers ═══════ */
function getVendorProducts() {
    try { return JSON.parse(localStorage.getItem(VENDOR_PRODUCTS_KEY) || '[]'); }
    catch { return []; }
}

function saveVendorProducts(products) {
    localStorage.setItem(VENDOR_PRODUCTS_KEY, JSON.stringify(products));
}

function isCreatorMode() {
    return localStorage.getItem(CREATOR_MODE_KEY) === 'true';
}

function activateCreatorMode() {
    localStorage.setItem(CREATOR_MODE_KEY, 'true');
}

/* ═══════ SIDEBAR NAVIGATION ═══════ */
function initSidebar() {
    const links = document.querySelectorAll('.sidebar-link[data-view]');
    const views = document.querySelectorAll('.creator-view');
    const title = document.querySelector('.creator-page-title');
    const subtitle = document.querySelector('.creator-page-subtitle');

    const viewMeta = {
        overview: { title: 'Overview', subtitle: 'Your studio at a glance' },
        add: { title: 'Add Product', subtitle: 'Create something new' },
        products: { title: 'My Products', subtitle: 'Manage your creations' },
        orders: { title: 'Orders', subtitle: 'Track incoming orders' },
        analytics: { title: 'Analytics', subtitle: 'Performance insights' },
        settings: { title: 'Settings', subtitle: 'Creator preferences' }
    };

    links.forEach(link => {
        link.addEventListener('click', () => {
            const view = link.dataset.view;
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            views.forEach(v => v.classList.remove('active'));
            const target = document.getElementById('view-' + view);
            if (target) target.classList.add('active');
            if (viewMeta[view]) {
                if (title) title.textContent = viewMeta[view].title;
                if (subtitle) subtitle.textContent = viewMeta[view].subtitle;
            }
            // Refresh view data
            if (view === 'overview') renderOverview();
            if (view === 'products') renderMyProducts();
            if (view === 'orders') renderOrders();
            if (view === 'analytics') renderAnalytics();
        });
    });

    // Mobile sidebar toggle
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.creator-sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
        // Close on clicking a link (mobile)
        links.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) sidebar.classList.remove('open');
            });
        });
    }
}

/* ═══════ OVERVIEW DASHBOARD ═══════ */
function renderOverview() {
    const products = getVendorProducts();
    const wl = getWishlistCount();
    const orders = generateMockOrders().length;

    animateCounter('stat-total-products', products.length);
    animateCounter('stat-total-orders', orders);
    animateCounter('stat-wishlist-saves', wl);
}

function animateCounter(elementId, target) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const duration = 600;
    const start = performance.now();
    const from = 0;

    function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(from + (target - from) * eased);
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

function getWishlistCount() {
    try {
        const wl = JSON.parse(localStorage.getItem('vendorverse_wishlist') || '[]');
        return wl.length;
    } catch { return 0; }
}

/* ═══════ 3-STEP PRODUCT WIZARD ═══════ */
let wizardStep = 1;
let wizardData = { name: '', description: '', category: '', image: '', price: '' };

function initWizard() {
    renderWizardStep(1);
    initCategoryPicker();

    // Next / Back buttons
    document.getElementById('wizard-next')?.addEventListener('click', () => {
        if (validateWizardStep(wizardStep)) {
            saveWizardStep(wizardStep);
            if (wizardStep < 3) { wizardStep++; renderWizardStep(wizardStep); }
        }
    });

    document.getElementById('wizard-back')?.addEventListener('click', () => {
        if (wizardStep > 1) { wizardStep--; renderWizardStep(wizardStep); }
    });

    document.getElementById('wizard-publish')?.addEventListener('click', publishProduct);
}

function renderWizardStep(step) {
    wizardStep = step;
    for (let i = 1; i <= 3; i++) {
        const panel = document.getElementById('wizard-step-' + i);
        const indicator = document.getElementById('wizard-ind-' + i);
        if (panel) panel.classList.toggle('active', i === step);
        if (indicator) {
            indicator.classList.toggle('active', i === step);
            indicator.classList.toggle('done', i < step);
        }
    }

    // Connectors
    const conn1 = document.getElementById('wizard-conn-1');
    const conn2 = document.getElementById('wizard-conn-2');
    if (conn1) conn1.classList.toggle('filled', step > 1);
    if (conn2) conn2.classList.toggle('filled', step > 2);

    // Buttons
    const backBtn = document.getElementById('wizard-back');
    const nextBtn = document.getElementById('wizard-next');
    const publishBtn = document.getElementById('wizard-publish');
    if (backBtn) backBtn.style.display = step === 1 ? 'none' : '';
    if (nextBtn) nextBtn.style.display = step === 3 ? 'none' : '';
    if (publishBtn) publishBtn.style.display = step === 3 ? '' : 'none';

    // Preview card on step 3
    if (step === 3) renderPreview();
}

function initCategoryPicker() {
    const grid = document.getElementById('wizard-categories');
    if (!grid) return;

    grid.innerHTML = WIZARD_CATEGORIES.map(c =>
        `<button class="wizard-cat-btn" data-cat="${c.id}" type="button">
            ${c.icon} ${c.label}
        </button>`
    ).join('');

    grid.querySelectorAll('.wizard-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            grid.querySelectorAll('.wizard-cat-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            wizardData.category = btn.dataset.cat;
        });
    });
}

function saveWizardStep(step) {
    if (step === 1) {
        wizardData.name = document.getElementById('w-name')?.value.trim() || '';
        wizardData.description = document.getElementById('w-desc')?.value.trim() || '';
    }
    if (step === 2) {
        wizardData.image = document.getElementById('w-image')?.value.trim() || '';
    }
    if (step === 3) {
        wizardData.price = parseInt(document.getElementById('w-price')?.value) || 0;
    }
}

function validateWizardStep(step) {
    if (step === 1) {
        const name = document.getElementById('w-name')?.value.trim();
        if (!name) { toast('Please enter a product name', 'warning'); return false; }
        return true;
    }
    if (step === 2) {
        if (!wizardData.category) { toast('Please select a category', 'warning'); return false; }
        return true;
    }
    return true;
}

function renderPreview() {
    saveWizardStep(3);
    const img = document.getElementById('preview-img');
    const name = document.getElementById('preview-name');
    const price = document.getElementById('preview-price');

    if (img) img.src = wizardData.image || 'https://via.placeholder.com/400x300?text=Product';
    if (name) name.textContent = wizardData.name || 'Product Name';
    if (price) price.textContent = wizardData.price ? '₹' + Number(wizardData.price).toLocaleString('en-IN') : '₹0';
}

function publishProduct() {
    saveWizardStep(3);
    const price = parseInt(document.getElementById('w-price')?.value) || 0;
    if (price <= 0) { toast('Please enter a valid price', 'warning'); return; }

    const product = {
        id: 'vp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        vendorId: VENDOR_ID,
        name: wizardData.name,
        description: wizardData.description,
        price: price,
        originalPrice: Math.round(price * 1.3),
        category: wizardData.category,
        image: wizardData.image || 'https://via.placeholder.com/400x300?text=Product',
        rating: 4.0 + +(Math.random() * 0.9).toFixed(1),
        ratingCount: Math.floor(Math.random() * 500) + 100,
        createdAt: new Date().toISOString(),
        status: 'live'
    };

    const products = getVendorProducts();
    products.push(product);
    saveVendorProducts(products);

    toast('Product published! 🎉', 'success');

    // Reset wizard
    wizardData = { name: '', description: '', category: '', image: '', price: '' };
    document.getElementById('w-name').value = '';
    document.getElementById('w-desc').value = '';
    document.getElementById('w-image').value = '';
    document.getElementById('w-price').value = '';
    document.querySelectorAll('.wizard-cat-btn').forEach(b => b.classList.remove('selected'));
    renderWizardStep(1);

    // Refresh overview
    renderOverview();
}

/* ═══════ MY PRODUCTS ═══════ */
function renderMyProducts() {
    const grid = document.getElementById('my-products-grid');
    if (!grid) return;

    const products = getVendorProducts();

    if (products.length === 0) {
        grid.innerHTML = `
            <div class="my-products-empty">
                <div class="my-products-empty-icon">📦</div>
                <p>No products yet. Create your first one!</p>
            </div>`;
        return;
    }

    grid.innerHTML = products.map(p => `
        <div class="my-product-card" data-id="${p.id}">
            <img class="my-product-img" src="${p.image}" alt="${p.name}" loading="lazy">
            <div class="my-product-body">
                <div class="my-product-row">
                    <span class="my-product-name">${p.name}</span>
                    <span class="my-product-live">${p.status}</span>
                </div>
                <div class="my-product-price">₹${p.price.toLocaleString('en-IN')}</div>
                <div class="my-product-meta">${p.category} · ${new Date(p.createdAt).toLocaleDateString()}</div>
                <div class="my-product-actions">
                    <button class="mp-btn mp-btn-edit" data-id="${p.id}">✎ Edit</button>
                    <button class="mp-btn mp-btn-delete" data-id="${p.id}">✕ Delete</button>
                </div>
            </div>
        </div>
    `).join('');

    // Edit handlers
    grid.querySelectorAll('.mp-btn-edit').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });

    // Delete handlers
    grid.querySelectorAll('.mp-btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const products = getVendorProducts().filter(p => p.id !== btn.dataset.id);
            saveVendorProducts(products);
            toast('Product deleted', 'info');
            renderMyProducts();
            renderOverview();
        });
    });
}

/* ═══════ EDIT MODAL ═══════ */
function openEditModal(productId) {
    const products = getVendorProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const overlay = document.getElementById('edit-modal-overlay');
    document.getElementById('edit-name').value = product.name;
    document.getElementById('edit-price').value = product.price;
    document.getElementById('edit-image').value = product.image;
    document.getElementById('edit-id').value = product.id;

    overlay.classList.add('open');
}

function closeEditModal() {
    document.getElementById('edit-modal-overlay')?.classList.remove('open');
}

function saveEdit() {
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('edit-name').value.trim();
    const price = parseInt(document.getElementById('edit-price').value) || 0;
    const image = document.getElementById('edit-image').value.trim();

    if (!name || price <= 0) { toast('Fill all fields', 'warning'); return; }

    const products = getVendorProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx >= 0) {
        products[idx].name = name;
        products[idx].price = price;
        products[idx].image = image;
        saveVendorProducts(products);
        toast('Product updated ✓', 'success');
        closeEditModal();
        renderMyProducts();
    }
}

/* ═══════ ORDERS (Simulated) ═══════ */
function generateMockOrders() {
    const products = getVendorProducts();
    if (products.length === 0) return [];

    const orders = [];
    const count = Math.min(products.length * 2, 8);
    for (let i = 0; i < count; i++) {
        const p = products[i % products.length];
        orders.push({
            product: p.name,
            image: p.image,
            buyer: MOCK_BUYERS[i % MOCK_BUYERS.length],
            total: p.price,
            status: MOCK_STATUSES[i % MOCK_STATUSES.length]
        });
    }
    return orders;
}

function renderOrders() {
    const list = document.getElementById('orders-list');
    if (!list) return;

    const orders = generateMockOrders();

    if (orders.length === 0) {
        list.innerHTML = `<div class="my-products-empty">
            <div class="my-products-empty-icon">🛒</div>
            <p>No orders yet. Publish products to start selling!</p>
        </div>`;
        return;
    }

    list.innerHTML = orders.map((o, i) => `
        <div class="order-card" style="animation-delay:${i * 60}ms">
            <img class="order-img" src="${o.image}" alt="${o.product}" loading="lazy">
            <div class="order-details">
                <div class="order-product-name">${o.product}</div>
                <div class="order-buyer">${o.buyer}</div>
            </div>
            <div class="order-total">₹${o.total.toLocaleString('en-IN')}</div>
            <span class="order-status ${o.status}">${o.status}</span>
        </div>
    `).join('');
}

/* ═══════ ANALYTICS ═══════ */
function renderAnalytics() {
    const products = getVendorProducts();
    const wlCount = getWishlistCount();
    const revenue = products.reduce((s, p) => s + p.price, 0);
    const engagement = Math.min(100, products.length * 12 + wlCount * 5);

    animateCounter('a-products', products.length);
    animateCounter('a-wishlist', wlCount);
    animateCounter('a-revenue', revenue);
    animateCounter('a-engagement', engagement);

    // Animate progress bars
    setTimeout(() => {
        setProgress('prog-products', Math.min(100, products.length * 10));
        setProgress('prog-wishlist', Math.min(100, wlCount * 15));
        setProgress('prog-revenue', Math.min(100, (revenue / 50000) * 100));
        setProgress('prog-engagement', engagement);
    }, 200);
}

function setProgress(elementId, pct) {
    const el = document.getElementById(elementId);
    if (el) el.style.width = Math.round(pct) + '%';
}

/* ═══════ SETTINGS ═══════ */
function initSettings() {
    const toggle = document.getElementById('toggle-creator');
    if (toggle) {
        toggle.classList.toggle('on', isCreatorMode());
        toggle.addEventListener('click', () => {
            const isOn = toggle.classList.toggle('on');
            localStorage.setItem(CREATOR_MODE_KEY, isOn ? 'true' : 'false');
            toast(isOn ? 'Creator mode activated' : 'Creator mode deactivated', 'info');
        });
    }
}

/* ═══════ TOAST HELPER ═══════ */
function toast(message, type) {
    if (typeof showToast === 'function') {
        showToast(message, type);
    } else {
        console.log('[Toast]', message);
    }
}

/* ═══════ INTEGRATION — merge vendor products into PRODUCT_DATA ═══════ */
function mergeVendorProducts() {
    if (typeof PRODUCT_DATA === 'undefined') return;
    const vendorProducts = getVendorProducts();
    vendorProducts.forEach(vp => {
        if (!PRODUCT_DATA.find(p => p.id === vp.id)) {
            PRODUCT_DATA.push({
                id: vp.id,
                title: vp.name,
                brand: 'Creator',
                price: vp.price,
                originalPrice: vp.originalPrice || Math.round(vp.price * 1.3),
                discount: Math.round((1 - vp.price / (vp.originalPrice || vp.price * 1.3)) * 100) + '% off',
                category: vp.category,
                rating: vp.rating || 4,
                ratingCount: vp.ratingCount || 100,
                badge: 'Creator',
                delivery: '🚀 Free Delivery',
                image: vp.image,
                description: vp.description || `${vp.name} — crafted by a VendorVerse creator.`
            });
        }
    });
}

/* ═══════ BOOT ═══════ */
document.addEventListener('DOMContentLoaded', () => {
    // Only run full studio logic on creator-studio page
    if (document.getElementById('creator-studio-page')) {
        initSidebar();
        initWizard();
        initSettings();
        renderOverview();

        // Edit modal handlers
        document.getElementById('edit-save')?.addEventListener('click', saveEdit);
        document.getElementById('edit-cancel')?.addEventListener('click', closeEditModal);
        document.getElementById('edit-modal-overlay')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeEditModal();
        });

        // w-price live preview
        document.getElementById('w-price')?.addEventListener('input', () => {
            if (wizardStep === 3) renderPreview();
        });

        console.log('%c🎨 Creator Studio loaded', 'color: #6366f1; font-weight: bold;');
    }

    // On any page: merge vendor products into discovery grid
    mergeVendorProducts();

    // Handle "Become a Creator" button on any page
    document.getElementById('become-creator-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        activateCreatorMode();
        toast('Creator Mode activated! 🎨', 'success');
        setTimeout(() => { window.location.href = 'creator-studio.html'; }, 500);
    });

    // Show/hide creator studio link in navbar based on mode
    const studioLink = document.getElementById('creator-studio-link');
    const becomeBtn = document.getElementById('become-creator-btn');
    if (isCreatorMode()) {
        if (studioLink) studioLink.style.display = '';
        if (becomeBtn) becomeBtn.style.display = 'none';
    } else {
        if (studioLink) studioLink.style.display = 'none';
        if (becomeBtn) becomeBtn.style.display = '';
    }
});
