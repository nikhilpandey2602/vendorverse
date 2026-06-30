/**
 * VendorVerse — Creator Drops System
 * Handles drop page rendering, countdown, buy flow, commission tracking,
 * and leaderboard generation.
 */

/* ═══ CONSTANTS ═══ */
const CD_DROPS_KEY = 'vendorverse_drops';
const CD_SALES_KEY = 'vendorverse_drop_sales';
const CD_CART_KEY = 'vendorverse_cart';
const CD_CREATORS_KEY = 'vendorverse_creators';

const CD_COMMISSION = { creator: 0.12, platform: 0.07, vendor: 0.81 };

/* ═══ HELPERS ═══ */
function cdGetDrops() {
    try { return JSON.parse(localStorage.getItem(CD_DROPS_KEY) || '[]'); }
    catch { return []; }
}
function cdSaveDrops(arr) { localStorage.setItem(CD_DROPS_KEY, JSON.stringify(arr)); }

function cdGetSales() {
    try { return JSON.parse(localStorage.getItem(CD_SALES_KEY) || '[]'); }
    catch { return []; }
}
function cdSaveSales(arr) { localStorage.setItem(CD_SALES_KEY, JSON.stringify(arr)); }

function cdGetCreators() {
    try {
        const stored = JSON.parse(localStorage.getItem(CD_CREATORS_KEY) || '[]');
        if (Array.isArray(stored) && stored.length) return stored;
    } catch { }
    return [
        { creatorId: 'creator_artisan', name: 'Artisan Studio', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AS&backgroundColor=6366f1&textColor=ffffff', niche: 'Minimal & Lifestyle', rating: 4.8, followers: 12400 },
        { creatorId: 'creator_techpro', name: 'TechPro Labs', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TP&backgroundColor=0ea5e9&textColor=ffffff', niche: 'Creator Tech & Gear', rating: 4.6, followers: 8700 },
        { creatorId: 'creator_zenspace', name: 'ZenSpace Home', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=ZH&backgroundColor=10b981&textColor=ffffff', niche: 'Home & Smart Living', rating: 4.9, followers: 5300 }
    ];
}

function cdFmt(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

function cdToast(msg, type) {
    if (typeof showToast === 'function') showToast(msg, type);
    else console.log('[Drop]', msg);
}

/* ═══ SEED DEMO DROPS ═══ */
function cdSeedDemoDrops() {
    const drops = cdGetDrops();
    if (drops.length > 0) return; // already seeded

    const now = Date.now();
    const demoDrops = [
        {
            id: 'drop_demo_1',
            productId: 'prod_lamp_001',
            creatorId: 'creator_artisan',
            vendorId: 'creator_techpro',
            title: 'Exclusive: Minimalist Desk Lamp',
            description: 'A limited-time collaboration between Artisan Studio and TechPro Labs. Premium ambient lighting with USB-C charging, designed for creators who value clean aesthetics.',
            dropPrice: 1499,
            originalPrice: 2499,
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
            duration: 72,
            endsAt: new Date(now + 72 * 3600000).toISOString(),
            createdAt: new Date(now).toISOString(),
            status: 'live',
            sales: 47,
            revenue: { creator: 8454.36, platform: 4933.71, vendor: 57111.93 }
        },
        {
            id: 'drop_demo_2',
            productId: 'prod_mic_002',
            creatorId: 'creator_techpro',
            vendorId: 'creator_artisan',
            title: 'Creator Mic Pro — Studio Edition',
            description: 'TechPro Labs x VendorVerse exclusive. Condenser microphone with noise cancellation, perfect for podcasts and streaming.',
            dropPrice: 3299,
            originalPrice: 4999,
            image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&h=600&fit=crop',
            duration: 48,
            endsAt: new Date(now + 48 * 3600000).toISOString(),
            createdAt: new Date(now).toISOString(),
            status: 'live',
            sales: 23,
            revenue: { creator: 9105.24, platform: 5314.73, vendor: 61504.03 }
        },
        {
            id: 'drop_demo_3',
            productId: 'prod_candle_003',
            creatorId: 'creator_zenspace',
            vendorId: 'creator_artisan',
            title: 'Zen Candle Set — Calm Edition',
            description: 'ZenSpace Home brings handmade soy candles with calming scents. Limited batch of 200 units.',
            dropPrice: 799,
            originalPrice: 1299,
            image: 'https://images.unsplash.com/photo-1602607688066-53ce5bf9f7d0?w=600&h=600&fit=crop',
            duration: 24,
            endsAt: new Date(now + 24 * 3600000).toISOString(),
            createdAt: new Date(now).toISOString(),
            status: 'live',
            sales: 112,
            revenue: { creator: 10738.56, platform: 6264.16, vendor: 72517.28 }
        }
    ];

    cdSaveDrops(demoDrops);
}

/* ═══ DROP PAGE ═══ */
let cdCountdownInterval = null;

function cdRenderDropPage() {
    const container = document.getElementById('drop-page-content');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const dropId = params.get('id');
    if (!dropId) {
        container.innerHTML = '<div style="text-align:center;padding:80px 24px"><h2>Drop not found</h2><p>No drop ID specified.</p><a href="index.html" class="drop-back">← Back to Store</a></div>';
        return;
    }

    const drops = cdGetDrops();
    const drop = drops.find(d => d.id === dropId);
    if (!drop) {
        container.innerHTML = '<div style="text-align:center;padding:80px 24px"><h2>Drop not found</h2><p>This drop may have expired or been removed.</p><a href="index.html" class="drop-back">← Back to Store</a></div>';
        return;
    }

    const creators = cdGetCreators();
    const creator = creators.find(c => c.creatorId === drop.creatorId) || { name: 'Creator', avatar: '', niche: '' };

    const now = Date.now();
    const endTime = new Date(drop.endsAt).getTime();
    const isEnded = endTime <= now || drop.status === 'ended';
    const discount = drop.originalPrice > drop.dropPrice
        ? Math.round((1 - drop.dropPrice / drop.originalPrice) * 100)
        : 0;

    container.innerHTML = `
        <a href="index.html" class="drop-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Store
        </a>

        <div class="drop-hero">
            <div class="drop-image-side">
                <img src="${drop.image}" alt="${drop.title}" loading="lazy">
                <span class="drop-badge-pill">${isEnded ? 'Drop Ended' : '🔥 Creator Drop'}</span>
                ${isEnded ? '<div class="drop-ended-overlay"><span class="drop-ended-badge">Drop Ended</span></div>' : ''}
            </div>

            <div class="drop-info-side">
                <div class="drop-creator-row">
                    <img class="drop-creator-avatar" src="${creator.avatar}" alt="${creator.name}">
                    <div class="drop-creator-info">
                        <span class="drop-creator-name">${creator.name}</span>
                        <span class="drop-creator-niche">${creator.niche || 'Creator'}</span>
                    </div>
                </div>

                <h1 class="drop-title">${drop.title}</h1>
                <p class="drop-description">${drop.description}</p>

                ${!isEnded ? `
                <div class="drop-countdown-wrap">
                    <div class="drop-countdown-label">Drop ends in</div>
                    <div class="drop-countdown" id="drop-cd">
                        <div class="drop-cd-unit"><span class="drop-cd-num" id="drop-cd-d">00</span><span class="drop-cd-lbl">Days</span></div>
                        <div class="drop-cd-unit"><span class="drop-cd-num" id="drop-cd-h">00</span><span class="drop-cd-lbl">Hours</span></div>
                        <div class="drop-cd-unit"><span class="drop-cd-num" id="drop-cd-m">00</span><span class="drop-cd-lbl">Min</span></div>
                        <div class="drop-cd-unit"><span class="drop-cd-num" id="drop-cd-s">00</span><span class="drop-cd-lbl">Sec</span></div>
                    </div>
                </div>` : ''}

                <div class="drop-price-row">
                    <span class="drop-price">${cdFmt(drop.dropPrice)}</span>
                    ${drop.originalPrice ? `<span class="drop-orig-price">${cdFmt(drop.originalPrice)}</span>` : ''}
                    ${discount > 0 ? `<span class="drop-discount">${discount}% OFF</span>` : ''}
                </div>

                <button class="drop-buy-btn" id="drop-buy-btn" ${isEnded ? 'disabled' : ''}>
                    ${isEnded ? 'Drop Ended' : '🛒 Buy Now — ' + cdFmt(drop.dropPrice)}
                </button>

                <div class="drop-split-info">
                    <div class="drop-split-item"><span class="drop-split-pct">12%</span><span class="drop-split-label">Creator</span></div>
                    <div class="drop-split-item"><span class="drop-split-pct">7%</span><span class="drop-split-label">Platform</span></div>
                    <div class="drop-split-item"><span class="drop-split-pct">81%</span><span class="drop-split-label">Vendor</span></div>
                </div>
            </div>
        </div>
    `;

    // Countdown
    if (!isEnded) {
        cdStartCountdown(endTime, drop);
    }

    // Buy
    document.getElementById('drop-buy-btn')?.addEventListener('click', () => {
        cdBuyDrop(drop);
    });
}

function cdStartCountdown(endTime, drop) {
    if (cdCountdownInterval) clearInterval(cdCountdownInterval);

    function tick() {
        const diff = Math.max(0, endTime - Date.now());
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        const dEl = document.getElementById('drop-cd-d');
        const hEl = document.getElementById('drop-cd-h');
        const mEl = document.getElementById('drop-cd-m');
        const sEl = document.getElementById('drop-cd-s');

        if (dEl) dEl.textContent = String(d).padStart(2, '0');
        if (hEl) hEl.textContent = String(h).padStart(2, '0');
        if (mEl) mEl.textContent = String(m).padStart(2, '0');
        if (sEl) sEl.textContent = String(s).padStart(2, '0');

        if (diff <= 0) {
            clearInterval(cdCountdownInterval);
            // Mark as ended
            const drops = cdGetDrops();
            const idx = drops.findIndex(dd => dd.id === drop.id);
            if (idx >= 0) { drops[idx].status = 'ended'; cdSaveDrops(drops); }
            cdRenderDropPage(); // re-render
        }
    }
    tick();
    cdCountdownInterval = setInterval(tick, 1000);
}

function cdBuyDrop(drop) {
    const price = drop.dropPrice;

    // 1. Add to cart
    try {
        const cart = JSON.parse(localStorage.getItem(CD_CART_KEY) || '[]');
        const existing = cart.find(c => c.id === drop.productId && c.dropId === drop.id);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            cart.push({
                id: drop.productId,
                dropId: drop.id,
                title: drop.title,
                brand: 'Creator Drop',
                price: price,
                image: drop.image,
                quantity: 1
            });
        }
        localStorage.setItem(CD_CART_KEY, JSON.stringify(cart));
    } catch (e) {
        console.warn('Cart update failed', e);
    }

    // 2. Record commission sale
    const creatorEarning = Math.round(price * CD_COMMISSION.creator * 100) / 100;
    const platformFee = Math.round(price * CD_COMMISSION.platform * 100) / 100;
    const vendorRevenue = Math.round(price * CD_COMMISSION.vendor * 100) / 100;

    const sales = cdGetSales();
    sales.push({
        dropId: drop.id,
        amount: price,
        creatorEarning,
        platformFee,
        vendorRevenue,
        creatorId: drop.creatorId,
        vendorId: drop.vendorId,
        date: new Date().toISOString()
    });
    cdSaveSales(sales);

    // 3. Update drop sales count & revenue
    const drops = cdGetDrops();
    const idx = drops.findIndex(d => d.id === drop.id);
    if (idx >= 0) {
        drops[idx].sales = (drops[idx].sales || 0) + 1;
        if (!drops[idx].revenue) drops[idx].revenue = { creator: 0, platform: 0, vendor: 0 };
        drops[idx].revenue.creator += creatorEarning;
        drops[idx].revenue.platform += platformFee;
        drops[idx].revenue.vendor += vendorRevenue;
        cdSaveDrops(drops);
    }

    // 4. Update cart badge if visible
    if (typeof updateCartBadge === 'function') updateCartBadge();

    cdToast('Added to cart! Commission split recorded ✓', 'success');
}

/* ═══ LEADERBOARD ═══ */
function cdRenderLeaderboard() {
    const grid = document.getElementById('drop-leaderboard-grid');
    if (!grid) return;

    cdSeedDemoDrops(); // ensure demo data
    const drops = cdGetDrops().filter(d => d.status === 'live' || d.sales > 0);
    const creators = cdGetCreators();

    // Aggregate revenue per creator
    const revenueMap = {};
    drops.forEach(d => {
        const totalRev = (d.revenue?.creator || 0) + (d.revenue?.platform || 0) + (d.revenue?.vendor || 0);
        if (!revenueMap[d.creatorId]) revenueMap[d.creatorId] = 0;
        revenueMap[d.creatorId] += totalRev;
    });

    // Rank creators
    const ranked = Object.entries(revenueMap)
        .map(([cId, rev]) => {
            const c = creators.find(x => x.creatorId === cId) || { name: cId, avatar: '', niche: '' };
            return { ...c, totalRevenue: rev };
        })
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5);

    if (!ranked.length) {
        grid.innerHTML = '<p style="text-align:center;color:#9ca3af;padding:20px">No drops yet. Be the first!</p>';
        return;
    }

    const rankClasses = ['gold', 'silver', 'bronze', '', ''];

    grid.innerHTML = ranked.map((c, i) => `
        <div class="drop-lb-card" style="animation: sfFadeInUp 400ms ${i * 60}ms both">
            <span class="drop-lb-rank ${rankClasses[i] || ''}">${i + 1}</span>
            <img class="drop-lb-avatar" src="${c.avatar}" alt="${c.name}" loading="lazy">
            <div class="drop-lb-info">
                <div class="drop-lb-name">${c.name}</div>
                <div class="drop-lb-revenue">${cdFmt(Math.round(c.totalRevenue))} revenue</div>
            </div>
        </div>
    `).join('');
}

/* ═══ BOOT ═══ */
document.addEventListener('DOMContentLoaded', () => {
    cdSeedDemoDrops();

    // Drop page
    if (document.getElementById('drop-page-content')) {
        cdRenderDropPage();
    }

    // Leaderboard on homepage
    if (document.getElementById('drop-leaderboard-grid')) {
        cdRenderLeaderboard();
    }
});
