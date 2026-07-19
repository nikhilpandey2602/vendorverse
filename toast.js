/**
 * VendorVerse — Shared Toast Notification System
 * Lightweight, theme-aware, no dependencies.
 *
 * Usage:
 *   showVVToast('Added to cart', '🛒');
 *   showVVToast('Order placed successfully', '🎉');
 */
(function () {
  'use strict';

  var TOAST_DURATION = 2800;    // ms before auto-dismiss
  var EXIT_DURATION  = 300;     // ms for exit animation

  /**
   * Ensure the toast container exists in the DOM.
   */
  function ensureContainer() {
    var container = document.getElementById('vv-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'vv-toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Show a toast notification.
   * @param {string} message - Text to display.
   * @param {string} [icon]  - Optional emoji / text icon.
   */
  function showVVToast(message, icon) {
    var container = ensureContainer();

    // Build the toast element
    var toast = document.createElement('div');
    toast.className = 'vv-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    // Icon
    if (icon) {
      var iconEl = document.createElement('span');
      iconEl.className = 'vv-toast-icon';
      iconEl.textContent = icon;
      toast.appendChild(iconEl);
    }

    // Message
    var msgEl = document.createElement('span');
    msgEl.className = 'vv-toast-msg';
    msgEl.textContent = message;
    toast.appendChild(msgEl);

    // Progress bar
    var progress = document.createElement('div');
    progress.className = 'vv-toast-progress';
    toast.appendChild(progress);

    // Append to container
    container.appendChild(toast);

    // Auto-dismiss
    var timer = setTimeout(function () {
      dismissToast(toast);
    }, TOAST_DURATION);

    // Allow click to dismiss early
    toast.addEventListener('click', function () {
      clearTimeout(timer);
      dismissToast(toast);
    });
  }

  /**
   * Dismiss a toast with exit animation.
   */
  function dismissToast(toast) {
    if (toast.classList.contains('vv-toast-exit')) return; // already exiting
    toast.classList.add('vv-toast-exit');
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, EXIT_DURATION);
  }

  // ── Expose globally & process queue ──
  var oldShow = window.showVVToast;
  window.showVVToast = showVVToast;
  
  // Backward compatibility wrapper for showToast(msg, type)
  window.showToast = function (message, typeOrIcon) {
    var icon = typeOrIcon;
    if (typeOrIcon === 'success') {
      // Map "Added to cart" to cart emoji for extra polish
      if (message.toLowerCase().indexOf('cart') !== -1) icon = '🛒';
      else if (message.toLowerCase().indexOf('wishlist') !== -1) icon = '❤️';
      else icon = '✓';
    } else if (typeOrIcon === 'error') {
      icon = '❌';
    } else if (typeOrIcon === 'warning') {
      icon = '⚠️';
    }
    showVVToast(message, icon);
  };

  if (oldShow && oldShow.q) {
    oldShow.q.forEach(function (args) {
      showVVToast(args.message, args.icon);
    });
  }
})();
