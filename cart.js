/**
 * VendorVerse - Cart & Checkout Module
 * Manages shopping cart in localStorage and checkout flow
 */

// 
// Dynamic Loader for shared toast styles and script
// 
(function () {
    if (!document.getElementById('vv-toast-styles')) {
        const link = document.createElement('link');
        link.id = 'vv-toast-styles';
        link.rel = 'stylesheet';
        link.href = 'toast.css';
        document.head.appendChild(link);
    }
    if (!window.showVVToast) {
        window.showVVToast = function (message, icon) {
            window.showVVToast.q = window.showVVToast.q || [];
            window.showVVToast.q.push({ message: message, icon: icon });
        };
        const script = document.createElement('script');
        script.src = 'toast.js';
        script.async = true;
        document.head.appendChild(script);
    }
})();

// 
// Configuration
// 

const CART_KEY = 'vendorverse_cart';
const API_BASE = 'https://vendorverse-ekf8.onrender.com';
const TOKEN_KEY = 'vendorverse_token';

// Escape text before injecting into innerHTML (cart items come from localStorage)
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// 
// Cart Management (localStorage)
//

/**
 * Get cart from localStorage
 */
function getCart() {
    const cartStr = localStorage.getItem(CART_KEY);
    if (cartStr) {
        try {
            return JSON.parse(cartStr);
        } catch (e) {
            return [];
        }
    }
    return [];
}

/**
 * Save cart to localStorage
 */
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
}

/**
 * Add item to cart
 */
function addToCart(product) {
    const cart = getCart();

    // Check if item already exists
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
        // Increase quantity
        cart[existingIndex].quantity += 1;
    } else {
        // Add new item
        cart.push({
            id: product.id || 'prod_' + Date.now(),
            productId: product.productId || product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart(cart);
    showVVToast('Added to cart', '🛒');
    return cart;
}

/**
 * Remove item from cart
 */
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    return cart;
}

/**
 * Update item quantity
 */
function updateCartQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
        if (quantity <= 0) {
            return removeFromCart(productId);
        }
        item.quantity = quantity;
        saveCart(cart);
    }
    return cart;
}

/**
 * Clear entire cart
 */
function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
}

/**
 * Get cart total
 */
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Get cart item count
 */
function getCartCount() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Update cart badge in header
 */
function updateCartBadge() {
    const count = getCartCount();
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    });
}


// 
// Checkout Modal
//

/**
 * Open checkout modal
 */
function openCheckout() {
    const cart = getCart();

    if (cart.length === 0) {
        showToastNotification('Your cart is empty! Add items first.');
        return;
    }

    // Check if logged in
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        showToastNotification('Please login to checkout');
        if (typeof openAuthModal === 'function') {
            openAuthModal('login');
        }
        return;
    }

    const modal = document.getElementById('checkout-modal-overlay');
    if (modal) {
        renderCheckoutItems();
        updateCheckoutTotals();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Close checkout modal
 */
function closeCheckout() {
    const modal = document.getElementById('checkout-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        clearCheckoutMessage();
    }
}

/**
 * Render cart items in checkout
 */
function renderCheckoutItems() {
    const container = document.getElementById('checkout-items');
    const cart = getCart();

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <div class="checkout-item-image">
                <img src="${escapeHtml(item.image) || 'https://via.placeholder.com/60'}" alt="${escapeHtml(item.title)}">
            </div>
            <div class="checkout-item-details">
                <h4>${escapeHtml(item.title)}</h4>
                <p class="checkout-item-qty">Qty: ${escapeHtml(item.quantity)}</p>
            </div>
            <div class="checkout-item-price">
                ₹${(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN')}
            </div>
        </div>
    `).join('');
}

/**
 * Update checkout totals
 */
function updateCheckoutTotals() {
    const cart = getCart();
    const subtotal = getCartTotal();
    const shipping = subtotal > 499 ? 0 : 40;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + shipping + tax;

    const subtotalEl = document.getElementById('checkout-subtotal');
    const shippingEl = document.getElementById('checkout-shipping');
    const taxEl = document.getElementById('checkout-tax');
    const totalEl = document.getElementById('checkout-total');

    if (subtotalEl) subtotalEl.textContent = '₹' + subtotal.toLocaleString('en-IN');
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : '₹' + shipping;
    if (taxEl) taxEl.textContent = '₹' + tax.toLocaleString('en-IN');
    if (totalEl) totalEl.textContent = '₹' + total.toLocaleString('en-IN');
}


// 
// Place Order
// 

/**
 * Place order - send to backend
 */
async function placeOrder() {
    const btn = document.getElementById('place-order-btn');
    const messageEl = document.getElementById('checkout-message');

    // Validate cart
    const cart = getCart();
    if (cart.length === 0) {
        showCheckoutMessage('Your cart is empty!', 'error');
        return;
    }

    // Get shipping form data
    const form = document.getElementById('shipping-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const shippingAddress = {
        fullName: document.getElementById('ship-fullname').value.trim(),
        phone: document.getElementById('ship-phone').value.trim(),
        addressLine1: document.getElementById('ship-address1').value.trim(),
        addressLine2: document.getElementById('ship-address2').value.trim(),
        city: document.getElementById('ship-city').value.trim(),
        state: document.getElementById('ship-state').value.trim(),
        pincode: document.getElementById('ship-pincode').value.trim(),
        country: 'India'
    };

    // Get payment method
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cod';

    // Prepare items
    const items = cart.map(item => ({
        productId: item.productId || item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image
    }));

    // Get token
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        showCheckoutMessage('Please login to place order', 'error');
        return;
    }

    // Show loading
    setCheckoutButtonLoading(true);
    clearCheckoutMessage();

    try {
        const response = await fetch(API_BASE + '/api/orders/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                items: items,
                shippingAddress: shippingAddress,
                paymentMethod: paymentMethod,
                totalAmount: getCartTotal()
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Success!
            showCheckoutMessage('🎉 Order placed successfully! Order #' + data.data.orderNumber, 'success');

            // Clear cart
            clearCart();

            // Close checkout and open orders after delay
            setTimeout(function () {
                closeCheckout();
                if (typeof openDashboard === 'function') {
                    openDashboard('orders');
                }
                showVVToast('Order placed successfully', '🎉');
            }, 2000);
        } else {
            showCheckoutMessage(data.message || 'Failed to place order. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Place order error:', error);
        showCheckoutMessage('Cannot connect to server. Please try again.', 'error');
    } finally {
        setCheckoutButtonLoading(false);
    }
}

/**
 * Show message in checkout
 */
function showCheckoutMessage(message, type) {
    const el = document.getElementById('checkout-message');
    if (el) {
        el.textContent = message;
        el.className = 'checkout-message show ' + type;
    }
}

/**
 * Clear checkout message
 */
function clearCheckoutMessage() {
    const el = document.getElementById('checkout-message');
    if (el) {
        el.className = 'checkout-message';
        el.textContent = '';
    }
}

/**
 * Set checkout button loading state
 */
function setCheckoutButtonLoading(isLoading) {
    const btn = document.getElementById('place-order-btn');
    if (!btn) return;

    const span = btn.querySelector('span');
    const loader = btn.querySelector('.btn-loader');

    btn.disabled = isLoading;
    if (span) span.style.display = isLoading ? 'none' : 'inline';
    if (loader) loader.style.display = isLoading ? 'block' : 'none';
}


// 
// Initialize & Event Listeners
// 

document.addEventListener('DOMContentLoaded', function () {
    // Update cart badge on load
    updateCartBadge();

    // Setup checkout modal close on overlay click
    const overlay = document.getElementById('checkout-modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                closeCheckout();
            }
        });
    }

    // Close on Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeCheckout();
        }
    });

    // Payment option selection
    const paymentOptions = document.querySelectorAll('.payment-option:not(.disabled)');
    paymentOptions.forEach(option => {
        option.addEventListener('click', function () {
            paymentOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            this.querySelector('input').checked = true;
        });
    });

    // Make product cards clickable - Navigate to product page
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        // Make card clickable (excluding buttons)
        card.style.cursor = 'pointer';
        card.addEventListener('click', function (e) {
            // Don't navigate if clicking on a button
            if (e.target.closest('.add-to-cart-btn') || e.target.closest('.wishlist-btn')) {
                return;
            }

            // Extract product data
            const title = card.querySelector('.product-title')?.textContent || 'Product';
            const brand = card.querySelector('.product-brand')?.textContent || 'VendorVerse';
            const priceText = card.querySelector('.current-price')?.textContent || '₹999';
            const originalText = card.querySelector('.original-price')?.textContent || '₹1499';
            const discount = card.querySelector('.discount')?.textContent || '33% off';
            const image = card.querySelector('.product-image')?.src || '';
            const ratingCount = card.querySelector('.rating-count')?.textContent?.replace(/[()]/g, '') || '500';

            const price = parseInt(priceText.replace(/[₹,]/g, '')) || 999;
            const originalPrice = parseInt(originalText.replace(/[₹,]/g, '')) || 1499;

            // Navigate to product detail page
            window.location.href = 'product-detail.html?name=' + encodeURIComponent(title) + '&price=' + price + '&image=' + encodeURIComponent(image) + '&vendor=' + encodeURIComponent(brand);
        });
    });

    // Make Add to Cart buttons work (prevent card navigation)
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation(); // Prevent card click
            const card = this.closest('.product-card');
            if (card) {
                const title = card.querySelector('.product-title')?.textContent || 'Product';
                const priceText = card.querySelector('.current-price')?.textContent || '₹0';
                const price = parseInt(priceText.replace(/[₹,]/g, '')) || 0;
                const image = card.querySelector('.product-image')?.src || '';

                addToCart({
                    id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                    title: title,
                    price: price,
                    image: image
                });
            }
        });
    });

    // Wishlist button prevent propagation
    const wishlistBtns = document.querySelectorAll('.wishlist-btn');
    wishlistBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('active');
            showVVToast('Added to wishlist', '❤️');
        });
    });
});


// Expose Functions Globally // 
// 

window.getCart = getCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.clearCart = clearCart;
window.getCartTotal = getCartTotal;
window.getCartCount = getCartCount;
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.placeOrder = placeOrder;
window.showToastNotification = showToastNotification;

// Toast notification function — delegates to the shared toast system.
// Kept for backward compatibility with auth.js and other callers.
function showToastNotification(message) {
    if (typeof showVVToast === 'function') {
        showVVToast(message);
    }
}
