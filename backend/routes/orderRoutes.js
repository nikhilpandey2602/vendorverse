/**
 * VendorVerse - Order Routes
 * Routes for order management
 */

const express = require('express');
const router = express.Router();

const {
    createOrder,
    createOrderFromCart,
    getMyOrders,
    getOrder,
    cancelOrder,
    updateOrderStatus
} = require('../controllers/orderController');

const { protect, authorize } = require('../middlewares/authMiddleware');

// All order routes are protected
router.use(protect);

// User routes
router.post('/', createOrder);
router.post('/create', createOrderFromCart); // For frontend cart checkout
router.get('/', getMyOrders);
router.get('/my', getMyOrders); // Alias for /api/orders/my
router.get('/:id', getOrder);
router.post('/:id/cancel', cancelOrder);

// Admin/Seller routes
router.put('/:id/status', authorize('seller', 'admin'), updateOrderStatus);

module.exports = router;
