/**
 * VendorVerse - Cart Model
 * Schema for shopping cart
 */

const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        default: 1
    },
    price: {
        type: Number,
        required: true
    },
    // Store product snapshot at time of adding to cart
    productSnapshot: {
        title: String,
        image: String,
        sellingPrice: Number
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    totalItems: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function (next) {
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    next();
});

// Method to add item to cart
cartSchema.methods.addItem = async function (productId, quantity, productData) {
    const existingItemIndex = this.items.findIndex(
        item => item.product.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
        // Update quantity if item exists
        this.items[existingItemIndex].quantity += quantity;
    } else {
        // Add new item
        this.items.push({
            product: productId,
            quantity,
            price: productData.price.sellingPrice,
            productSnapshot: {
                title: productData.title,
                image: productData.images?.[0]?.url || '',
                sellingPrice: productData.price.sellingPrice
            }
        });
    }

    return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function (productId) {
    this.items = this.items.filter(
        item => item.product.toString() !== productId.toString()
    );
    return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = async function (productId, quantity) {
    const itemIndex = this.items.findIndex(
        item => item.product.toString() === productId.toString()
    );

    if (itemIndex > -1) {
        if (quantity <= 0) {
            this.items.splice(itemIndex, 1);
        } else {
            this.items[itemIndex].quantity = quantity;
        }
    }

    return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = async function () {
    this.items = [];
    return this.save();
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
