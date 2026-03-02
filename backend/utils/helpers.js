/**
 * VendorVerse - Utility Functions
 * Helper functions for the application
 */

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
const generateRandomString = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Format price to INR currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted price
 */
const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

/**
 * Calculate discount percentage
 * @param {number} mrp - Maximum retail price
 * @param {number} sellingPrice - Selling price
 * @returns {number} Discount percentage
 */
const calculateDiscount = (mrp, sellingPrice) => {
    if (!mrp || mrp <= sellingPrice) return 0;
    return Math.round(((mrp - sellingPrice) / mrp) * 100);
};

/**
 * Paginate results
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {object} Pagination object
 */
const paginate = (page, limit, total) => {
    const currentPage = Math.max(1, parseInt(page) || 1);
    const itemsPerPage = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const totalPages = Math.ceil(total / itemsPerPage);

    return {
        page: currentPage,
        limit: itemsPerPage,
        total,
        pages: totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
    };
};

/**
 * Slugify a string
 * @param {string} text - Text to slugify
 * @returns {string} Slugified text
 */
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

module.exports = {
    generateRandomString,
    formatPrice,
    calculateDiscount,
    paginate,
    slugify
};
