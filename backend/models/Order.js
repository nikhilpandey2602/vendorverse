/**
 * VendorVerse - Order Model
 * Schema for customer orders
 */

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    // Snapshot of product at time of order
    productSnapshot: {
        title: String,
        image: String,
        sku: String
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
        default: 'pending'
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: String,
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, default: 'India' }
    },
    pricing: {
        subtotal: {
            type: Number,
            required: true
        },
        shippingFee: {
            type: Number,
            default: 0
        },
        tax: {
            type: Number,
            default: 0
        },
        discount: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            required: true
        }
    },
    payment: {
        method: {
            type: String,
            enum: ['cod', 'card', 'upi', 'netbanking', 'wallet'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending'
        },
        transactionId: String,
        paidAt: Date
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
        default: 'pending'
    },
    tracking: {
        carrier: String,
        trackingNumber: String,
        trackingUrl: String
    },
    notes: String,
    deliveredAt: Date,
    cancelledAt: Date,
    cancellationReason: String
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.orderNumber = `VV${year}${month}${random}`;
    }
    next();
});

// Index for user order history
orderSchema.index({ user: 1, createdAt: -1 });

// Index for seller orders
orderSchema.index({ 'items.seller': 1, createdAt: -1 });

// Index for order status
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
