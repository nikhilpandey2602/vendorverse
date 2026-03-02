/**
 * VendorVerse - Authentication Module
 * Production-ready frontend auth with API integration
 * 
 * IMPORTANT: Serve this frontend via a local server (npx serve)
 * Do NOT open via file:// protocol
 */

// ==============================================
// API Configuration
// ==============================================

// Backend API base URL - Change if your backend runs on a different port
const API_BASE = "http://localhost:5000";

// LocalStorage keys for auth data
const TOKEN_KEY = 'vendorverse_token';
const USER_KEY = 'vendorverse_user';


// ==============================================
// Initialize on Page Load
// ==============================================

document.addEventListener('DOMContentLoaded', function () {
    // Check if user is already logged in
    checkAuthState();

    // Setup dropdown menu toggle
    setupUserMenuDropdown();

    // Close modal when clicking outside
    const overlay = document.getElementById('auth-modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                closeAuthModal();
            }
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeAuthModal();
        }
    });
});


// ==============================================
// Auth State Management
// ==============================================

/**
 * Check if user is logged in and update UI
 */
function checkAuthState() {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);

    if (token && userStr) {
        try {
            const user = JSON.parse(userStr);
            showLoggedInState(user);
        } catch (e) {
            // Invalid data, clear storage
            clearAuthData();
            showLoggedOutState();
        }
    } else {
        showLoggedOutState();
    }
}

/**
 * Update UI to show logged in state
 */
function showLoggedInState(user) {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userNameDisplay = document.getElementById('user-name-display');
    const mobileGreeting = document.getElementById('mobile-greeting');
    const mobileAuthLink = document.getElementById('mobile-auth-link');
    const mobileNavUser = document.getElementById('mobile-nav-user');

    // Header
    if (authButtons) authButtons.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
    if (userNameDisplay) userNameDisplay.textContent = user.firstName || 'User';

    // Mobile nav
    if (mobileGreeting) mobileGreeting.textContent = 'Hello, ' + user.firstName;
    if (mobileAuthLink) {
        mobileAuthLink.textContent = 'Logout';
        mobileAuthLink.onclick = function () {
            handleLogout();
            closeMobileNav();
        };
    }
    if (mobileNavUser) mobileNavUser.classList.add('logged-in');
}

/**
 * Update UI to show logged out state
 */
function showLoggedOutState() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const mobileGreeting = document.getElementById('mobile-greeting');
    const mobileAuthLink = document.getElementById('mobile-auth-link');
    const mobileNavUser = document.getElementById('mobile-nav-user');

    // Header
    if (authButtons) authButtons.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';

    // Mobile nav
    if (mobileGreeting) mobileGreeting.textContent = 'Hello, Guest';
    if (mobileAuthLink) {
        mobileAuthLink.textContent = 'Login / Register';
        mobileAuthLink.onclick = function () {
            openAuthModal('login');
            closeMobileNav();
        };
    }
    if (mobileNavUser) mobileNavUser.classList.remove('logged-in');
}

/**
 * Clear auth data from localStorage
 */
function clearAuthData() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}


// ==============================================
// Modal Functions
// ==============================================

/**
 * Open auth modal
 */
function openAuthModal(tab) {
    tab = tab || 'login';
    const modal = document.getElementById('auth-modal-overlay');

    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        switchAuthTab(tab);

        // Focus first input after animation
        setTimeout(function () {
            const form = document.getElementById(tab + '-form');
            if (form) {
                const input = form.querySelector('input');
                if (input) input.focus();
            }
        }, 300);
    }
}

/**
 * Close auth modal
 */
function closeAuthModal() {
    const modal = document.getElementById('auth-modal-overlay');

    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        clearFormMessages();

        // Reset forms
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        if (loginForm) loginForm.reset();
        if (registerForm) registerForm.reset();
    }
}

/**
 * Switch between login and register tabs
 */
function switchAuthTab(tab) {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const modalTitle = document.getElementById('auth-modal-title');

    clearFormMessages();

    if (tab === 'login') {
        if (loginTab) loginTab.classList.add('active');
        if (registerTab) registerTab.classList.remove('active');
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
        if (modalTitle) modalTitle.textContent = 'Welcome Back!';
    } else {
        if (loginTab) loginTab.classList.remove('active');
        if (registerTab) registerTab.classList.add('active');
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
        if (modalTitle) modalTitle.textContent = 'Create Account';
    }
}

/**
 * Clear all form error/success messages
 */
function clearFormMessages() {
    const messages = document.querySelectorAll('.form-message');
    messages.forEach(function (msg) {
        msg.classList.remove('show', 'success', 'error');
        msg.textContent = '';
    });
}


// ==============================================
// Login Handler
// ==============================================

/**
 * Handle login form submission
 */
async function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = document.getElementById('login-submit-btn');
    const messageEl = document.getElementById('login-message');

    // Get form values
    const email = form.email.value.trim();
    const password = form.password.value;

    // Validate
    if (!email || !password) {
        showMessage(messageEl, 'Please fill in all fields', 'error');
        return;
    }

    // Show loading
    setButtonLoading(submitBtn, true);

    try {
        // Make API request
        const response = await fetch(API_BASE + '/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        });

        // Parse response
        const data = await response.json();

        if (response.ok && data.success) {
            // SUCCESS: Save token and user data
            localStorage.setItem(TOKEN_KEY, data.data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.data));

            // Show success message
            showMessage(messageEl, 'Login successful! Redirecting...', 'success');

            // Update UI and close modal
            setTimeout(function () {
                closeAuthModal();
                showLoggedInState(data.data);
                showToastNotification('Welcome back, ' + data.data.firstName + '! 👋');
            }, 1000);

        } else {
            // ERROR: Show error message
            showMessage(messageEl, data.message || 'Invalid email or password', 'error');
        }

    } catch (error) {
        // NETWORK ERROR
        console.error('Login error:', error);
        showMessage(messageEl, 'Cannot connect to server. Make sure backend is running on port 5000.', 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}


// ==============================================
// Register Handler
// ==============================================

/**
 * Handle register form submission
 */
async function handleRegister(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = document.getElementById('register-submit-btn');
    const messageEl = document.getElementById('register-message');

    // Get form values
    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;

    // Validate
    if (!firstName || !lastName || !email || !password) {
        showMessage(messageEl, 'Please fill in all fields', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage(messageEl, 'Password must be at least 6 characters', 'error');
        return;
    }

    // Show loading
    setButtonLoading(submitBtn, true);

    try {
        // Make API request
        const response = await fetch(API_BASE + '/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password
            })
        });

        // Parse response
        const data = await response.json();

        if (response.ok && data.success) {
            // SUCCESS: Save token and user data
            localStorage.setItem(TOKEN_KEY, data.data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.data));

            // Show success message
            showMessage(messageEl, 'Account created! Redirecting...', 'success');

            // Update UI and close modal
            setTimeout(function () {
                closeAuthModal();
                showLoggedInState(data.data);
                showToastNotification('Welcome to VendorVerse, ' + data.data.firstName + '! 🎉');
            }, 1000);

        } else {
            // ERROR: Show error message
            showMessage(messageEl, data.message || 'Registration failed. Please try again.', 'error');
        }

    } catch (error) {
        // NETWORK ERROR
        console.error('Register error:', error);
        showMessage(messageEl, 'Cannot connect to server. Make sure backend is running on port 5000.', 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}


// ==============================================
// Logout Handler
// ==============================================

/**
 * Handle logout
 */
function handleLogout() {
    // Clear stored data
    clearAuthData();

    // Update UI
    showLoggedOutState();

    // Close dropdown
    const userMenu = document.getElementById('user-menu');
    if (userMenu) userMenu.classList.remove('open');

    // Show notification
    showToastNotification('You have been logged out 👋');
}


// ==============================================
// UI Helper Functions
// ==============================================

/**
 * Show message in form
 */
function showMessage(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.classList.remove('success', 'error');
    element.classList.add('show', type);
}

/**
 * Set button loading state
 */
function setButtonLoading(button, isLoading) {
    if (!button) return;

    const span = button.querySelector('span');
    const loader = button.querySelector('.btn-loader');

    button.disabled = isLoading;

    if (span) span.style.display = isLoading ? 'none' : 'inline';
    if (loader) loader.style.display = isLoading ? 'block' : 'none';
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}

/**
 * Setup user dropdown menu
 */
function setupUserMenuDropdown() {
    const trigger = document.getElementById('user-menu-trigger');
    const menu = document.getElementById('user-menu');

    if (trigger && menu) {
        trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            menu.classList.toggle('open');
        });

        document.addEventListener('click', function (e) {
            if (!menu.contains(e.target)) {
                menu.classList.remove('open');
            }
        });
    }
}

/**
 * Close mobile navigation
 */
function closeMobileNav() {
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav) {
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Show toast notification
 */
function showToastNotification(message) {
    // Remove existing toast
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText =
        'position: fixed;' +
        'bottom: 80px;' +
        'left: 50%;' +
        'transform: translateX(-50%) translateY(100px);' +
        'background: #1F2937;' +
        'color: white;' +
        'padding: 12px 24px;' +
        'border-radius: 50px;' +
        'font-size: 14px;' +
        'font-weight: 500;' +
        'box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);' +
        'z-index: 9999;' +
        'opacity: 0;' +
        'transition: all 0.3s ease;';

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(function () {
        toast.style.transform = 'translateX(-50%) translateY(0)';
        toast.style.opacity = '1';
    });

    // Animate out after delay
    setTimeout(function () {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(function () {
            toast.remove();
        }, 300);
    }, 3000);
}


// ==============================================
// Dashboard Functions
// ==============================================

/**
 * Open dashboard modal
 * @param {string} tab - 'account' or 'orders'
 */
function openDashboard(tab) {
    tab = tab || 'account';
    const modal = document.getElementById('dashboard-modal-overlay');

    // Close user dropdown
    const userMenu = document.getElementById('user-menu');
    if (userMenu) userMenu.classList.remove('open');

    if (modal) {
        // Update user info from localStorage
        updateDashboardUserInfo();

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        switchDashboardTab(tab);
    }
}

/**
 * Close dashboard modal
 */
function closeDashboard() {
    const modal = document.getElementById('dashboard-modal-overlay');

    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Switch dashboard tabs
 * @param {string} tab - 'account' or 'orders'
 */
function switchDashboardTab(tab) {
    const accountTab = document.getElementById('tab-account');
    const ordersTab = document.getElementById('tab-orders');
    const accountSection = document.getElementById('section-account');
    const ordersSection = document.getElementById('section-orders');

    if (tab === 'account') {
        if (accountTab) accountTab.classList.add('active');
        if (ordersTab) ordersTab.classList.remove('active');
        if (accountSection) accountSection.style.display = 'block';
        if (ordersSection) ordersSection.style.display = 'none';
    } else if (tab === 'orders') {
        if (accountTab) accountTab.classList.remove('active');
        if (ordersTab) ordersTab.classList.add('active');
        if (accountSection) accountSection.style.display = 'none';
        if (ordersSection) ordersSection.style.display = 'block';
        // Fetch orders when tab is opened
        fetchOrders();
    }
}

/**
 * Update dashboard with user info from localStorage
 */
function updateDashboardUserInfo() {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return;

    try {
        const user = JSON.parse(userStr);

        // Header
        const userName = document.getElementById('dashboard-user-name');
        const userEmail = document.getElementById('dashboard-user-email');
        if (userName) userName.textContent = (user.firstName || '') + ' ' + (user.lastName || '');
        if (userEmail) userEmail.textContent = user.email || '';

        // Account section
        const firstname = document.getElementById('account-firstname');
        const lastname = document.getElementById('account-lastname');
        const email = document.getElementById('account-email');
        const role = document.getElementById('account-role');

        if (firstname) firstname.textContent = user.firstName || '-';
        if (lastname) lastname.textContent = user.lastName || '-';
        if (email) email.textContent = user.email || '-';
        if (role) role.textContent = (user.role || 'user').charAt(0).toUpperCase() + (user.role || 'user').slice(1);
    } catch (e) {
        console.error('Error updating dashboard user info:', e);
    }
}

/**
 * Fetch user orders from API
 */
async function fetchOrders() {
    const loadingEl = document.getElementById('orders-loading');
    const listEl = document.getElementById('orders-list');
    const noOrdersEl = document.getElementById('no-orders');
    const errorEl = document.getElementById('orders-error');

    // Show loading, hide others
    if (loadingEl) loadingEl.style.display = 'flex';
    if (listEl) listEl.style.display = 'none';
    if (noOrdersEl) noOrdersEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';

    // Get token
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
            errorEl.innerHTML = '<p>Please login to view orders.</p>';
            errorEl.style.display = 'flex';
        }
        return;
    }

    try {
        const response = await fetch(API_BASE + '/api/orders/my', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json'
            }
        });

        const data = await response.json();

        if (loadingEl) loadingEl.style.display = 'none';

        if (response.ok && data.success) {
            if (data.data && data.data.length > 0) {
                // Show orders
                if (listEl) {
                    listEl.innerHTML = renderOrders(data.data);
                    listEl.style.display = 'block';
                }
            } else {
                // No orders
                if (noOrdersEl) noOrdersEl.style.display = 'flex';
            }
        } else {
            // API error
            if (errorEl) {
                errorEl.innerHTML = '<p>' + (data.message || 'Unable to load orders.') + '</p><button onclick="fetchOrders()">Retry</button>';
                errorEl.style.display = 'flex';
            }
        }
    } catch (error) {
        console.error('Fetch orders error:', error);
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
            errorEl.innerHTML = '<p>Cannot connect to server. Please try again.</p><button onclick="fetchOrders()">Retry</button>';
            errorEl.style.display = 'flex';
        }
    }
}

/**
 * Render orders list HTML
 * @param {Array} orders - Array of order objects
 * @returns {string} HTML string
 */
function renderOrders(orders) {
    return orders.map(function (order) {
        const date = new Date(order.createdAt);
        const formattedDate = date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        const statusClass = getStatusClass(order.status);
        const total = order.pricing ? order.pricing.total : 0;
        const itemCount = order.items ? order.items.length : 0;

        return `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-id">
                        <span class="label">Order ID</span>
                        <span class="value">#${order.orderNumber || order._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div class="order-status ${statusClass}">
                        ${formatStatus(order.status)}
                    </div>
                </div>
                <div class="order-details">
                    <div class="order-info">
                        <span class="order-date">📅 ${formattedDate}</span>
                        <span class="order-items">📦 ${itemCount} item${itemCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="order-total">
                        ₹${total.toLocaleString('en-IN')}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Get CSS class for order status
 */
function getStatusClass(status) {
    const statusMap = {
        'pending': 'status-pending',
        'confirmed': 'status-confirmed',
        'processing': 'status-processing',
        'shipped': 'status-shipped',
        'delivered': 'status-delivered',
        'cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-pending';
}

/**
 * Format status for display
 */
function formatStatus(status) {
    const statusMap = {
        'pending': '⏳ Pending',
        'confirmed': '✓ Confirmed',
        'processing': '⚙️ Processing',
        'shipped': '🚚 Shipped',
        'delivered': '✅ Delivered',
        'cancelled': '❌ Cancelled'
    };
    return statusMap[status] || status;
}


// ==============================================
// Expose Functions Globally (for onclick handlers)
// ==============================================

window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.togglePasswordVisibility = togglePasswordVisibility;
window.closeMobileNav = closeMobileNav;
window.openDashboard = openDashboard;
window.closeDashboard = closeDashboard;
window.switchDashboardTab = switchDashboardTab;
window.fetchOrders = fetchOrders;
