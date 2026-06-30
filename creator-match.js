/**
 * VendorVerse — AI Creator Matchmaking Engine
 * Analyzes product categories vs creator niches to generate match scores.
 */

/* ═══ CONSTANTS ═══ */
const CM_CREATORS_KEY = 'vendorverse_creators';
const CM_PRODUCTS_KEY = 'vendorverse_vendor_products';
const CM_INVITES_KEY  = 'vendorverse_collab_invites';

/* ═══ CATEGORY ↔ NICHE AFFINITY MAP ═══
   Higher value = stronger match (0-100) */
const CM_AFFINITY = {
    'electronics':  { 'Creator Tech & Gear': 95, 'Home & Smart Living': 70, 'Minimal & Lifestyle': 55, 'Fashion & Style': 30, 'Fitness & Sports': 35 },
    'fashion':      { 'Fashion & Style': 95, 'Minimal & Lifestyle': 70, 'Creator Tech & Gear': 20, 'Fitness & Sports': 45, 'Home & Smart Living': 25 },
    'home':         { 'Home & Smart Living': 95, 'Minimal & Lifestyle': 80, 'Creator Tech & Gear': 40, 'Fashion & Style': 30, 'Fitness & Sports': 20 },
    'beauty':       { 'Fashion & Style': 80, 'Minimal & Lifestyle': 65, 'Fitness & Sports': 40, 'Home & Smart Living': 30, 'Creator Tech & Gear': 15 },
    'grocery':      { 'Home & Smart Living': 60, 'Fitness & Sports': 50, 'Minimal & Lifestyle': 40, 'Fashion & Style': 15, 'Creator Tech & Gear': 10 },
    'sports':       { 'Fitness & Sports': 95, 'Creator Tech & Gear': 45, 'Minimal & Lifestyle': 35, 'Fashion & Style': 40, 'Home & Smart Living': 20 },
    'books':        { 'Minimal & Lifestyle': 70, 'Creator Tech & Gear': 50, 'Home & Smart Living': 40, 'Fashion & Style': 25, 'Fitness & Sports': 20 },
    'lighting':     { 'Home & Smart Living': 90, 'Minimal & Lifestyle': 85, 'Creator Tech & Gear': 60, 'Fashion & Style': 30, 'Fitness & Sports': 15 },
    'audio':        { 'Creator Tech & Gear': 95, 'Minimal & Lifestyle': 55, 'Fitness & Sports': 40, 'Home & Smart Living': 35, 'Fashion & Style': 20 },
    'accessories':  { 'Fashion & Style': 85, 'Minimal & Lifestyle': 70, 'Creator Tech & Gear': 50, 'Fitness & Sports': 45, 'Home & Smart Living': 30 }
};

/* ═══ HELPERS ═══ */
function cmGetCreators() {
    try {
        const stored = JSON.parse(localStorage.getItem(CM_CREATORS_KEY) || '[]');
        if (Array.isArray(stored) && stored.length) return stored;
    } catch {}
    // Fallback: rich demo creators
    const demo = [
        { creatorId: 'creator_artisan', name: 'Artisan Studio', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AS&backgroundColor=6366f1&textColor=ffffff', niche: 'Minimal & Lifestyle', followers: 24500, engagement: 8.2, rating: 4.8 },
        { creatorId: 'creator_techpro', name: 'TechPro Labs', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TP&backgroundColor=0ea5e9&textColor=ffffff', niche: 'Creator Tech & Gear', followers: 89200, engagement: 6.4, rating: 4.6 },
        { creatorId: 'creator_zenspace', name: 'ZenSpace Home', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=ZH&backgroundColor=10b981&textColor=ffffff', niche: 'Home & Smart Living', followers: 41300, engagement: 7.1, rating: 4.9 },
        { creatorId: 'creator_fitlife', name: 'FitLife Pro', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=FL&backgroundColor=ef4444&textColor=ffffff', niche: 'Fitness & Sports', followers: 62800, engagement: 9.3, rating: 4.7 },
        { creatorId: 'creator_stylevault', name: 'Style Vault', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SV&backgroundColor=ec4899&textColor=ffffff', niche: 'Fashion & Style', followers: 117000, engagement: 5.8, rating: 4.5 }
    ];
    localStorage.setItem(CM_CREATORS_KEY, JSON.stringify(demo));
    return demo;
}

function cmGetProducts() {
    try { return JSON.parse(localStorage.getItem(CM_PRODUCTS_KEY) || '[]'); }
    catch { return []; }
}

function cmGetInvites() {
    try { return JSON.parse(localStorage.getItem(CM_INVITES_KEY) || '[]'); }
    catch { return []; }
}
function cmSaveInvites(arr) { localStorage.setItem(CM_INVITES_KEY, JSON.stringify(arr)); }

function cmFmt(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

function cmFmtFollowers(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
}

/* ═══ MATCH SCORING ENGINE ═══ */
function cmCalculateMatch(product, creator) {
    let score = 0;
    const category = (product.category || '').toLowerCase();

    // 1. Category ↔ Niche affinity (0-40 pts)
    const affinityMap = CM_AFFINITY[category] || {};
    const nicheMatch = affinityMap[creator.niche] || 15; // default low
    score += (nicheMatch / 100) * 40;

    // 2. Engagement level (0-25 pts) — higher engagement = better
    const engagement = creator.engagement || 5;
    score += Math.min(25, (engagement / 10) * 25);

    // 3. Follower reach (0-20 pts) — scaled logarithmically
    const followers = creator.followers || 1000;
    const followerScore = Math.min(20, Math.log10(followers) * 4);
    score += followerScore;

    // 4. Creator rating (0-15 pts)
    const rating = creator.rating || 4;
    score += (rating / 5) * 15;

    return Math.min(99, Math.round(score));
}

/* ═══ GET MATCHES FOR PRODUCT ═══ */
function cmGetMatchesForProduct(product) {
    const creators = cmGetCreators();
    const invites = cmGetInvites();

    const matches = creators.map(creator => {
        const score = cmCalculateMatch(product, creator);
        const existingInvite = invites.find(i => i.creatorId === creator.creatorId && i.productId === product.id);
        return {
            creator,
            score,
            invited: !!existingInvite,
            inviteStatus: existingInvite?.status || null
        };
    });

    matches.sort((a, b) => b.score - a.score);
    return matches;
}

/* ═══ GET ALL MATCHES (all products × all creators, top results) ═══ */
function cmGetTopMatches(limit = 6) {
    const products = cmGetProducts().filter(p => p.status === 'live');
    const creators = cmGetCreators();
    const invites = cmGetInvites();

    // If no vendor products, use PRODUCT_DATA
    let allProducts = products.length ? products : [];
    if (!allProducts.length && typeof PRODUCT_DATA !== 'undefined') {
        allProducts = PRODUCT_DATA.slice(0, 8);
    }

    const allMatches = [];
    allProducts.forEach(product => {
        creators.forEach(creator => {
            const score = cmCalculateMatch(product, creator);
            const existingInvite = invites.find(i => i.creatorId === creator.creatorId && i.productId === product.id);
            allMatches.push({
                product,
                creator,
                score,
                invited: !!existingInvite,
                inviteStatus: existingInvite?.status || null
            });
        });
    });

    allMatches.sort((a, b) => b.score - a.score);

    // Deduplicate: keep only the top match per creator
    const seen = new Set();
    const unique = [];
    for (const m of allMatches) {
        if (seen.has(m.creator.creatorId)) continue;
        seen.add(m.creator.creatorId);
        unique.push(m);
        if (unique.length >= limit) break;
    }
    return unique;
}

/* ═══ SEND INVITE ═══ */
function cmSendInvite(creatorId, productId, productName) {
    const invites = cmGetInvites();

    // Check if already invited
    const existing = invites.find(i => i.creatorId === creatorId && i.productId === productId);
    if (existing) return false;

    invites.push({
        id: 'invite_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
        creatorId,
        productId,
        productName: productName || 'Product',
        vendorId: 'vendor_main',
        vendorName: 'VendorVerse Store',
        status: 'pending',
        sentAt: new Date().toISOString()
    });

    cmSaveInvites(invites);
    return true;
}

/* ═══ RENDER MATCH CARD ═══ */
function cmRenderMatchCard(match, idx) {
    const { creator, score, invited, inviteStatus, product } = match;

    const scoreColor =
        score >= 80 ? '#10b981' :
        score >= 60 ? '#6366f1' :
        score >= 40 ? '#f59e0b' : '#ef4444';

    const scoreLabel =
        score >= 80 ? 'Excellent Match' :
        score >= 60 ? 'Good Match' :
        score >= 40 ? 'Fair Match' : 'Low Match';

    const inviteHtml = invited
        ? `<span class="cm-invite-status ${inviteStatus}">${inviteStatus === 'accepted' ? '✅ Accepted' : inviteStatus === 'declined' ? '❌ Declined' : '⏳ Pending'}</span>`
        : `<button class="cm-invite-btn" data-cm-invite data-creator-id="${creator.creatorId}" data-product-id="${product?.id || ''}" data-product-name="${product?.name || product?.title || ''}">🤝 Invite to Drop</button>`;

    return `
    <article class="cm-card" style="animation-delay:${idx * 60}ms">
        <div class="cm-card-header">
            <div class="cm-score-ring" style="--score:${score};--score-color:${scoreColor}">
                <svg viewBox="0 0 36 36" class="cm-ring-svg">
                    <path class="cm-ring-bg" d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    <path class="cm-ring-fill" stroke="${scoreColor}" stroke-dasharray="${score}, 100" d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                </svg>
                <span class="cm-score-num">${score}%</span>
            </div>
            <span class="cm-score-label" style="color:${scoreColor}">${scoreLabel}</span>
        </div>
        <div class="cm-card-body">
            <img class="cm-avatar" src="${creator.avatar}" alt="${creator.name}" loading="lazy">
            <h3 class="cm-name">${creator.name}</h3>
            <div class="cm-niche">${creator.niche}</div>
            <div class="cm-stats">
                <div class="cm-stat"><span class="cm-stat-val">${cmFmtFollowers(creator.followers || 0)}</span><span class="cm-stat-lbl">Followers</span></div>
                <div class="cm-stat"><span class="cm-stat-val">${(creator.engagement || 0).toFixed(1)}%</span><span class="cm-stat-lbl">Engagement</span></div>
                <div class="cm-stat"><span class="cm-stat-val">★ ${(creator.rating || 0).toFixed(1)}</span><span class="cm-stat-lbl">Rating</span></div>
            </div>
            ${product ? `<div class="cm-product-tag">Best for: ${product.name || product.title || 'Product'}</div>` : ''}
        </div>
        <div class="cm-card-footer">${inviteHtml}</div>
    </article>`;
}

/* ═══ RENDER MATCHES VIEW (for Vendor Dashboard) ═══ */
function cmRenderMatchesView() {
    const grid = document.getElementById('cm-matches-grid');
    const statTotal = document.getElementById('cm-stat-total');
    const statBest = document.getElementById('cm-stat-best');
    const statInvited = document.getElementById('cm-stat-invited');
    if (!grid) return;

    const matches = cmGetTopMatches(6);
    const invites = cmGetInvites();

    // Update stats
    if (statTotal) statTotal.textContent = cmGetCreators().length;
    if (statBest) statBest.textContent = matches.length > 0 ? matches[0].score + '%' : '—';
    if (statInvited) statInvited.textContent = invites.length;

    if (matches.length === 0) {
        grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px 24px;color:var(--color-text-secondary,#6b7280)">
            <div style="font-size:2.5rem;margin-bottom:12px">🤖</div>
            <p style="font-weight:600">No matches yet</p>
            <p style="font-size:0.8rem">Add products to your store to get AI-powered creator recommendations.</p>
        </div>`;
        return;
    }

    grid.innerHTML = matches.map((m, i) => cmRenderMatchCard(m, i)).join('');

    // Attach invite handlers
    grid.querySelectorAll('[data-cm-invite]').forEach(btn => {
        btn.addEventListener('click', () => {
            const creatorId = btn.dataset.creatorId;
            const productId = btn.dataset.productId;
            const productName = btn.dataset.productName;
            const sent = cmSendInvite(creatorId, productId, productName);
            if (sent) {
                if (typeof showToast === 'function') showToast('🤝 Invite sent!', 'success');
                else if (typeof toast === 'function') toast('🤝 Invite sent!', 'success');
                cmRenderMatchesView(); // Re-render to update button state
            } else {
                if (typeof showToast === 'function') showToast('Already invited', 'info');
            }
        });
    });
}

/* ═══ BOOT ═══ */
document.addEventListener('DOMContentLoaded', () => {
    // Ensure demo creators exist
    cmGetCreators();
});
