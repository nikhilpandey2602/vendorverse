/**
 * VendorVerse — AI Copilot (Claude API Edition)
 * Floating chat assistant powered by Claude claude-sonnet-4-20250514 via backend proxy.
 * Context-aware for shoppers, creators, and vendors.
 */

/* ═══ CONFIG ═══ */
const AIC_API_URL = 'https://vendorverse-ekf8.onrender.com/api/ai/chat';
const AIC_HISTORY_KEY = 'vendorverse_aic_history';
const AIC_MAX_HISTORY = 40;

/* ═══ STATE ═══ */
let aicOpen = false;
let aicMessages = [];       // UI messages { role, text, time }
let aicConversation = [];   // Claude conversation { role, content }
let aicIsLoading = false;

/* ═══ CONTEXT DETECTION ═══ */
function aicDetectContext() {
    const path = window.location.pathname.toLowerCase();
    const title = document.title.toLowerCase();
    if (path.includes('vendor-dashboard') || title.includes('vendor')) return 'vendor-dashboard';
    if (path.includes('creator-studio') || path.includes('creator')) return 'creator-studio';
    if (path.includes('drop-room')) return 'drop-room';
    if (path.includes('cart')) return 'cart';
    if (path.includes('product')) return 'product-page';
    if (path.includes('ai-panel')) return 'ai-dashboard';
    return 'homepage / marketplace';
}

/* ═══ MARKDOWN PARSER ═══ */
function aicParseMarkdown(text) {
    if (!text) return '';
    // SECURITY: escape raw HTML first. The AI output is untrusted — it can echo
    // user input (which is sent to the model) and would otherwise render as live
    // HTML/JS in the chat. Markdown tags are generated AFTER escaping.
    const escaped = aicEscapeHtml(text);
    return escaped
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
        // Inline code
        .replace(/`(.*?)`/g, '<code class="aic-code">$1</code>')
        // Bullet lists
        .replace(/^[•\-\*]\s+(.+)/gm, '<li>$1</li>')
        // Numbered lists
        .replace(/^\d+\.\s+(.+)/gm, '<li>$1</li>')
        // Wrap consecutive <li> in <ul>
        .replace(/((?:<li>.*?<\/li>\n?)+)/g, '<ul class="aic-list">$1</ul>')
        // Line breaks (but not inside tags)
        .replace(/\n/g, '<br>');
}

/* ═══ CALL CLAUDE VIA BACKEND ═══ */
async function aicCallClaude(userText) {
    // Add to conversation history
    aicConversation.push({ role: 'user', content: userText });

    // Trim conversation to last 20 exchanges to keep tokens reasonable
    if (aicConversation.length > 40) {
        aicConversation = aicConversation.slice(-40);
    }

    const context = aicDetectContext();

    try {
        const response = await fetch(AIC_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: aicConversation,
                context: context
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to get AI response');
        }

        // Add assistant response to conversation history
        aicConversation.push({ role: 'assistant', content: data.message });

        return { text: data.message };

    } catch (error) {
        console.error('AI Copilot error:', error);

        // Remove the user message from conversation if request failed
        aicConversation.pop();

        // Friendly error messages
        if (error.message.includes('API key')) {
            return { text: '⚠️ The AI service needs to be configured. Please add your Gemini API key to the backend `.env` file as `GEMINI_API_KEY=...`' };
        }
        if (error.message.includes('Too many requests')) {
            return { text: '⏳ I\'m getting a lot of requests right now. Please wait a moment and try again!' };
        }
        if (error.message === 'Failed to fetch') {
            return { text: '🔌 I can\'t reach the AI server. Make sure the backend is running on port 5000 (`npm run dev` in the backend folder).' };
        }
        return { text: 'I\'m having a little trouble right now. Please try again in a moment! 🙂' };
    }
}

/* ═══ INITIALIZE UI ═══ */
function aicInit() {
    // Don't double-initialize
    if (document.getElementById('aic-bubble')) return;

    // Create floating bubble
    const bubble = document.createElement('button');
    bubble.className = 'aic-bubble';
    bubble.id = 'aic-bubble';
    bubble.setAttribute('aria-label', 'Open VendorVerse AI assistant');
    bubble.innerHTML = `
        <svg class="aic-bubble-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M12 2C6.48 2 2 6.03 2 10.93c0 2.84 1.47 5.36 3.78 7.01L4.5 21.5l4.08-2.04c1.08.33 2.22.51 3.42.51 5.52 0 10-4.03 10-8.97S17.52 2 12 2z"/>
            <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none"/>
            <circle cx="12" cy="11" r="1" fill="currentColor" stroke="none"/>
            <circle cx="16" cy="11" r="1" fill="currentColor" stroke="none"/>
        </svg>
        <svg class="aic-bubble-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        <span class="aic-bubble-pulse"></span>`;
    document.body.appendChild(bubble);

    // Create chat panel
    const panel = document.createElement('div');
    panel.className = 'aic-panel';
    panel.id = 'aic-panel';

    // Context-aware chips
    const ctx = aicDetectContext();
    const chipSets = {
        'vendor-dashboard': ['Write a product description', 'Suggest a price for my product', 'How do I get more sales?', 'What\'s trending on VendorVerse?'],
        'creator-studio': ['Best time to launch a drop', 'How to grow my audience', 'Write a drop announcement', 'Creator collaboration tips'],
        'drop-room': ['Tips for a successful drop', 'How do drop rooms work?', 'Engage viewers during a drop', 'Pricing strategy for drops'],
        'cart': ['Help me decide what to buy', 'Compare items in my cart', 'Are there any active drops?', 'How does checkout work?'],
        'product-page': ['Is this a good deal?', 'Write a review for this product', 'Compare with similar products', 'Any active drops for this?'],
        'ai-dashboard': ['What insights can you share?', 'Top performing categories', 'Creator partnership advice', 'Platform growth tips'],
        'homepage / marketplace': ['Write a product description', 'Suggest a price for my product', 'How do I get more sales?', 'What\'s trending on VendorVerse?']
    };
    const chips = chipSets[ctx] || chipSets['homepage / marketplace'];

    panel.innerHTML = `
        <div class="aic-header">
            <div class="aic-header-left">
                <div class="aic-header-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M12 2C6.48 2 2 6.03 2 10.93c0 2.84 1.47 5.36 3.78 7.01L4.5 21.5l4.08-2.04c1.08.33 2.22.51 3.42.51 5.52 0 10-4.03 10-8.97S17.52 2 12 2z"/>
                        <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none"/>
                        <circle cx="12" cy="11" r="1" fill="currentColor" stroke="none"/>
                        <circle cx="16" cy="11" r="1" fill="currentColor" stroke="none"/>
                    </svg>
                </div>
                <div class="aic-header-info">
                    <div class="aic-header-title">VendorVerse AI</div>
                    <div class="aic-header-sub">
                        <span class="aic-online-dot"></span>
                        Powered by Gemini AI
                    </div>
                </div>
            </div>
            <button class="aic-header-close" id="aic-close" aria-label="Close chat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
        <div class="aic-messages" id="aic-messages"></div>
        <div class="aic-chips" id="aic-chips">
            ${chips.map(c => `<button class="aic-chip" data-aic-chip="${c}">${c}</button>`).join('')}
        </div>
        <div class="aic-input-wrap">
            <input class="aic-input" id="aic-input" type="text" placeholder="Ask VendorVerse AI anything..." autocomplete="off" maxlength="2000">
            <button class="aic-send" id="aic-send" aria-label="Send message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
        </div>
    `;
    document.body.appendChild(panel);

    // Load saved messages
    try {
        const saved = JSON.parse(localStorage.getItem(AIC_HISTORY_KEY) || '{}');
        aicMessages = saved.messages || [];
        aicConversation = saved.conversation || [];
    } catch {
        aicMessages = [];
        aicConversation = [];
    }

    // Welcome message if empty
    if (!aicMessages.length) {
        const welcomes = {
            'vendor-dashboard': 'Hey there! 👋 I\'m your AI copilot — I can help you write product descriptions, suggest pricing, find the best creators for your products, and optimize your store. What would you like to work on?',
            'creator-studio': 'Welcome! 🎨 I can help you plan drops, craft announcements, grow your audience, and maximize your creator earnings. What shall we start with?',
            'drop-room': 'Welcome to the Drop Room! 🎥 I can help you make the most of this live shopping experience. Need any tips?',
            'cart': 'Looking at your cart! 🛒 I can help you compare products, find better deals, or answer questions about any items. How can I help?',
            'homepage / marketplace': 'Hi! 👋 I\'m VendorVerse AI — your smart shopping and seller assistant. I can help with product descriptions, pricing, finding deals, or anything else about the platform. What can I do for you?'
        };
        const welcome = welcomes[ctx] || welcomes['homepage / marketplace'];
        aicMessages.push({ role: 'ai', text: welcome, time: new Date().toISOString() });
        aicConversation.push({ role: 'assistant', content: welcome });
        aicSaveHistory();
    }

    aicRenderMessages();

    // Event listeners
    bubble.addEventListener('click', aicToggle);
    document.getElementById('aic-close').addEventListener('click', () => {
        if (aicOpen) aicToggle();
    });
    document.getElementById('aic-send').addEventListener('click', aicSend);
    document.getElementById('aic-input').addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            aicSend();
        }
    });

    // Quick chips
    panel.querySelectorAll('[data-aic-chip]').forEach(chip => {
        chip.addEventListener('click', () => {
            if (aicIsLoading) return;
            document.getElementById('aic-input').value = chip.dataset.aicChip;
            aicSend();
        });
    });
}

/* ═══ TOGGLE PANEL ═══ */
function aicToggle() {
    aicOpen = !aicOpen;
    const panel = document.getElementById('aic-panel');
    const bubble = document.getElementById('aic-bubble');

    if (panel) panel.classList.toggle('visible', aicOpen);
    if (bubble) bubble.classList.toggle('open', aicOpen);

    if (aicOpen) {
        setTimeout(() => document.getElementById('aic-input')?.focus(), 300);
        // Remove pulse after first interaction
        const pulse = bubble?.querySelector('.aic-bubble-pulse');
        if (pulse) pulse.remove();
        // Hide chips if conversation already has user messages
        if (aicMessages.some(m => m.role === 'user')) {
            const chipsEl = document.getElementById('aic-chips');
            if (chipsEl) chipsEl.style.display = 'none';
        }
    }
}

/* ═══ SEND MESSAGE ═══ */
async function aicSend() {
    if (aicIsLoading) return;

    const input = document.getElementById('aic-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    // Hide chips after first message
    const chipsEl = document.getElementById('aic-chips');
    if (chipsEl) chipsEl.style.display = 'none';

    // Disable input during loading
    aicIsLoading = true;
    input.disabled = true;
    document.getElementById('aic-send').disabled = true;

    // Add user message
    aicMessages.push({ role: 'user', text, time: new Date().toISOString() });
    aicRenderMessages();
    aicSaveHistory();

    // Show typing indicator
    aicShowTyping();

    // Call Gemini API
    const response = await aicCallClaude(text);

    // Hide typing, add response
    aicHideTyping();
    aicMessages.push({ role: 'ai', text: response.text, time: new Date().toISOString() });
    aicRenderMessages();
    aicSaveHistory();

    // Re-enable input after 3s cooldown
    aicIsLoading = false;
    input.disabled = false;

    const sendBtn = document.getElementById('aic-send');
    let cooldown = 3;
    sendBtn.disabled = true;
    sendBtn.innerHTML = `<span class="aic-cooldown">${cooldown}</span>`;
    const cooldownInterval = setInterval(() => {
        cooldown--;
        if (cooldown <= 0) {
            clearInterval(cooldownInterval);
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
        } else {
            sendBtn.innerHTML = `<span class="aic-cooldown">${cooldown}</span>`;
        }
    }, 1000);
    input.focus();
}

/* ═══ RENDER MESSAGES ═══ */
function aicRenderMessages() {
    const container = document.getElementById('aic-messages');
    if (!container) return;

    container.innerHTML = aicMessages.map(msg => {
        const isUser = msg.role === 'user';
        const timeStr = new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `
        <div class="aic-msg ${isUser ? 'user' : 'ai'}">
            ${!isUser ? '<div class="aic-msg-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C6.48 2 2 6.03 2 10.93c0 2.84 1.47 5.36 3.78 7.01L4.5 21.5l4.08-2.04c1.08.33 2.22.51 3.42.51 5.52 0 10-4.03 10-8.97S17.52 2 12 2z"/><circle cx="8" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="11" r="1" fill="currentColor" stroke="none"/></svg></div>' : ''}
            <div class="aic-msg-content">
                <div class="aic-msg-bubble">${isUser ? aicEscapeHtml(msg.text) : aicParseMarkdown(msg.text)}</div>
                <div class="aic-msg-time">${timeStr}</div>
            </div>
        </div>`;
    }).join('');

    // Scroll to bottom
    requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
}

/* ═══ HTML ESCAPE (user input only) ═══ */
function aicEscapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/* ═══ TYPING INDICATOR ═══ */
function aicShowTyping() {
    const container = document.getElementById('aic-messages');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'aic-msg ai';
    el.id = 'aic-typing';
    el.innerHTML = `
        <div class="aic-msg-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C6.48 2 2 6.03 2 10.93c0 2.84 1.47 5.36 3.78 7.01L4.5 21.5l4.08-2.04c1.08.33 2.22.51 3.42.51 5.52 0 10-4.03 10-8.97S17.52 2 12 2z"/><circle cx="8" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="11" r="1" fill="currentColor" stroke="none"/></svg>
        </div>
        <div class="aic-msg-content">
            <div class="aic-typing">
                <span class="aic-typing-dot"></span>
                <span class="aic-typing-dot"></span>
                <span class="aic-typing-dot"></span>
            </div>
        </div>`;
    container.appendChild(el);
    requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
}

function aicHideTyping() {
    document.getElementById('aic-typing')?.remove();
}

/* ═══ SAVE / LOAD HISTORY ═══ */
function aicSaveHistory() {
    if (aicMessages.length > AIC_MAX_HISTORY) aicMessages = aicMessages.slice(-AIC_MAX_HISTORY);
    if (aicConversation.length > AIC_MAX_HISTORY) aicConversation = aicConversation.slice(-AIC_MAX_HISTORY);

    localStorage.setItem(AIC_HISTORY_KEY, JSON.stringify({
        messages: aicMessages,
        conversation: aicConversation
    }));
}

/* ═══ BOOT ═══ */
document.addEventListener('DOMContentLoaded', aicInit);
