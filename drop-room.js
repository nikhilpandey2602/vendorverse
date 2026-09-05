/**
 * VendorVerse — Drop Room System
 * Live drop rooms with countdown-gated buying, chat, and viewer simulation.
 */

/* ═══ CONSTANTS ═══ */
const DR_ROOMS_KEY = 'vendorverse_drop_rooms';
const DR_DROPS_KEY = 'vendorverse_drops';
const DR_CREATORS_KEY = 'vendorverse_creators';
const DR_CART_KEY = 'vendorverse_cart';

const DR_COMMISSION = { creator: 0.12, platform: 0.07, vendor: 0.81 };

/* ═══ SECURITY: escape user text before injecting into HTML ═══ */
function drEscapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const DR_MOCK_USERS = [
    { name: 'Aarav K.', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AK&backgroundColor=6366f1&textColor=ffffff' },
    { name: 'Priya S.', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=PS&backgroundColor=ec4899&textColor=ffffff' },
    { name: 'Rahul M.', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=RM&backgroundColor=10b981&textColor=ffffff' },
    { name: 'Neha D.', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=ND&backgroundColor=f59e0b&textColor=ffffff' },
    { name: 'Vikram J.', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=VJ&backgroundColor=0ea5e9&textColor=ffffff' },
    { name: 'Sneha T.', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=ST&backgroundColor=8b5cf6&textColor=ffffff' },
    { name: 'Arjun P.', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AP&backgroundColor=ef4444&textColor=ffffff' },
    { name: 'Isha R.', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=IR&backgroundColor=14b8a6&textColor=ffffff' }
];

const DR_MOCK_MESSAGES = [
    '🔥 So excited for this drop!',
    'When does it go live?',
    'I love this creator\'s products!',
    'Adding to my wishlist 👀',
    'The quality looks amazing',
    '💰 Saving up for this one!',
    'First time in a drop room!',
    'This is going to sell out fast',
    'Can\'t wait to buy!',
    'The design is incredible ✨',
    'Been waiting for this all week',
    'Let\'s goooo! 🚀',
    'Drop rooms are such a cool feature',
    'That discount is insane!',
    'Who else is buying?',
    '🎉 Almost time!'
];

/* ═══ HELPERS ═══ */
function drGetRooms() {
    try { return JSON.parse(localStorage.getItem(DR_ROOMS_KEY) || '[]'); }
    catch { return []; }
}
function drSaveRooms(arr) { localStorage.setItem(DR_ROOMS_KEY, JSON.stringify(arr)); }

function drGetDrops() {
    try { return JSON.parse(localStorage.getItem(DR_DROPS_KEY) || '[]'); }
    catch { return []; }
}

function drGetCreators() {
    try {
        const stored = JSON.parse(localStorage.getItem(DR_CREATORS_KEY) || '[]');
        if (Array.isArray(stored) && stored.length) return stored;
    } catch { }
    return [
        { creatorId: 'creator_artisan', name: 'Artisan Studio', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AS&backgroundColor=6366f1&textColor=ffffff', niche: 'Minimal & Lifestyle' },
        { creatorId: 'creator_techpro', name: 'TechPro Labs', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TP&backgroundColor=0ea5e9&textColor=ffffff', niche: 'Creator Tech & Gear' },
        { creatorId: 'creator_zenspace', name: 'ZenSpace Home', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=ZH&backgroundColor=10b981&textColor=ffffff', niche: 'Home & Smart Living' }
    ];
}

function drFmt(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

function drToast(msg) {
    if (typeof showToast === 'function') showToast(msg, 'success');
    else console.log('[Room]', msg);
}

function drTimeAgo(iso) {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    return Math.floor(s / 3600) + 'h ago';
}

/* ═══ SEED DEMO ROOMS ═══ */
function drSeedDemoRooms() {
    const rooms = drGetRooms();
    if (rooms.length > 0) return;

    const drops = drGetDrops();
    if (!drops.length) return;

    const now = Date.now();
    // Create a room for the first demo drop with unlock in 2 minutes (so user can see it go live)
    const demoRoom = {
        id: 'room_demo_1',
        dropId: drops[0].id,
        creatorId: drops[0].creatorId,
        title: drops[0].title + ' — Drop Room',
        status: 'waiting',
        unlockAt: new Date(now + 2 * 60000).toISOString(), // 2 min from now
        viewers: 47 + Math.floor(Math.random() * 30),
        stock: 200,
        stockRemaining: 200,
        chatMessages: [
            { user: DR_MOCK_USERS[0], text: '🔥 So excited for this drop!', time: new Date(now - 120000).toISOString() },
            { user: DR_MOCK_USERS[1], text: 'The product looks amazing!', time: new Date(now - 90000).toISOString() },
            { user: DR_MOCK_USERS[2], text: 'When does it unlock?', time: new Date(now - 45000).toISOString() },
            { type: 'system', text: '⏱ Drop unlocks in 2 minutes!', time: new Date(now - 30000).toISOString() }
        ],
        createdAt: new Date(now).toISOString()
    };

    drSaveRooms([demoRoom]);
}

/* ═══ ROOM PAGE RENDERING ═══ */
let drCountdownTimer = null;
let drViewerTimer = null;
let drChatTimer = null;

function drRenderRoom() {
    const container = document.getElementById('drop-room-content');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('id');
    if (!roomId) {
        container.innerHTML = '<div style="text-align:center;padding:80px 24px;color:#fff"><h2>Room not found</h2><p>No room ID specified.</p><a href="index.html" class="dr-back">← Back to Store</a></div>';
        return;
    }

    const rooms = drGetRooms();
    const room = rooms.find(r => r.id === roomId);
    if (!room) {
        container.innerHTML = '<div style="text-align:center;padding:80px 24px;color:#fff"><h2>Room not found</h2><p>This room may have ended.</p><a href="index.html" class="dr-back">← Back to Store</a></div>';
        return;
    }

    const drops = drGetDrops();
    const drop = drops.find(d => d.id === room.dropId);
    if (!drop) {
        container.innerHTML = '<div style="text-align:center;padding:80px 24px;color:#fff"><h2>Drop not found</h2><p>The linked drop is no longer available.</p><a href="index.html" class="dr-back">← Back to Store</a></div>';
        return;
    }

    const creators = drGetCreators();
    const creator = creators.find(c => c.creatorId === room.creatorId) || { name: 'Creator', avatar: '', niche: '' };

    const now = Date.now();
    const unlockTime = new Date(room.unlockAt).getTime();
    const isUnlocked = unlockTime <= now;
    const isEnded = room.status === 'ended';

    const statusClass = isEnded ? 'ended' : (isUnlocked ? 'live' : 'waiting');
    const statusText = isEnded ? 'ENDED' : (isUnlocked ? '● LIVE' : '⏱ WAITING');

    const dropPrice = drop.dropPrice || drop.price || 0;
    const discount = drop.originalPrice > dropPrice ? Math.round((1 - dropPrice / drop.originalPrice) * 100) : 0;
    const stockPct = room.stock > 0 ? Math.round((room.stockRemaining / room.stock) * 100) : 0;

    const chatHtml = (room.chatMessages || []).map(msg => {
        if (msg.type === 'system') {
            return `<div class="dr-chat-system"><span class="dr-chat-system-text">${drEscapeHtml(msg.text)}</span></div>`;
        }
        return `
        <div class="dr-chat-msg">
            <img class="dr-chat-avatar" src="${msg.user.avatar}" alt="${drEscapeHtml(msg.user.name)}" loading="lazy">
            <div class="dr-chat-bubble">
                <div class="dr-chat-name">${drEscapeHtml(msg.user.name)}</div>
                <div class="dr-chat-text">${drEscapeHtml(msg.text)}</div>
                <div class="dr-chat-time">${drTimeAgo(msg.time)}</div>
            </div>
        </div>`;
    }).join('');

    container.innerHTML = `
        <a href="index.html" class="dr-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Store
        </a>

        <div class="dr-room">
            <!-- Stage -->
            <div class="dr-stage">
                <div class="dr-stage-header">
                    <div class="dr-stage-left">
                        <span class="dr-live-badge ${statusClass}">
                            ${statusClass === 'live' ? '<span class="dr-live-dot"></span>' : ''}
                            ${statusText}
                        </span>
                        <span style="color:rgba(255,255,255,0.5);font-size:0.75rem">${room.title}</span>
                    </div>
                    <div class="dr-viewer-count">
                        <span class="dr-viewer-dot"></span>
                        <span id="dr-viewer-num">${room.viewers || 0}</span> watching
                    </div>
                </div>

                <div class="dr-stage-body">
                    <div class="dr-creator-spotlight">
                        <img class="dr-creator-avatar-lg" src="${creator.avatar}" alt="${creator.name}">
                        <div class="dr-creator-name-lg">${creator.name}</div>
                        <div class="dr-creator-niche-lg">${creator.niche}</div>
                    </div>

                    <div class="dr-product-showcase">
                        <img class="dr-product-img" src="${drop.image}" alt="${drop.title}" loading="lazy">
                        <div class="dr-product-details">
                            <div class="dr-product-name">${drop.title}</div>
                            <div class="dr-product-desc">${drop.description || ''}</div>
                            <div class="dr-product-price-row">
                                <span class="dr-product-price">${drFmt(dropPrice)}</span>
                                ${drop.originalPrice ? `<span class="dr-product-orig">${drFmt(drop.originalPrice)}</span>` : ''}
                                ${discount > 0 ? `<span class="dr-product-discount">${discount}% OFF</span>` : ''}
                            </div>
                        </div>
                    </div>

                    ${!isUnlocked && !isEnded ? `
                    <div class="dr-countdown-section">
                        <div class="dr-countdown-label">Drop unlocks in</div>
                        <div class="dr-countdown-grid" id="dr-countdown">
                            <div class="dr-cd-block"><div class="dr-cd-num" id="dr-cd-m">00</div><div class="dr-cd-lbl">Min</div></div>
                            <div class="dr-cd-block"><div class="dr-cd-num" id="dr-cd-s">00</div><div class="dr-cd-lbl">Sec</div></div>
                        </div>
                    </div>` : ''}

                    <button class="dr-buy-btn ${isEnded ? 'ended' : (isUnlocked ? 'unlocked' : 'locked')}" id="dr-buy-btn" ${!isUnlocked || isEnded ? 'disabled' : ''}>
                        ${isEnded ? 'Drop Ended' : (isUnlocked ? '🛒 Buy Now — ' + drFmt(dropPrice) : '🔒 Locked — Waiting for Drop')}
                    </button>

                    ${isUnlocked && !isEnded ? `
                    <div class="dr-stock-bar-wrap">
                        <div class="dr-stock-label">
                            <span>Stock remaining</span>
                            <span id="dr-stock-text">${room.stockRemaining}/${room.stock}</span>
                        </div>
                        <div class="dr-stock-track">
                            <div class="dr-stock-fill" id="dr-stock-fill" style="width:${stockPct}%"></div>
                        </div>
                    </div>` : ''}

                    <div class="dr-commission-row">
                        <div class="dr-commission-item"><div class="dr-commission-pct">12%</div><div class="dr-commission-label">Creator</div></div>
                        <div class="dr-commission-item"><div class="dr-commission-pct">7%</div><div class="dr-commission-label">Platform</div></div>
                        <div class="dr-commission-item"><div class="dr-commission-pct">81%</div><div class="dr-commission-label">Vendor</div></div>
                    </div>
                </div>
            </div>

            <!-- Chat -->
            <div class="dr-chat">
                <div class="dr-chat-header">
                    <span class="dr-chat-title">💬 Live Chat</span>
                    <span class="dr-chat-count" id="dr-chat-count">${(room.chatMessages || []).length} messages</span>
                </div>
                <div class="dr-chat-messages" id="dr-chat-messages">
                    ${chatHtml}
                </div>
                <div class="dr-chat-input-wrap">
                    <input class="dr-chat-input" id="dr-chat-input" type="text" placeholder="Say something..." maxlength="200" autocomplete="off">
                    <button class="dr-chat-send" id="dr-chat-send">Send</button>
                </div>
            </div>
        </div>
    `;

    // Scroll chat to bottom
    const chatEl = document.getElementById('dr-chat-messages');
    if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;

    // Start timers
    if (!isUnlocked && !isEnded) drStartCountdown(unlockTime, room, drop);
    drStartViewerSim(room);
    drStartChatSim(room);

    // Buy button
    document.getElementById('dr-buy-btn')?.addEventListener('click', () => {
        drBuyFromRoom(room, drop);
    });

    // Chat input
    document.getElementById('dr-chat-send')?.addEventListener('click', () => drSendChat(room));
    document.getElementById('dr-chat-input')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') drSendChat(room);
    });
}

/* ═══ COUNTDOWN ═══ */
function drStartCountdown(unlockTime, room, drop) {
    if (drCountdownTimer) clearInterval(drCountdownTimer);

    function tick() {
        const diff = Math.max(0, unlockTime - Date.now());
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        const mEl = document.getElementById('dr-cd-m');
        const sEl = document.getElementById('dr-cd-s');
        if (mEl) mEl.textContent = String(m).padStart(2, '0');
        if (sEl) sEl.textContent = String(s).padStart(2, '0');

        if (diff <= 0) {
            clearInterval(drCountdownTimer);
            // Unlock the drop
            const rooms = drGetRooms();
            const idx = rooms.findIndex(r => r.id === room.id);
            if (idx >= 0) {
                rooms[idx].status = 'live';
                drSaveRooms(rooms);
            }
            // Add system message
            drAddSystemMessage(room, '🎉 DROP IS NOW LIVE! Buy before it sells out!');
            // Re-render
            drRenderRoom();
        }
    }
    tick();
    drCountdownTimer = setInterval(tick, 1000);
}

/* ═══ VIEWER SIMULATION ═══ */
function drStartViewerSim(room) {
    if (drViewerTimer) clearInterval(drViewerTimer);

    drViewerTimer = setInterval(() => {
        const el = document.getElementById('dr-viewer-num');
        if (!el) return;

        const rooms = drGetRooms();
        const r = rooms.find(x => x.id === room.id);
        if (!r) return;

        // Random fluctuation
        const delta = Math.floor(Math.random() * 5) - 1; // -1 to +3
        r.viewers = Math.max(10, (r.viewers || 30) + delta);
        drSaveRooms(rooms);
        el.textContent = r.viewers;
    }, 3000);
}

/* ═══ CHAT SIMULATION ═══ */
function drStartChatSim(room) {
    if (drChatTimer) clearInterval(drChatTimer);

    drChatTimer = setInterval(() => {
        const chatEl = document.getElementById('dr-chat-messages');
        if (!chatEl) return;

        // Random chance to add a message
        if (Math.random() > 0.4) return;

        const user = DR_MOCK_USERS[Math.floor(Math.random() * DR_MOCK_USERS.length)];
        const text = DR_MOCK_MESSAGES[Math.floor(Math.random() * DR_MOCK_MESSAGES.length)];
        const now = new Date().toISOString();

        // Save to room
        const rooms = drGetRooms();
        const r = rooms.find(x => x.id === room.id);
        if (r) {
            if (!r.chatMessages) r.chatMessages = [];
            r.chatMessages.push({ user, text, time: now });
            // Keep only last 50 messages
            if (r.chatMessages.length > 50) r.chatMessages = r.chatMessages.slice(-50);
            drSaveRooms(rooms);
        }

        // Append to DOM
        const msgEl = document.createElement('div');
        msgEl.className = 'dr-chat-msg';
        msgEl.innerHTML = `
            <img class="dr-chat-avatar" src="${user.avatar}" alt="${drEscapeHtml(user.name)}" loading="lazy">
            <div class="dr-chat-bubble">
                <div class="dr-chat-name">${drEscapeHtml(user.name)}</div>
                <div class="dr-chat-text">${drEscapeHtml(text)}</div>
                <div class="dr-chat-time">just now</div>
            </div>`;
        chatEl.appendChild(msgEl);
        chatEl.scrollTop = chatEl.scrollHeight;

        // Update count
        const countEl = document.getElementById('dr-chat-count');
        if (countEl && r) countEl.textContent = r.chatMessages.length + ' messages';
    }, 4000);
}

/* ═══ USER CHAT ═══ */
function drSendChat(room) {
    const input = document.getElementById('dr-chat-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    const now = new Date().toISOString();
    const user = { name: 'You', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=ME&backgroundColor=6366f1&textColor=ffffff' };

    // Save
    const rooms = drGetRooms();
    const r = rooms.find(x => x.id === room.id);
    if (r) {
        if (!r.chatMessages) r.chatMessages = [];
        r.chatMessages.push({ user, text, time: now });
        drSaveRooms(rooms);
    }

    // Append
    const chatEl = document.getElementById('dr-chat-messages');
    if (chatEl) {
        const msgEl = document.createElement('div');
        msgEl.className = 'dr-chat-msg';
        msgEl.innerHTML = `
            <img class="dr-chat-avatar" src="${user.avatar}" alt="You" loading="lazy">
            <div class="dr-chat-bubble">
                <div class="dr-chat-name" style="color:#10b981">You</div>
                <div class="dr-chat-text">${drEscapeHtml(text)}</div>
                <div class="dr-chat-time">just now</div>
            </div>`;
        chatEl.appendChild(msgEl);
        chatEl.scrollTop = chatEl.scrollHeight;
    }

    const countEl = document.getElementById('dr-chat-count');
    if (countEl && r) countEl.textContent = r.chatMessages.length + ' messages';
}

/* ═══ SYSTEM MESSAGE ═══ */
function drAddSystemMessage(room, text) {
    const now = new Date().toISOString();
    const rooms = drGetRooms();
    const r = rooms.find(x => x.id === room.id);
    if (r) {
        if (!r.chatMessages) r.chatMessages = [];
        r.chatMessages.push({ type: 'system', text, time: now });
        drSaveRooms(rooms);
    }
}

/* ═══ BUY FROM ROOM ═══ */
function drBuyFromRoom(room, drop) {
    const price = drop.dropPrice || drop.price || 0;

    // Decrease stock
    const rooms = drGetRooms();
    const r = rooms.find(x => x.id === room.id);
    if (r && r.stockRemaining > 0) {
        r.stockRemaining--;
        drSaveRooms(rooms);

        // Update stock bar
        const stockText = document.getElementById('dr-stock-text');
        const stockFill = document.getElementById('dr-stock-fill');
        if (stockText) stockText.textContent = r.stockRemaining + '/' + r.stock;
        if (stockFill) stockFill.style.width = Math.round((r.stockRemaining / r.stock) * 100) + '%';

        if (r.stockRemaining <= 0) {
            r.status = 'ended';
            drSaveRooms(rooms);
            drAddSystemMessage(room, '🚫 SOLD OUT! This drop has ended.');
            drRenderRoom();
            return;
        }
    }

    // Use creator-drops buy logic if available
    if (typeof cdBuyDrop === 'function') {
        cdBuyDrop(drop);
    } else {
        // Fallback: add to cart manually
        try {
            const cart = JSON.parse(localStorage.getItem(DR_CART_KEY) || '[]');
            cart.push({ id: drop.productId, dropId: drop.id, title: drop.title, brand: 'Drop Room', price, image: drop.image, quantity: 1 });
            localStorage.setItem(DR_CART_KEY, JSON.stringify(cart));
        } catch (e) { console.warn('Cart update failed', e); }
        drToast('Added to cart! Commission split recorded ✓');
    }

    // Add system message
    drAddSystemMessage(room, '🛒 Someone just bought! ' + (r ? r.stockRemaining : '?') + ' remaining');

    // Re-append the chat message
    const chatEl = document.getElementById('dr-chat-messages');
    if (chatEl) {
        const msgEl = document.createElement('div');
        msgEl.className = 'dr-chat-system';
        msgEl.innerHTML = `<span class="dr-chat-system-text">🛒 Someone just bought! ${r ? r.stockRemaining : '?'} remaining</span>`;
        chatEl.appendChild(msgEl);
        chatEl.scrollTop = chatEl.scrollHeight;
    }
}

/* ═══ CREATE ROOM (called from Creator Studio) ═══ */
function drCreateRoom(dropId) {
    const drops = drGetDrops();
    const drop = drops.find(d => d.id === dropId);
    if (!drop) return null;

    const rooms = drGetRooms();
    // Check if room already exists for this drop
    const existing = rooms.find(r => r.dropId === dropId && r.status !== 'ended');
    if (existing) return existing;

    const now = Date.now();
    const room = {
        id: 'room_' + now + '_' + Math.random().toString(36).slice(2, 6),
        dropId,
        creatorId: drop.creatorId,
        title: drop.title + ' — Drop Room',
        status: 'waiting',
        unlockAt: new Date(now + 3 * 60000).toISOString(), // 3 min from now
        viewers: 15 + Math.floor(Math.random() * 20),
        stock: 200,
        stockRemaining: 200,
        chatMessages: [
            { type: 'system', text: '🎥 Drop Room created! Countdown begins.', time: new Date(now).toISOString() }
        ],
        createdAt: new Date(now).toISOString()
    };

    rooms.push(room);
    drSaveRooms(rooms);
    return room;
}

/* ═══ GET LIVE ROOMS (for Smart Feed) ═══ */
function drGetLiveRooms() {
    const rooms = drGetRooms();
    const now = Date.now();
    return rooms.filter(r => {
        if (r.status === 'ended') return false;
        // Also include 'waiting' rooms
        return true;
    });
}

/* ═══ BOOT ═══ */
document.addEventListener('DOMContentLoaded', () => {
    drSeedDemoRooms();

    if (document.getElementById('drop-room-content')) {
        drRenderRoom();
    }
});

/* ═══ CLEANUP ON PAGE LEAVE ═══ */
window.addEventListener('beforeunload', () => {
    if (drCountdownTimer) clearInterval(drCountdownTimer);
    if (drViewerTimer) clearInterval(drViewerTimer);
    if (drChatTimer) clearInterval(drChatTimer);
});
