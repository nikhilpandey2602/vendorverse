/**
 * VendorVerse E-Commerce Homepage
 * Interactive JavaScript functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initMobileNavigation();
    initHeroCarousel();
    initProductCarousels();
    initStickyHeader();
    initSearchFunctionality();
    initWishlistButtons();
    initAddToCartButtons();

    // Initialize cart badge count from localStorage
    updateCartBadgeCount();
});

/**
 * Mobile Navigation
 */
function initMobileNavigation() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavClose = document.getElementById('mobile-nav-close');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');

    if (!mobileMenuBtn || !mobileNav) return;

    const openMenu = () => {
        mobileNav.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
    };

    mobileMenuBtn.addEventListener('click', openMenu);
    mobileNavClose?.addEventListener('click', closeMenu);
    mobileNavOverlay?.addEventListener('click', closeMenu);

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
            closeMenu();
        }
    });
}

/**
 * Hero Carousel
 */
function initHeroCarousel() {
    const track = document.getElementById('carousel-track');
    const slides = track?.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('#carousel-dots .dot');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    if (!track || !slides || slides.length === 0) return;

    let currentIndex = 0;
    let autoPlayInterval;
    const slideCount = slides.length;

    const goToSlide = (index) => {
        // Handle wrapping
        if (index < 0) index = slideCount - 1;
        if (index >= slideCount) index = 0;

        currentIndex = index;

        // Update track position
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Update slides
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === currentIndex);
        });

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    };

    const nextSlide = () => goToSlide(currentIndex + 1);
    const prevSlide = () => goToSlide(currentIndex - 1);

    // Auto-play
    const startAutoPlay = () => {
        stopAutoPlay();
        autoPlayInterval = setInterval(nextSlide, 5000);
    };

    const stopAutoPlay = () => {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
    };

    // Event listeners
    prevBtn?.addEventListener('click', () => {
        prevSlide();
        startAutoPlay();
    });

    nextBtn?.addEventListener('click', () => {
        nextSlide();
        startAutoPlay();
    });

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            goToSlide(i);
            startAutoPlay();
        });
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoPlay();
    }, { passive: true });

    const handleSwipe = () => {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    };

    // Pause on hover (desktop)
    const carouselContainer = document.querySelector('.carousel-container');
    carouselContainer?.addEventListener('mouseenter', stopAutoPlay);
    carouselContainer?.addEventListener('mouseleave', startAutoPlay);

    // Start auto-play
    startAutoPlay();
}

/**
 * Product Carousels (Horizontal Scroll)
 */
function initProductCarousels() {
    const carousels = document.querySelectorAll('.product-carousel');

    carousels.forEach(carousel => {
        const grid = carousel.querySelector('.product-grid');
        const leftBtn = carousel.querySelector('.scroll-left');
        const rightBtn = carousel.querySelector('.scroll-right');

        if (!grid) return;

        const scrollAmount = 260; // Approximate card width + gap

        const scrollLeft = () => {
            grid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        };

        const scrollRight = () => {
            grid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        };

        leftBtn?.addEventListener('click', scrollLeft);
        rightBtn?.addEventListener('click', scrollRight);

        // Update button visibility based on scroll position
        const updateButtons = () => {
            if (leftBtn) {
                leftBtn.style.opacity = grid.scrollLeft <= 0 ? '0.3' : '1';
                leftBtn.disabled = grid.scrollLeft <= 0;
            }
            if (rightBtn) {
                const maxScroll = grid.scrollWidth - grid.clientWidth;
                rightBtn.style.opacity = grid.scrollLeft >= maxScroll - 10 ? '0.3' : '1';
                rightBtn.disabled = grid.scrollLeft >= maxScroll - 10;
            }
        };

        grid.addEventListener('scroll', updateButtons, { passive: true });
        updateButtons();

        // Keyboard navigation
        grid.setAttribute('tabindex', '0');
        grid.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') scrollLeft();
            if (e.key === 'ArrowRight') scrollRight();
        });
    });
}

/**
 * Sticky Header with Hide/Show on Scroll
 */
function initStickyHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateHeader = () => {
        const currentScrollY = window.scrollY;

        // Add shadow on scroll
        if (currentScrollY > 10) {
            header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
        }

        lastScrollY = currentScrollY;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });
}

/**
 * Search Functionality
 */
function initSearchFunctionality() {
    const searchInputs = document.querySelectorAll('.search-input, .mobile-search-input');

    searchInputs.forEach(input => {
        // Search on Enter
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = input.value.trim();
                if (query && typeof showToast === 'function') {
                    // In production, this would navigate to search results
                    console.log('Searching for:', query);
                    showToast(`Searching for "${query}"...`, 'info');
                }
            }
        });

        // Debounced auto-suggest (placeholder)
        let debounceTimer;
        input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const query = input.value.trim();
                if (query.length >= 2) {
                    // In production, fetch and show suggestions
                    console.log('Fetching suggestions for:', query);
                }
            }, 300);
        });
    });

    // Voice search button
    const voiceBtn = document.querySelector('.mobile-voice-btn');
    voiceBtn?.addEventListener('click', () => {
        if (typeof showToast === 'function') {
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                showToast('Voice search coming soon!', 'info');
            } else {
                showToast('Voice search not supported', 'warning');
            }
        }
    });
}

/**
 * Wishlist Buttons
 */
function initWishlistButtons() {
    const wishlistBtns = document.querySelectorAll('.wishlist-btn');

    wishlistBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            btn.classList.toggle('active');
            const isActive = btn.classList.contains('active');

            // Update icon style
            const svg = btn.querySelector('svg');
            if (svg) {
                svg.style.fill = isActive ? '#EF4444' : 'none';
                svg.style.stroke = isActive ? '#EF4444' : 'currentColor';
            }

            // Show feedback using global toast
            if (typeof showToast === 'function') {
                showToast(isActive ? 'Added to wishlist' : 'Removed from wishlist', isActive ? 'success' : 'info');
            }

            // Animate
            btn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 200);
        });
    });
}

/**
 * Add to Cart Buttons
 */
function initAddToCartButtons() {
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');

    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Get product info from card
            const card = btn.closest('.product-card');
            if (!card) return;

            const title = card.querySelector('.product-title')?.textContent || 'Product';
            const brand = card.querySelector('.product-brand')?.textContent || '';
            const priceText = card.querySelector('.current-price')?.textContent || '₹0';
            const price = parseInt(priceText.replace(/[₹,]/g, '')) || 0;
            const image = card.querySelector('.product-image')?.src || '';

            // Create unique product ID based on title
            const productId = 'prod_' + title.toLowerCase().replace(/\s+/g, '_').substring(0, 20) + '_' + Date.now().toString(36);

            // Use cart.js addToCart if available
            if (typeof window.addToCart === 'function') {
                window.addToCart({
                    id: productId,
                    productId: productId,
                    title: title,
                    brand: brand,
                    price: price,
                    image: image
                });
            } else {
                // Fallback: store in localStorage directly
                const CART_KEY = 'vendorverse_cart';
                let cart = [];
                try {
                    cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
                } catch (e) { }

                const existing = cart.find(item => item.title === title);
                if (existing) {
                    existing.quantity += 1;
                } else {
                    cart.push({
                        id: productId,
                        productId: productId,
                        title: title,
                        price: price,
                        image: image,
                        quantity: 1
                    });
                }
                localStorage.setItem(CART_KEY, JSON.stringify(cart));
                updateCartBadgeCount();

                if (typeof showToast === 'function') {
                    showToast('Added to cart', 'success');
                }
            }

            // Button feedback animation
            const originalText = btn.textContent;
            btn.textContent = 'Added! ✓';
            btn.style.background = '#10B981';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 1500);
        });
    });
}

// Update cart badge from localStorage
function updateCartBadgeCount() {
    const CART_KEY = 'vendorverse_cart';
    const cartBadges = document.querySelectorAll('.cart-badge');
    try {
        const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
        const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartBadges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    } catch (e) { }
}

/**
 * Lazy Loading Images (Intersection Observer)
 */
function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

/**
 * Handle Product Card Click - Navigate to Product Page
 */
document.querySelectorAll('.product-card').forEach(card => {
    card.style.cursor = 'pointer';

    card.addEventListener('click', (e) => {
        // Don't navigate if clicking on buttons
        if (e.target.closest('.wishlist-btn') || e.target.closest('.add-to-cart-btn')) {
            return;
        }

        // Extract product data from card
        const title = card.querySelector('.product-title')?.textContent || 'Product';
        const brand = card.querySelector('.product-brand')?.textContent || 'VendorVerse';
        const priceText = card.querySelector('.current-price')?.textContent || '₹999';
        const originalText = card.querySelector('.original-price')?.textContent || '₹1499';
        const discount = card.querySelector('.discount')?.textContent || '25% off';
        const image = card.querySelector('.product-image')?.src || '';
        const ratingCount = card.querySelector('.rating-count')?.textContent?.replace(/[()]/g, '') || '500';

        const price = parseInt(priceText.replace(/[₹,]/g, '')) || 999;
        const originalPrice = parseInt(originalText.replace(/[₹,]/g, '')) || 1499;

        // Create product ID
        const productId = 'prod_' + title.toLowerCase().replace(/\s+/g, '_').substring(0, 15);

        // Build URL with product data
        const params = new URLSearchParams({
            id: productId,
            title: title,
            brand: brand,
            price: price,
            originalPrice: originalPrice,
            discount: discount,
            image: image,
            rating: '4.5',
            reviews: ratingCount,
            category: 'Electronics'
        });

        // Navigate to product page
        window.location.href = 'product.html?' + params.toString();
    });

    // Make cards keyboard accessible
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            card.click();
        }
    });
});

/**
 * Handle Category Banner Clicks
 */
document.querySelectorAll('.category-banner').forEach(banner => {
    banner.addEventListener('mouseenter', () => {
        banner.style.transform = 'translateY(-4px) scale(1.01)';
    });

    banner.addEventListener('mouseleave', () => {
        banner.style.transform = '';
    });
});

/**
 * Quick Category Animation
 */
document.querySelectorAll('.quick-category-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
        const icon = item.querySelector('.quick-category-icon');
        if (icon) {
            icon.style.transform = 'scale(1.1) rotate(5deg)';
        }
    });

    item.addEventListener('mouseleave', () => {
        const icon = item.querySelector('.quick-category-icon');
        if (icon) {
            icon.style.transform = '';
        }
    });
});

/**
 * Promo Banner Animation
 */
const promoBanner = document.querySelector('.promo-content');
if (promoBanner) {
    promoBanner.addEventListener('mouseenter', () => {
        promoBanner.style.transform = 'scale(1.01)';
        promoBanner.style.boxShadow = '0 25px 50px -12px rgba(108, 60, 225, 0.4)';
    });

    promoBanner.addEventListener('mouseleave', () => {
        promoBanner.style.transform = '';
        promoBanner.style.boxShadow = '';
    });
}

/**
 * Performance: Debounce utility
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Console welcome message
 */
console.log(
    '%c🛒 VendorVerse %c- Local First, Global Reach',
    'background: linear-gradient(135deg, #6C3CE1, #8B5CF6); color: white; padding: 8px 12px; border-radius: 4px; font-weight: bold; font-size: 14px;',
    'color: #6C3CE1; font-weight: bold; font-size: 14px; padding: 8px 0;'
);
console.log('Welcome to VendorVerse! 🚀');
