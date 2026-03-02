/**
 * VendorVerse - Theme & Logo Management System
 * Handles theme switching and logo variants
 */

const THEME_STORAGE_KEY = 'vendorverse_theme';
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    BLUE: 'blue'
};

// Logo SVG templates
const LOGOS = {
    light: `
        <svg width="150" height="40" viewBox="0 0 150 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="logo-light">
                <!-- Diamond icon -->
                <path d="M20 8L28 20L20 32L12 20L20 8Z" fill="#6366f1" stroke="#6366f1" stroke-width="1.5"/>
                <path d="M20 12L24 20L20 28L16 20L20 12Z" fill="#8b5cf6"/>
                <!-- Text -->
                <text x="35" y="27" font-family="Inter, sans-serif" font-size="18" font-weight="700" fill="#1F2937">VendorVerse</text>
            </g>
        </svg>
    `,
    dark: `
        <svg width="150" height="40" viewBox="0 0 150 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="logo-dark">
                <!-- Diamond icon -->
                <path d="M20 8L28 20L20 32L12 20L20 8Z" fill="#8b5cf6" stroke="#a78bfa" stroke-width="1.5"/>
                <path d="M20 12L24 20L20 28L16 20L20 12Z" fill="#c4b5fd"/>
                <!-- Text -->
                <text x="35" y="27" font-family="Inter, sans-serif" font-size="18" font-weight="700" fill="#F9FAFB">VendorVerse</text>
            </g>
        </svg>
    `,
    blue: `
        <svg width="150" height="40" viewBox="0 0 150 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="logo-blue">
                <!-- Diamond icon -->
                <path d="M20 8L28 20L20 32L12 20L20 8Z" fill="#3b82f6" stroke="#60a5fa" stroke-width="1.5"/>
                <path d="M20 12L24 20L20 28L16 20L20 12Z" fill="#93c5fd"/>
                <!-- Text -->
                <text x="35" y="27" font-family="Inter, sans-serif" font-size="18" font-weight="700" fill="#1e40af">VendorVerse</text>
            </g>
        </svg>
    `
};

/**
 * Initialize theme system
 */
function initThemeSystem() {
    // Get saved theme or default to light
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || THEMES.LIGHT;
    applyTheme(savedTheme, false);

    // Setup theme switcher if it exists
    setupThemeSwitcher();

    console.log('%c🎨 Theme System Loaded', 'color: #6366f1; font-weight: bold;');
}

/**
 * Apply theme to body and update logo
 */
function applyTheme(theme, animate = true) {
    if (!Object.values(THEMES).includes(theme)) {
        theme = THEMES.LIGHT;
    }

    const body = document.body;
    const logoContainer = document.getElementById('dynamic-logo');

    // Add transition class if animating
    if (animate) {
        body.style.transition = 'background-color 300ms ease, color 300ms ease';
        if (logoContainer) {
            logoContainer.style.transition = 'opacity 200ms ease';
            logoContainer.style.opacity = '0';
        }
    }

    // Apply theme
    setTimeout(() => {
        body.setAttribute('data-theme', theme);

        // Update logo
        if (logoContainer) {
            logoContainer.innerHTML = LOGOS[theme];
            if (animate) {
                setTimeout(() => {
                    logoContainer.style.opacity = '1';
                }, 50);
            }
        }

        // Save to localStorage
        localStorage.setItem(THEME_STORAGE_KEY, theme);

        // Update switcher UI
        updateThemeSwitcherUI(theme);

        // Clean up transition
        if (animate) {
            setTimeout(() => {
                body.style.transition = '';
                if (logoContainer) logoContainer.style.transition = '';
            }, 300);
        }
    }, animate ? 100 : 0);
}

/**
 * Setup theme switcher dropdown/buttons
 */
function setupThemeSwitcher() {
    const switcher = document.getElementById('theme-switcher');
    if (!switcher) return;

    switcher.addEventListener('change', (e) => {
        applyTheme(e.target.value, true);
    });

    // Alternative: button-based switcher
    const themeButtons = document.querySelectorAll('[data-theme-btn]');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme-btn');
            applyTheme(theme, true);
        });
    });
}

/**
 * Update theme switcher UI to match current theme
 */
function updateThemeSwitcherUI(theme) {
    const switcher = document.getElementById('theme-switcher');
    if (switcher && switcher.value !== theme) {
        switcher.value = theme;
    }

    // Update button states
    const themeButtons = document.querySelectorAll('[data-theme-btn]');
    themeButtons.forEach(btn => {
        const btnTheme = btn.getAttribute('data-theme-btn');
        if (btnTheme === theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

/**
 * Get current theme
 */
function getCurrentTheme() {
    return document.body.getAttribute('data-theme') || THEMES.LIGHT;
}

/**
 * Toggle between light and dark
 */
function toggleTheme() {
    const current = getCurrentTheme();
    const newTheme = current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    applyTheme(newTheme, true);
}

// Auto-initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeSystem);
} else {
    initThemeSystem();
}

// Expose global functions
window.applyTheme = applyTheme;
window.getCurrentTheme = getCurrentTheme;
window.toggleTheme = toggleTheme;
