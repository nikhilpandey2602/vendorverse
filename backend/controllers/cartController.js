/**
 * VendorVerse - Cart Controller
 * Handles shopping cart operations
 */

const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product', 'title images price inventory');

        if (!cart) {
            // Create empty cart if doesn't exist
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('GetCart error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching cart',
            error: error.message
        });
    }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart/items
 * @access  Private
 */
const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Get product details
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check stock
        if (product.inventory.quantity < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }

        // Find or create cart
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        // Add item to cart
        await cart.addItem(productId, quantity, product);

        // Populate and return
        await cart.populate('items.product', 'title images price inventory');

        res.status(200).json({
            success: true,
            message: 'Item added to cart',
            data: cart
        });
    } catch (error) {
        console.error('AddToCart error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding item to cart',
            error: error.message
        });
    }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/items/:productId
 * @access  Private
 */
const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Check stock if increasing quantity
        if (quantity > 0) {
            const product = await Product.findById(productId);
            if (product && product.inventory.quantity < quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient stock'
                });
            }
        }

        await cart.updateItemQuantity(productId, quantity);
        await cart.populate('items.product', 'title images price inventory');

        res.status(200).json({
            success: true,
            message: 'Cart updated',
            data: cart
        });
    } catch (error) {
        console.error('UpdateCartItem error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating cart item',
            error: error.message
        });
    }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/items/:productId
 * @access  Private
 */
const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        await cart.removeItem(productId);
        await cart.populate('items.product', 'title images price inventory');

        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            data: cart
        });
    } catch (error) {
        console.error('RemoveFromCart error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing item from cart',
            error: error.message
        });
    }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        await cart.clearCart();

        res.status(200).json({
            success: true,
            message: 'Cart cleared',
            data: cart
        });
    } catch (error) {
        console.error('ClearCart error:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing cart',
            error: error.message
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
