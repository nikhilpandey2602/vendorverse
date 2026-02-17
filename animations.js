/**
 * VendorVerse - Global Animations & UI Enhancements
 * Premium micro-interactions and visual feedback
 */

// ===== PAGE LOAD ANIMATION =====
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.animation = 'fadeIn 300ms ease';

    // Animate main content
    const mainContent = document.querySelector('main, .cart-page, .orders-page, .product-page');
    if (mainContent) {
        mainContent.style.animation = 'fadeInUp 400ms ease';
    }
});

// ===== TOAST NOTIFICATION SYSTEM =====
window.showToast = function (message, type = 'info') {
    // Remove existing toast
    const existing = document.querySelector('.premium-toast');
    if (existing) existing.remove();

    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = 'premium-toast';

    const icon = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    }[type] || 'ℹ';

    const colors = {
        success: '#10B981',
        error: '#EF4444',
        info: '#6366f1',
        warning: '#F59E0B'
    };

    toast.innerHTML = `
        <div style="
            display: flex;
            align-items: center;
            gap: 12px;
            background: white;
            padding: 14px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
            font-size: 14px;
            font-weight: 500;
            color: #1F2937;
            min-width: 200px;
            max-width: 400px;
            pointer-events: auto;
            border-left: 3px solid ${colors[type]};
        ">
            <span style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: ${colors[type]}20;
                color: ${colors[type]};
                font-weight: 700;
                flex-shrink: 0;
            ">${icon}</span>
            <span>${message}</span>
        </div>
    `;

    toast.style.animation = 'toastSlideIn 250ms cubic-bezier(0.4, 0, 0.2, 1)';
    container.appendChild(toast);

    // Auto dismiss
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 200ms cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => toast.remove(), 200);
    }, 3000);
};

// ===== BUTTON PRESS ANIMATION =====
document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, .btn, .auth-btn, .add-to-cart-btn');
    if (btn && !btn.disabled) {
        btn.style.animation = 'scalePress 200ms ease';
        setTimeout(() => {
            btn.style.animation = '';
        }, 200);
    }
}, true);

// ===== CART ITEM SLIDE-IN ANIMATION =====
window.animateCartItems = function () {
    const items = document.querySelectorAll('.cart-item');
    items.forEach((item, index) => {
        if (!item.dataset.animated) {
            item.style.opacity = '0';
            item.style.animation = `slideInRight 300ms ease forwards ${index * 50}ms`;
            item.dataset.animated = 'true';
        }
    });
};

// ===== ADD LOADING STATE TO BUTTONS =====
window.setButtonLoading = function (button, loading) {
    if (loading) {
        button.dataset.originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `
            <span style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 0.8s linear infinite;">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
                </svg>
                Processing...
            </span>
        `;
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || button.innerHTML;
    }
};

// Add spin animation
if (!document.getElementById('spinner-styles')) {
    const style = document.createElement('style');
    style.id = 'spinner-styles';
    style.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// ===== SKELETON LOADING =====
window.createSkeleton = function (container, count = 4) {
    const skeletonHTML = Array(count).fill(0).map(() => `
        <div class="skeleton-card" style="
            flex: 0 0 160px;
            background: #f5f5f5;
            border-radius: 12px;
            overflow: hidden;
            height: 280px;
            position: relative;
        ">
            <div style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
                animation: shimmer 1.5s infinite;
            "></div>
        </div>
    `).join('');

    if (container) {
        container.innerHTML = skeletonHTML;
    }
};

window.removeSkeleton = function (container) {
    if (container) {
        const skeletons = container.querySelectorAll('.skeleton-card');
        skeletons.forEach(s => s.remove());
    }
};

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});

console.log('%c✨ VendorVerse Premium UI Loaded', 'color: #6366f1; font-weight: bold; font-size: 12px;');
