/**
 * VendorVerse - Product Model
 * Schema for products in the marketplace
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Product title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    price: {
        mrp: {
            type: Number,
            required: [true, 'MRP is required'],
            min: [0, 'Price cannot be negative']
        },
        sellingPrice: {
            type: Number,
            required: [true, 'Selling price is required'],
            min: [0, 'Price cannot be negative']
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['electronics', 'fashion', 'home', 'beauty', 'grocery', 'sports', 'books', 'other']
    },
    subcategory: {
        type: String,
        trim: true
    },
    brand: {
        type: String,
        trim: true
    },
    images: [{
        url: String,
        alt: String,
        isPrimary: { type: Boolean, default: false }
    }],
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    inventory: {
        quantity: {
            type: Number,
            required: true,
            min: [0, 'Quantity cannot be negative'],
            default: 0
        },
        sku: {
            type: String,
            unique: true,
            sparse: true
        },
        lowStockThreshold: {
            type: Number,
            default: 10
        }
    },
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    specifications: {
        type: Map,
        of: String
    },
    tags: [String],
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Create slug from title before saving
productSchema.pre('save', function (next) {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now();
    }

    // Calculate discount percentage
    if (this.price.mrp && this.price.sellingPrice) {
        this.price.discount = Math.round(
            ((this.price.mrp - this.price.sellingPrice) / this.price.mrp) * 100
        );
    }

    next();
});

// Index for search
productSchema.index({ title: 'text', description: 'text', brand: 'text', tags: 'text' });

// Index for filtering
productSchema.index({ category: 1, 'price.sellingPrice': 1, 'ratings.average': -1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
