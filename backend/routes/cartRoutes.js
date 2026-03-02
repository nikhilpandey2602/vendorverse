/**
 * VendorVerse - Cart Routes
 * Routes for shopping cart operations
 */

const express = require('express');
const router = express.Router();

const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require('../controllers/cartController');

const { protect } = require('../middlewares/authMiddleware');

// All cart routes are protected
router.use(protect);

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:productId', updateCartItem);
router.delete('/items/:productId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
