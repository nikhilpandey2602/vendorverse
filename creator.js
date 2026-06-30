/**
 * VendorVerse — Creator Studio
 * All dashboard logic: activation, wizard, products, orders, analytics, drops
 */

/* ═══════ Constants ═══════ */
const VENDOR_PRODUCTS_KEY = 'vendorverse_vendor_products';
const CREATOR_MODE_KEY = 'vendorverse_creator_mode';
const CREATOR_ID_KEY = 'vendorverse_creator_id';
const CREATORS_KEY_GLOBAL = 'vendorverse_creators';
const COLLAB_INVITES_KEY = 'vendorverse_collab_invites';
const PRODUCT_DROPS_KEY = 'vendorverse_product_drops';

function getCurrentCreatorId() {
    let existing = localStorage.getItem(CREATOR_ID_KEY);
    if (existing) return existing;

    // Prefer an existing seeded creator if available
    try {
        const creators = JSON.parse(localStorage.getItem(CREATORS_KEY_GLOBAL) || '[]');
        if (Array.isArray(creators) && creators.length > 0 && creators[0].creatorId) {
            existing = creators[0].creatorId;
        }
    } catch {
        existing = null;
    }

    if (!existing) {
        // Fallback demo creator id
        existing = 'creator_artisan';
    }

    localStorage.setItem(CREATOR_ID_KEY, existing);
    return existing;
}

// Treat the current creator as the "vendor" for locally created products
const VENDOR_ID = getCurrentCreatorId();

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

/* ═══════ Collaboration Invites & Drops Storage ═══════ */
function getCollabInvites() {
    try { return JSON.parse(localStorage.getItem(COLLAB_INVITES_KEY) || '[]'); }
    catch { return []; }
}

function saveCollabInvites(invites) {
    localStorage.setItem(COLLAB_INVITES_KEY, JSON.stringify(invites));
}

function getProductDrops() {
    try { return JSON.parse(localStorage.getItem(PRODUCT_DROPS_KEY) || '[]'); }
    catch { return []; }
}

function saveProductDrops(drops) {
    localStorage.setItem(PRODUCT_DROPS_KEY, JSON.stringify(drops));
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
        drops: { title: 'Drops', subtitle: 'Collabs & product drops' },
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
            if (view === 'drops') renderDropsView();
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

/* ═══════ DROPS VIEW (Collabs + Active Drops) ═══════ */
function formatDropCountdown(endsAt) {
    if (!endsAt) return 'Ended';
    const endTime = new Date(endsAt).getTime();
    const now = Date.now();
    const diffMs = endTime - now;
    if (diffMs <= 0) return 'Ended';
    const totalSec = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hours > 0) return `${hours}h ${mins}m left`;
    if (mins > 0) return `${mins}m ${secs}s left`;
    return `${secs}s left`;
}

function acceptInviteAndCreateDrop(inviteId) {
    const invites = getCollabInvites();
    const idx = invites.findIndex(i => i.id === inviteId);
    if (idx === -1) return;

    const invite = invites[idx];
    const products = getVendorProducts();
    const product = products.find(p => p.id === invite.productId);
    if (!product) {
        toast('Product no longer exists for this invite', 'warning');
        return;
    }

    invites[idx].status = 'accepted';
    invites[idx].acceptedAt = new Date().toISOString();
    saveCollabInvites(invites);

    const drops = getProductDrops();
    const now = new Date();
    const endsAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour drop
    const commissionPct = typeof invite.commissionPct === 'number' ? invite.commissionPct : 10;

    drops.push({
        id: 'drop_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        creatorId: invite.creatorId,
        vendorId: product.vendorId || VENDOR_ID,
        productId: product.id,
        title: product.name,
        price: product.price,
        originalPrice: product.originalPrice || null,
        image: product.image,
        badge: 'Drop',
        createdAt: now.toISOString(),
        endsAt,
        status: 'live',
        commissionPct,
        soldQuantity: 0,
        salesAmount: 0
    });
    saveProductDrops(drops);

    toast('Drop created! Your followers will see it in Smart Feed.', 'success');
    renderDropsView();
}

function declineInvite(inviteId) {
    const invites = getCollabInvites();
    const idx = invites.findIndex(i => i.id === inviteId);
    if (idx === -1) return;
    invites[idx].status = 'declined';
    invites[idx].declinedAt = new Date().toISOString();
    saveCollabInvites(invites);
    toast('Invite declined', 'info');
    renderDropsView();
}

function trackDropSaleForCreator(dropId, amount) {
    const drops = getProductDrops();
    const idx = drops.findIndex(d => d.id === dropId);
    if (idx === -1) return;
    const d = drops[idx];
    d.soldQuantity = (d.soldQuantity || 0) + 1;
    d.salesAmount = (d.salesAmount || 0) + (amount || 0);
    saveProductDrops(drops);
}

function renderDropsView() {
    const invitesContainer = document.getElementById('drops-invites-list');
    const activeContainer = document.getElementById('drops-active-list');
    if (!invitesContainer || !activeContainer) return;

    const creatorId = VENDOR_ID;
    const allInvites = getCollabInvites().filter(i => i.creatorId === creatorId);
    const products = getVendorProducts();

    // Earnings stats
    const dropsAll = getProductDrops().filter(d => d.creatorId === creatorId);
    const nowTs = Date.now();
    const activeCount = dropsAll.filter(d => d.status === 'live' && new Date(d.endsAt).getTime() > nowTs).length;
    const totalSalesAmount = dropsAll.reduce((sum, d) => sum + (d.salesAmount || 0), 0);
    const totalCommission = dropsAll.reduce((sum, d) => {
        const pct = typeof d.commissionPct === 'number' ? d.commissionPct : 10;
        return sum + (d.salesAmount || 0) * (pct / 100);
    }, 0);

    const statActiveEl = document.getElementById('drops-stat-active');
    const statSalesEl = document.getElementById('drops-stat-sales');
    const statCommEl = document.getElementById('drops-stat-commission');
    if (statActiveEl) statActiveEl.textContent = activeCount;
    if (statSalesEl) statSalesEl.textContent = '₹' + totalSalesAmount.toLocaleString('en-IN');
    if (statCommEl) statCommEl.textContent = '₹' + Math.round(totalCommission).toLocaleString('en-IN');

    const pendingInvites = allInvites.filter(i => i.status === 'pending');
    if (pendingInvites.length === 0) {
        invitesContainer.innerHTML = `
            <div class="drops-empty">
                <div class="drops-empty-icon">🤝</div>
                <p>No new collaboration invites yet.</p>
                <p class="drops-empty-sub">When vendors invite you to promote products, they’ll appear here.</p>
            </div>`;
    } else {
        invitesContainer.innerHTML = pendingInvites.map(inv => {
            const product = products.find(p => p.id === inv.productId);
            if (!product) return '';
            const commission = typeof inv.commissionPct === 'number' ? inv.commissionPct : 10;
            return `
            <div class="drops-invite-card">
                <div class="drops-invite-main">
                    <img class="drops-invite-img" src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="drops-invite-body">
                        <div class="drops-invite-title-row">
                            <h3 class="drops-invite-title">${product.name}</h3>
                            <span class="drops-invite-pill">New invite</span>
                        </div>
                        <div class="drops-invite-price">₹${product.price.toLocaleString('en-IN')}</div>
                        <p class="drops-invite-copy">Promote this product to your followers with a timed Drop and earn <strong>${commission}%</strong> commission.</p>
                    </div>
                </div>
                <div class="drops-invite-actions">
                    <button class="drops-btn-secondary" data-invite-decline="${inv.id}">Skip</button>
                    <button class="drops-btn-primary" data-invite-accept="${inv.id}">Accept & Create Drop</button>
                </div>
            </div>`;
        }).join('');

        invitesContainer.querySelectorAll('[data-invite-accept]').forEach(btn => {
            btn.addEventListener('click', () => acceptInviteAndCreateDrop(btn.dataset.inviteAccept));
        });
        invitesContainer.querySelectorAll('[data-invite-decline]').forEach(btn => {
            btn.addEventListener('click', () => declineInvite(btn.dataset.inviteDecline));
        });
    }

    const now = Date.now();
    const drops = getProductDrops().filter(d => d.creatorId === creatorId);
    const activeDrops = drops.filter(d => d.status === 'live' && new Date(d.endsAt).getTime() > now);

    if (activeDrops.length === 0) {
        activeContainer.innerHTML = `
            <div class="drops-empty">
                <div class="drops-empty-icon">✨</div>
                <p>No active drops right now.</p>
                <p class="drops-empty-sub">Accept a collaboration invite to launch your first Product Drop.</p>
            </div>`;
    } else {
        activeContainer.innerHTML = activeDrops.map(drop => {
            const pct = typeof drop.commissionPct === 'number' ? drop.commissionPct : 10;
            return `
            <article class="drops-active-card">
                <div class="drops-active-main">
                    <img class="drops-active-img" src="${drop.image}" alt="${drop.title}" loading="lazy">
                    <div class="drops-active-body">
                        <h3 class="drops-active-title">${drop.title}</h3>
                        <div class="drops-active-price-row">
                            <span class="drops-active-price">₹${drop.price.toLocaleString('en-IN')}</span>
                            ${drop.originalPrice ? `<span class="drops-active-orig">₹${drop.originalPrice.toLocaleString('en-IN')}</span>` : ''}
                        </div>
                        <div class="drops-active-meta">
                            <span class="drops-countdown" data-drop-countdown="${drop.id}">${formatDropCountdown(drop.endsAt)}</span>
                            <span class="drops-meta-pill">Live Drop</span>
                            <span class="drops-meta-pill">Commission ${pct}%</span>
                        </div>
                    </div>
                </div>
                <button class="drops-buy-btn" data-drop-buy="${drop.productId}" data-drop-id="${drop.id}">Buy from Drop</button>
                <button class="drops-buy-btn" data-room-start="${drop.id}" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);margin-top:6px">🎥 Start Drop Room</button>
            </article>
        `;
        }).join('');

        // Buy → send to cart via existing helpers
        activeContainer.querySelectorAll('[data-drop-buy]').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.dataset.dropBuy;
                const dropId = btn.dataset.dropId;
                const product = products.find(p => p.id === productId);
                if (!product) return;

                if (typeof addToDiscoverCart === 'function') {
                    addToDiscoverCart({
                        id: product.id,
                        productId: product.id,
                        title: product.name,
                        brand: 'Creator',
                        price: product.price,
                        image: product.image
                    });
                } else if (typeof addToCart === 'function') {
                    addToCart({
                        id: product.id,
                        productId: product.id,
                        title: product.name,
                        price: product.price,
                        image: product.image
                    });
                }

                // Track drop sale for earnings
                if (dropId) {
                    trackDropSaleForCreator(dropId, product.price);
                    renderDropsView();
                }
            });
        });

        // Lightweight countdown refresh
        setTimeout(() => {
            activeContainer.querySelectorAll('[data-drop-countdown]').forEach(el => {
                const dropId = el.dataset.dropCountdown;
                const updated = getProductDrops().find(d => d.id === dropId);
                if (!updated) return;
                el.textContent = formatDropCountdown(updated.endsAt);
            });
        }, 1000);
    }

    // ── Active Drop Rooms section ──
    const liveRooms = typeof drGetRooms === 'function' ? drGetRooms().filter(r => r.status !== 'ended') : [];
    if (liveRooms.length > 0) {
        const roomsHtml = `
        <section class="drops-panel" style="margin-top:20px">
            <div class="drops-panel-header">
                <div>
                    <h2 class="drops-panel-title">🎥 Active Drop Rooms</h2>
                    <p class="drops-panel-sub">Your live drop rooms with viewers and performance.</p>
                </div>
            </div>
            <div class="drops-list">
                ${liveRooms.map(r => {
            const statusLabel = r.status === 'live' ? '● LIVE' : '⏱ WAITING';
            const statusColor = r.status === 'live' ? '#ef4444' : '#f59e0b';
            return `
                    <div class="drops-active-card" style="padding:16px">
                        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
                            <div>
                                <div style="font-weight:700;color:var(--color-text-primary,#111827);margin-bottom:4px">${r.title}</div>
                                <div style="display:flex;gap:8px;align-items:center">
                                    <span style="background:${statusColor};color:#fff;padding:3px 10px;border-radius:10px;font-size:0.65rem;font-weight:800;text-transform:uppercase">${statusLabel}</span>
                                    <span style="color:var(--color-text-secondary,#6b7280);font-size:0.78rem">👁 ${r.viewers || 0} viewers</span>
                                    <span style="color:var(--color-text-secondary,#6b7280);font-size:0.78rem">💬 ${(r.chatMessages || []).length} msgs</span>
                                </div>
                            </div>
                            <a href="drop-room?id=${r.id}" style="padding:8px 18px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:10px;font-size:0.8rem;font-weight:700;text-decoration:none">Open Room</a>
                        </div>
                    </div>`;
        }).join('')}
            </div>
        </section>`;

        // Append rooms section to the drops layout
        const dropsLayout = activeContainer.closest('.drops-layout');
        if (dropsLayout) {
            const existing = dropsLayout.querySelector('.dr-rooms-section');
            if (existing) existing.remove();
            const wrapper = document.createElement('div');
            wrapper.className = 'dr-rooms-section';
            wrapper.innerHTML = roomsHtml;
            dropsLayout.appendChild(wrapper);
        }
    }

    // Start Drop Room button handlers
    document.querySelectorAll('[data-room-start]').forEach(btn => {
        btn.addEventListener('click', () => {
            const dropId = btn.dataset.roomStart;
            if (typeof drCreateRoom === 'function') {
                const room = drCreateRoom(dropId);
                if (room) {
                    toast('🎥 Drop Room created!', 'success');
                    window.location.href = 'drop-room?id=' + room.id;
                }
            } else {
                toast('Drop room system not available', 'warning');
            }
        });
    });
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
