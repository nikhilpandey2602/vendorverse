/**
 * VendorVerse — Vendor Dashboard
 * Dual Store / Creator mode · Overview, Products, Orders, Analytics, Earnings, Profile, Settings
 */

/* ═══ CONSTANTS ═══ */
const VD_PRODUCTS_KEY = 'vendorverse_vendor_products';
const VD_MODE_KEY = 'vendorverse_vendor_mode'; // 'store' or 'creator'
const VD_WISHLIST_KEY = 'vendorverse_wishlist';
const VD_CREATORS_KEY = 'vendorverse_creators';
const VD_CART_KEY = 'vendorverse_cart';

const MOCK_NAMES = ['Aarav K.', 'Priya S.', 'Rahul M.', 'Neha D.', 'Vikram J.', 'Sneha T.', 'Arjun P.', 'Isha R.', 'Divya L.', 'Karan B.'];
const MOCK_STATUS = ['delivered', 'shipped', 'pending', 'delivered', 'shipped', 'delivered', 'pending', 'cancelled'];
const MOCK_PAY = ['Paid', 'Paid', 'Paid', 'Paid', 'Pending', 'Paid', 'Paid', 'Paid'];
const DAY_LABELS_7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS_30 = Array.from({ length: 30 }, (_, i) => i + 1 + '');

/* ═══ HELPERS ═══ */
const fmt = n => '₹' + n.toLocaleString('en-IN');
const getProducts = () => { try { return JSON.parse(localStorage.getItem(VD_PRODUCTS_KEY) || '[]') } catch { return [] } };
const saveProducts = p => localStorage.setItem(VD_PRODUCTS_KEY, JSON.stringify(p));
const getWL = () => { try { return JSON.parse(localStorage.getItem(VD_WISHLIST_KEY) || '[]') } catch { return [] } };
const getMode = () => localStorage.getItem(VD_MODE_KEY) || 'creator';
const setMode = m => localStorage.setItem(VD_MODE_KEY, m);
function vdToast(msg, type) { if (typeof showToast === 'function') showToast(msg, type); else console.log('[VD]', msg); }

function animCount(id, target) {
    const el = document.getElementById(id); if (!el) return;
    const dur = 600, st = performance.now();
    (function tick(now) {
        const p = Math.min((now - st) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
    })(st);
    requestAnimationFrame(function tick(now) {
        const p = Math.min((now - st) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
    });
}

/* ═══ MOCK DATA GEN ═══ */
function genRevenue(days) {
    return Array.from({ length: days }, () => Math.floor(Math.random() * 8000) + 1000);
}

function genOrders() {
    const prods = getProducts();
    if (!prods.length) return [];
    const orders = [];
    const count = Math.min(prods.length * 3, 12);
    for (let i = 0; i < count; i++) {
        const p = prods[i % prods.length];
        orders.push({
            id: 'ord_' + i, product: p.name, image: p.image || '',
            buyer: MOCK_NAMES[i % MOCK_NAMES.length],
            amount: p.price, status: MOCK_STATUS[i % MOCK_STATUS.length],
            payment: MOCK_PAY[i % MOCK_PAY.length],
            date: new Date(Date.now() - i * 86400000 * Math.random() * 5).toLocaleDateString('en-IN')
        });
    }
    return orders;
}

/* ═══ SIDEBAR NAV ═══ */
function initSidebarNav() {
    const items = document.querySelectorAll('.vd-nav-item[data-view]');
    const views = document.querySelectorAll('.vd-view');
    const title = document.getElementById('vd-title');
    const sub = document.getElementById('vd-sub');

    const meta = {
        overview: { t: 'Dashboard', s: 'Overview of your store' },
        products: { t: 'My Products', s: 'Manage your catalogue' },
        orders: { t: 'Orders', s: 'Track incoming orders' },
        analytics: { t: 'Analytics', s: 'Performance insights' },
        profile: { t: 'Store Profile', s: 'Your public storefront' },
        earnings: { t: 'Earnings', s: 'Revenue & payouts' },
        settings: { t: 'Settings', s: 'Dashboard preferences' }
    };

    items.forEach(item => {
        item.addEventListener('click', () => {
            const v = item.dataset.view;
            items.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            views.forEach(x => x.classList.remove('active'));
            document.getElementById('view-' + v)?.classList.add('active');
            if (meta[v]) { if (title) title.textContent = meta[v].t; if (sub) sub.textContent = meta[v].s; }
            refreshView(v);
            if (window.innerWidth <= 768) document.querySelector('.vd-sidebar')?.classList.remove('open');
        });
    });

    // Mobile toggle
    document.getElementById('vd-mobile-toggle')?.addEventListener('click', () => {
        document.querySelector('.vd-sidebar')?.classList.toggle('open');
    });
}

function refreshView(v) {
    if (v === 'overview') renderOverview();
    if (v === 'products') renderProducts();
    if (v === 'orders') renderOrdersFull();
    if (v === 'analytics') renderAnalytics();
    if (v === 'profile') renderProfile();
    if (v === 'earnings') renderEarnings();
}

/* ═══ MODE SWITCH ═══ */
function initModeSwitch() {
    const btns = document.querySelectorAll('.vd-mode-btn');
    const mode = getMode();
    btns.forEach(b => {
        b.classList.toggle('active', b.dataset.mode === mode);
        b.addEventListener('click', () => {
            btns.forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            setMode(b.dataset.mode);
            renderOverview();
            vdToast(b.dataset.mode === 'creator' ? 'Creator Mode' : 'Store Mode', 'info');
        });
    });
}

/* ═══ OVERVIEW ═══ */
let chartPeriod = 7;

function renderOverview() {
    const prods = getProducts();
    const orders = genOrders();
    const wl = getWL();
    const revenue = prods.reduce((s, p) => s + p.price, 0);
    const mode = getMode();

    animCount('vd-total-sales', revenue);
    animCount('vd-orders-today', Math.min(orders.length, 5));
    animCount('vd-total-products', prods.length);

    // Mode-specific cards
    const creatorExtra = document.getElementById('vd-creator-extra');
    const storeExtra = document.getElementById('vd-store-extra');

    if (mode === 'creator') {
        if (creatorExtra) creatorExtra.style.display = '';
        if (storeExtra) storeExtra.style.display = 'none';
        animCount('vd-followers', Math.floor(Math.random() * 5000) + 500);
        animCount('vd-engagement', Math.min(100, prods.length * 12 + wl.length * 5));
    } else {
        if (creatorExtra) creatorExtra.style.display = 'none';
        if (storeExtra) storeExtra.style.display = '';
        animCount('vd-inventory-alerts', Math.max(0, prods.length > 3 ? 2 : 0));
        animCount('vd-stock-health', prods.length > 0 ? Math.min(100, 70 + prods.length * 5) : 0);
    }

    // Chart
    renderChart(chartPeriod);

    // Top Products
    renderTopProducts(prods);

    // Recent orders
    renderRecentOrders(orders.slice(0, 5));
}

function renderChart(days) {
    chartPeriod = days;
    const container = document.getElementById('vd-chart-bars');
    if (!container) return;

    const labels = days === 7 ? DAY_LABELS_7 : DAY_LABELS_30;
    const data = genRevenue(days);
    const max = Math.max(...data, 1);

    container.innerHTML = data.map((v, i) => {
        const h = Math.round((v / max) * 100);
        return `<div class="vd-bar-group">
            <div class="vd-bar" style="height:${h}%">
                <span class="vd-bar-tooltip">${fmt(v)}</span>
            </div>
            <span class="vd-bar-label">${labels[i] || ''}</span>
        </div>`;
    }).join('');

    // Period buttons
    document.querySelectorAll('.vd-period-btn').forEach(b => {
        b.classList.toggle('active', Number(b.dataset.days) === days);
        b.onclick = () => renderChart(Number(b.dataset.days));
    });
}

function renderTopProducts(prods) {
    const el = document.getElementById('vd-top-products');
    if (!el) return;
    const top = prods.slice(0, 4);
    if (!top.length) { el.innerHTML = '<div class="vd-empty-state"><p>No products yet</p></div>'; return; }
    el.innerHTML = top.map((p, i) => `
        <div class="vd-top-product">
            <span class="vd-top-product-rank">${i + 1}</span>
            <img class="vd-top-product-img" src="${p.image}" alt="${p.name}" loading="lazy">
            <span class="vd-top-product-name">${p.name}</span>
            <span class="vd-top-product-sales">${fmt(p.price)}</span>
        </div>
    `).join('');
}

function renderRecentOrders(orders) {
    const el = document.getElementById('vd-recent-orders');
    if (!el) return;
    if (!orders.length) { el.innerHTML = '<div class="vd-empty-state"><p>No orders yet</p></div>'; return; }
    el.innerHTML = orders.map(o => `
        <div class="vd-order-row">
            <div style="flex:1">
                <div class="vd-order-buyer">${o.buyer}</div>
                <div class="vd-order-product-label">${o.product}</div>
            </div>
            <span class="vd-order-amount">${fmt(o.amount)}</span>
            <span class="vd-order-status ${o.status}">${o.status}</span>
        </div>
    `).join('');
}

/* ═══ MY PRODUCTS ═══ */
function renderProducts() {
    const grid = document.getElementById('vd-products-grid');
    const count = document.getElementById('vd-product-count');
    if (!grid) return;
    const prods = getProducts();
    if (count) count.textContent = prods.length + ' product' + (prods.length !== 1 ? 's' : '');

    if (!prods.length) {
        grid.innerHTML = `<div class="vd-empty-state"><div class="vd-empty-icon">📦</div><p>No products yet. Create one!</p></div>`;
        return;
    }

    grid.innerHTML = prods.map((p, i) => `
        <div class="vd-p-card" style="animation-delay:${i * 50}ms" data-id="${p.id}">
            <img class="vd-p-card-img" src="${p.image}" alt="${p.name}" loading="lazy">
            <div class="vd-p-card-body">
                <div class="vd-p-card-row">
                    <span class="vd-p-card-name">${p.name}</span>
                    <span class="vd-p-card-status ${p.status || 'live'}">${p.status || 'live'}</span>
                </div>
                <div class="vd-p-card-price">${fmt(p.price)}</div>
                <div class="vd-p-card-meta">${p.category || '—'} · ${new Date(p.createdAt).toLocaleDateString('en-IN')}</div>
                <div class="vd-p-card-actions">
                    <button class="vd-p-btn vd-p-btn-edit" data-id="${p.id}">✎ Edit</button>
                    <button class="vd-p-btn vd-p-btn-delete" data-id="${p.id}">✕ Delete</button>
                </div>
            </div>
        </div>
    `).join('');

    grid.querySelectorAll('.vd-p-btn-edit').forEach(b => {
        b.addEventListener('click', () => openEditModal(b.dataset.id));
    });
    grid.querySelectorAll('.vd-p-btn-delete').forEach(b => {
        b.addEventListener('click', () => {
            const prods = getProducts().filter(p => p.id !== b.dataset.id);
            saveProducts(prods);
            vdToast('Product deleted', 'info');
            renderProducts();
        });
    });
}

/* ═══ EDIT MODAL ═══ */
function openEditModal(id) {
    const prods = getProducts();
    const p = prods.find(x => x.id === id);
    if (!p) return;
    document.getElementById('vd-edit-id').value = p.id;
    document.getElementById('vd-edit-name').value = p.name;
    document.getElementById('vd-edit-price').value = p.price;
    document.getElementById('vd-edit-image').value = p.image;
    document.getElementById('vd-edit-overlay').classList.add('open');
}

function closeEditModal() {
    document.getElementById('vd-edit-overlay')?.classList.remove('open');
}

function saveEditModal() {
    const id = document.getElementById('vd-edit-id').value;
    const name = document.getElementById('vd-edit-name').value.trim();
    const price = parseInt(document.getElementById('vd-edit-price').value) || 0;
    const image = document.getElementById('vd-edit-image').value.trim();
    if (!name || price <= 0) { vdToast('Fill all fields', 'warning'); return; }
    const prods = getProducts();
    const idx = prods.findIndex(p => p.id === id);
    if (idx >= 0) {
        prods[idx].name = name; prods[idx].price = price; prods[idx].image = image;
        saveProducts(prods);
        vdToast('Product updated ✓', 'success');
        closeEditModal();
        renderProducts();
    }
}

/* ═══ ORDERS FULL ═══ */
function renderOrdersFull() {
    const el = document.getElementById('vd-orders-body');
    if (!el) return;
    const orders = genOrders();
    if (!orders.length) { el.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#9ca3af">No orders yet</td></tr>'; return; }
    el.innerHTML = orders.map(o => `
        <tr>
            <td><img class="order-img" src="${o.image}" alt="">${o.product}</td>
            <td>${o.buyer}</td>
            <td>${fmt(o.amount)}</td>
            <td><span class="vd-order-status ${o.status}">${o.status}</span></td>
            <td>${o.payment}</td>
            <td>${o.date}</td>
        </tr>
    `).join('');
}

/* ═══ ANALYTICS ═══ */
function renderAnalytics() {
    const prods = getProducts();
    const wl = getWL();
    const revenue = prods.reduce((s, p) => s + p.price, 0);
    const engagement = Math.min(100, prods.length * 12 + wl.length * 5);
    const convRate = prods.length ? Math.min(100, Math.round(Math.random() * 30 + 20)) : 0;

    animCount('vd-a-products', prods.length);
    animCount('vd-a-wishlist', wl.length);
    animCount('vd-a-revenue', revenue);
    animCount('vd-a-engage', engagement);

    setTimeout(() => {
        setBar('vd-prog-products', Math.min(100, prods.length * 10));
        setBar('vd-prog-wishlist', Math.min(100, wl.length * 15));
        setBar('vd-prog-revenue', Math.min(100, (revenue / 50000) * 100));
        setBar('vd-prog-engage', engagement);
    }, 200);

    // Chart
    renderChart(chartPeriod);
}

function setBar(id, pct) {
    const el = document.getElementById(id);
    if (el) el.style.width = Math.round(pct) + '%';
}

/* ═══ STORE PROFILE ═══ */
function renderProfile() {
    const prods = getProducts();
    const el = document.getElementById('vd-profile-products');
    if (el) el.textContent = prods.length;
    const followers = document.getElementById('vd-profile-followers');
    if (followers) followers.textContent = Math.floor(Math.random() * 5000 + 500).toLocaleString();
}

/* ═══ EARNINGS ═══ */
function renderEarnings() {
    const prods = getProducts();
    const total = prods.reduce((s, p) => s + p.price, 0);
    const commission = Math.round(total * 0.12);
    const pending = Math.round(total * 0.35);
    const withdrawable = total - commission - pending;

    animCount('vd-earn-total', total);
    animCount('vd-earn-commission', commission);
    animCount('vd-earn-pending', pending);
    animCount('vd-earn-withdraw', Math.max(0, withdrawable));
}

/* ═══ SETTINGS ═══ */
function initSettings() {
    document.querySelectorAll('.vd-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('on');
        });
    });
}

/* ═══ BOOT ═══ */
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('vd-dashboard-page')) return;

    initSidebarNav();
    initModeSwitch();
    initSettings();
    renderOverview();

    document.getElementById('vd-edit-save')?.addEventListener('click', saveEditModal);
    document.getElementById('vd-edit-cancel')?.addEventListener('click', closeEditModal);
    document.getElementById('vd-edit-overlay')?.addEventListener('click', e => {
        if (e.target === e.currentTarget) closeEditModal();
    });

    // Add Product button → go to Creator Studio
    document.getElementById('vd-add-product-btn')?.addEventListener('click', () => {
        window.location.href = 'creator-studio.html';
    });

    // Payout button
    document.getElementById('vd-payout-btn')?.addEventListener('click', () => {
        vdToast('Payout requested! Processing in 2-3 business days.', 'success');
    });

    console.log('%c📊 Vendor Dashboard loaded', 'color: #6366f1; font-weight: bold;');
});
