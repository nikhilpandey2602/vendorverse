/**
 * VendorVerse - Order Controller
 * Handles order creation and management
 */

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * @desc    Create new order from cart (database cart)
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Prepare order items
        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            seller: item.product.seller,
            quantity: item.quantity,
            price: item.price,
            productSnapshot: {
                title: item.product.title,
                image: item.product.images?.[0]?.url || '',
                sku: item.product.inventory?.sku || ''
            }
        }));

        // Calculate pricing
        const subtotal = cart.totalPrice;
        const shippingFee = subtotal > 499 ? 0 : 40; // Free shipping over ₹499
        const tax = Math.round(subtotal * 0.18); // 18% GST
        const total = subtotal + shippingFee + tax;

        // Create order
        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            pricing: {
                subtotal,
                shippingFee,
                tax,
                discount: 0,
                total
            },
            payment: {
                method: paymentMethod,
                status: paymentMethod === 'cod' ? 'pending' : 'pending'
            }
        });

        // Update product inventory
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { 'inventory.quantity': -item.quantity }
            });
        }

        // Clear cart
        await cart.clearCart();

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: order
        });
    } catch (error) {
        console.error('CreateOrder error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
};

/**
 * @desc    Create new order from frontend cart (localStorage cart)
 * @route   POST /api/orders/create
 * @access  Private
 */
const createOrderFromCart = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod } = req.body;

        // Validate items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty. Please add items to your cart.'
            });
        }

        // Validate payment method against allowed set
        const ALLOWED_PAYMENT_METHODS = ['cod', 'card', 'upi', 'netbanking', 'wallet'];
        const method = paymentMethod || 'cod';
        if (!ALLOWED_PAYMENT_METHODS.includes(method)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment method.'
            });
        }

        // Use default shipping address if not provided
        const address = shippingAddress || {};
        const finalAddress = {
            fullName: address.fullName || req.user.firstName + ' ' + (req.user.lastName || ''),
            phone: address.phone || '9999999999',
            addressLine1: address.addressLine1 || 'Address Line 1',
            addressLine2: address.addressLine2 || '',
            city: address.city || 'City',
            state: address.state || 'State',
            pincode: address.pincode || '000000',
            country: address.country || 'India'
        };

        /* ─────────────── SECURITY FIX ───────────────
           Never trust client-supplied prices, quantities, or seller IDs.
           Prices and inventory are read from the database. Unknown products
           are rejected instead of creating bogus ObjectIds.               */

        const mongoose = require('mongoose');
        const orderItems = [];
        let subtotal = 0;

        for (const item of items) {
            const productId = item.productId || item.id;

            // Must be a real MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more products are not available for ordering.'
                });
            }

            // Must exist and be active
            const product = await Product.findById(productId);
            if (!product || !product.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more products are no longer available.'
                });
            }

            // Quantity must be a positive integer
            const quantity = Number(item.quantity);
            if (!Number.isInteger(quantity) || quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid item quantity.'
                });
            }

            // Stock check
            if (product.inventory.quantity < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${product.title}".`
                });
            }

            // Authoritative price from the database
            const price = product.price.sellingPrice;
            subtotal += price * quantity;

            orderItems.push({
                product: product._id,
                seller: product.seller,
                quantity,
                price,
                productSnapshot: {
                    title: product.title,
                    image: product.images?.[0]?.url || '',
                    sku: product.inventory?.sku || ''
                },
                status: 'pending'
            });
        }

        // Recompute all pricing server-side
        const shippingFee = subtotal > 499 ? 0 : 40;
        const tax = Math.round(subtotal * 0.18);
        const total = subtotal + shippingFee + tax;

        // Create the order
        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress: finalAddress,
            pricing: {
                subtotal,
                shippingFee,
                tax,
                discount: 0,
                total
            },
            payment: {
                method,
                status: 'pending'
            },
            status: 'pending'
        });

        // Decrement inventory after a successful order
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { 'inventory.quantity': -item.quantity }
            });
        }

        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                total: order.pricing.total,
                status: order.status,
                createdAt: order.createdAt
            }
        });
    } catch (error) {
        console.error('CreateOrderFromCart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order. Please try again.'
        });
    }
};

/**
 * @desc    Get user's orders
 * @route   GET /api/orders
 * @access  Private
 */
const getMyOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const orders = await Order.find({ user: req.user._id })
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit))
            .populate('items.product', 'title images');

        const total = await Order.countDocuments({ user: req.user._id });

        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error('GetMyOrders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product', 'title images')
            .populate('user', 'firstName lastName email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check ownership (unless admin)
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('GetOrder error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
};

/**
 * @desc    Cancel order
 * @route   POST /api/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = async (req, res) => {
    try {
        const { reason } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check ownership
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this order'
            });
        }

        // Check if order can be cancelled
        const nonCancellableStatuses = ['shipped', 'delivered', 'cancelled'];
        if (nonCancellableStatuses.includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: `Order cannot be cancelled. Current status: ${order.status}`
            });
        }

        // Update order status
        order.status = 'cancelled';
        order.cancelledAt = new Date();
        order.cancellationReason = reason;

        // Restore inventory
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { 'inventory.quantity': item.quantity }
            });
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
    } catch (error) {
        console.error('CancelOrder error:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling order',
            error: error.message
        });
    }
};

/**
 * @desc    Update order status (Admin/Seller)
 * @route   PUT /api/orders/:id/status
 * @access  Private (Admin/Seller)
 */
const updateOrderStatus = async (req, res) => {
    try {
        const { status, trackingNumber, carrier } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // SECURITY: A seller may only update orders that contain their own items.
        // Admins may update any order. Role alone is not enough.
        if (req.user.role !== 'admin') {
            const isTheirOrder = order.items.some(
                item => item.seller && item.seller.toString() === req.user._id.toString()
            );
            if (!isTheirOrder) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to update this order'
                });
            }
        }

        // Update status
        order.status = status;

        // Add tracking info if provided
        if (trackingNumber) {
            order.tracking = {
                carrier,
                trackingNumber,
                trackingUrl: ''
            };
        }

        // Set delivered date if applicable
        if (status === 'delivered') {
            order.deliveredAt = new Date();
            order.payment.status = 'paid';
            order.payment.paidAt = new Date();
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order status updated',
            data: order
        });
    } catch (error) {
        console.error('UpdateOrderStatus error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    createOrderFromCart,
    getMyOrders,
    getOrder,
    cancelOrder,
    updateOrderStatus
};
