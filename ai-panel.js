/**
 * VendorVerse — AI Panel Dashboard
 * Aggregates platform data for trending drops, top creators, category analysis, and insights.
 */

function aipFmt(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

function aipGetProducts() {
    let products = [];
    if (typeof PRODUCT_DATA !== 'undefined') products = [...PRODUCT_DATA];
    try {
        const vp = JSON.parse(localStorage.getItem('vendorverse_vendor_products') || '[]');
        products = [...products, ...vp.filter(p => p.status === 'live')];
    } catch {}
    const map = new Map();
    products.forEach(p => map.set(p.id, p));
    return Array.from(map.values());
}

function aipGetDrops() {
    try { return JSON.parse(localStorage.getItem('vendorverse_drops') || '[]'); } catch { return []; }
}

function aipGetCreators() {
    if (typeof cmGetCreators === 'function') return cmGetCreators();
    try {
        const c = JSON.parse(localStorage.getItem('vendorverse_creators') || '[]');
        if (c.length) return c;
    } catch {}
    return [];
}

function aipGetRooms() {
    try { return JSON.parse(localStorage.getItem('vendorverse_drop_rooms') || '[]'); } catch { return []; }
}

/* ═══ RENDER STATS ═══ */
function aipRenderStats() {
    const el = document.getElementById('aip-stats');
    if (!el) return;

    const products = aipGetProducts();
    const drops = aipGetDrops();
    const creators = aipGetCreators();
    const rooms = aipGetRooms();
    const activeDrops = drops.filter(d => d.status === 'live');
    const liveRooms = rooms.filter(r => r.status !== 'ended');

    el.innerHTML = `
        <div class="aip-stat-card" style="animation-delay:0ms">
            <div class="aip-stat-icon">🛍️</div>
            <div class="aip-stat-value">${products.length}</div>
            <div class="aip-stat-label">Total Products</div>
        </div>
        <div class="aip-stat-card" style="animation-delay:60ms">
            <div class="aip-stat-icon">🔥</div>
            <div class="aip-stat-value">${activeDrops.length}</div>
            <div class="aip-stat-label">Active Drops</div>
        </div>
        <div class="aip-stat-card" style="animation-delay:120ms">
            <div class="aip-stat-icon">🌟</div>
            <div class="aip-stat-value">${creators.length}</div>
            <div class="aip-stat-label">Creators</div>
        </div>
        <div class="aip-stat-card" style="animation-delay:180ms">
            <div class="aip-stat-icon">🎥</div>
            <div class="aip-stat-value">${liveRooms.length}</div>
            <div class="aip-stat-label">Live Rooms</div>
        </div>
    `;
}

/* ═══ RENDER TRENDING DROPS ═══ */
function aipRenderDrops() {
    const el = document.getElementById('aip-drops-list');
    if (!el) return;

    const drops = aipGetDrops().filter(d => d.status === 'live');
    drops.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (!drops.length) {
        el.innerHTML = '<div class="aip-empty">No active drops right now</div>';
        return;
    }

    el.innerHTML = drops.slice(0, 5).map(d => `
        <div class="aip-drop-item">
            <img class="aip-drop-img" src="${d.image}" alt="${d.title}" loading="lazy">
            <div class="aip-drop-info">
                <div class="aip-drop-name">${d.title}</div>
                <div class="aip-drop-meta">Ends ${new Date(d.endsAt).toLocaleDateString()} · ${d.sales || 0} sales</div>
            </div>
            <div class="aip-drop-price">${aipFmt(d.dropPrice || d.price)}</div>
        </div>
    `).join('');
}

/* ═══ RENDER TOP CREATORS ═══ */
function aipRenderCreators() {
    const el = document.getElementById('aip-creators-list');
    if (!el) return;

    const creators = aipGetCreators();
    creators.sort((a, b) => (b.engagement || 0) - (a.engagement || 0));

    if (!creators.length) {
        el.innerHTML = '<div class="aip-empty">No creators found</div>';
        return;
    }

    el.innerHTML = creators.slice(0, 5).map(c => {
        const fmtFollowers = c.followers >= 1000 ? (c.followers / 1000).toFixed(1) + 'K' : c.followers;
        return `
        <div class="aip-creator-item">
            <img class="aip-creator-avatar" src="${c.avatar}" alt="${c.name}" loading="lazy">
            <div class="aip-creator-info">
                <div class="aip-creator-name">${c.name}</div>
                <div class="aip-creator-niche">${c.niche}</div>
            </div>
            <div class="aip-creator-stats">${fmtFollowers} · ${(c.engagement || 0).toFixed(1)}%</div>
        </div>`;
    }).join('');
}

/* ═══ RENDER CATEGORY DISTRIBUTION ═══ */
function aipRenderCategories() {
    const el = document.getElementById('aip-categories-list');
    if (!el) return;

    const products = aipGetProducts();
    const cats = {};
    products.forEach(p => { const c = p.category || 'Other'; cats[c] = (cats[c] || 0) + 1; });
    const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    const max = sorted.length ? sorted[0][1] : 1;

    if (!sorted.length) {
        el.innerHTML = '<div class="aip-empty">No product data available</div>';
        return;
    }

    el.innerHTML = sorted.map(([cat, count]) => `
        <div class="aip-cat-row">
            <span class="aip-cat-label">${cat}</span>
            <div class="aip-cat-bar-wrap">
                <div class="aip-cat-bar" style="width:${Math.round((count / max) * 100)}%"></div>
            </div>
            <span class="aip-cat-count">${count}</span>
        </div>
    `).join('');
}

/* ═══ RENDER PLATFORM INSIGHTS ═══ */
function aipRenderInsights() {
    const el = document.getElementById('aip-insights-list');
    if (!el) return;

    const products = aipGetProducts();
    const drops = aipGetDrops();
    const creators = aipGetCreators();
    const rooms = aipGetRooms();

    const avgPrice = products.length ? Math.round(products.reduce((s, p) => s + (p.price || 0), 0) / products.length) : 0;
    const liveDrops = drops.filter(d => d.status === 'live').length;
    const topCreator = creators.sort((a, b) => (b.engagement || 0) - (a.engagement || 0))[0];
    const totalViewers = rooms.reduce((s, r) => s + (r.viewers || 0), 0);

    const insights = [
        {
            icon: '💰',
            title: 'Average Product Price',
            text: `The average across ${products.length} products is ${aipFmt(avgPrice)}. Products in the ₹500-₹2,500 range have the highest conversion.`
        },
        {
            icon: '🔥',
            title: 'Drop Activity',
            text: `${liveDrops} live drop${liveDrops !== 1 ? 's' : ''} and ${drops.length} total drops created. Creator drops drive 3x more engagement than regular listings.`
        },
        {
            icon: '🌟',
            title: 'Top Creator',
            text: topCreator ? `${topCreator.name} leads with ${(topCreator.engagement || 0).toFixed(1)}% engagement. Partnering with top creators can boost product visibility by 40%.` : 'No creator data available.'
        },
        {
            icon: '🎥',
            title: 'Live Rooms',
            text: `${rooms.filter(r => r.status !== 'ended').length} active room${rooms.length !== 1 ? 's' : ''} with ${totalViewers} total viewers. Drop Rooms have a 2.5x higher purchase rate than standard drops.`
        },
        {
            icon: '⏰',
            title: 'Peak Hours',
            text: 'Platform activity peaks between 7-10 PM IST. Schedule drops during these hours for maximum visibility.'
        },
        {
            icon: '📈',
            title: 'Growth Tip',
            text: 'Vendors who use AI Creator Matching see 35% faster time-to-first-sale. Try the AI Matches feature in the Vendor Dashboard!'
        }
    ];

    el.innerHTML = `<div class="aip-insights-grid">${insights.map(i => `
        <div class="aip-insight-card">
            <div class="aip-insight-icon">${i.icon}</div>
            <div class="aip-insight-title">${i.title}</div>
            <div class="aip-insight-text">${i.text}</div>
        </div>
    `).join('')}</div>`;
}

/* ═══ BOOT ═══ */
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('ai-panel-page')) return;
    aipRenderStats();
    aipRenderDrops();
    aipRenderCreators();
    aipRenderCategories();
    aipRenderInsights();
});
