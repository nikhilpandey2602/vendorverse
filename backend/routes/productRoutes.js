/**
 * VendorVerse - Product Routes
 * Routes for product operations
 */

const express = require('express');
const router = express.Router();

const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getFeaturedProducts
} = require('../controllers/productController');

const { protect, authorize } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);

// Protected routes (Seller/Admin only)
router.post('/', protect, authorize('seller', 'admin'), createProduct);
router.put('/:id', protect, authorize('seller', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct);

module.exports = router;
