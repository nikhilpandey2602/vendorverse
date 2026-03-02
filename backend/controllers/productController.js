/**
 * VendorVerse - Product Controller
 * Handles product CRUD operations
 */

const Product = require('../models/Product');

/**
 * @desc    Get all products with filtering and pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            brand,
            search,
            sort = '-createdAt',
            page = 1,
            limit = 12
        } = req.query;

        // Build query
        const query = { isActive: true };

        if (category) {
            query.category = category;
        }

        if (brand) {
            query.brand = new RegExp(brand, 'i');
        }

        if (minPrice || maxPrice) {
            query['price.sellingPrice'] = {};
            if (minPrice) query['price.sellingPrice'].$gte = Number(minPrice);
            if (maxPrice) query['price.sellingPrice'].$lte = Number(maxPrice);
        }

        if (search) {
            query.$text = { $search: search };
        }

        // Pagination
        const skip = (Number(page) - 1) * Number(limit);

        // Execute query
        const products = await Product.find(query)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .populate('seller', 'firstName lastName');

        // Get total count
        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error('GetProducts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

/**
 * @desc    Get single product by ID or slug
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Try to find by ID or slug
        let product;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            product = await Product.findById(id).populate('seller', 'firstName lastName');
        } else {
            product = await Product.findOne({ slug: id }).populate('seller', 'firstName lastName');
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('GetProduct error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
};

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private (Seller/Admin)
 */
const createProduct = async (req, res) => {
    try {
        // Set seller to current user
        req.body.seller = req.user._id;

        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        console.error('CreateProduct error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private (Seller/Admin)
 */
const updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check ownership (unless admin)
        if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this product'
            });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        console.error('UpdateProduct error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private (Seller/Admin)
 */
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check ownership (unless admin)
        if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this product'
            });
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('DeleteProduct error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
};

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true, isFeatured: true })
            .limit(10)
            .populate('seller', 'firstName lastName');

        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('GetFeaturedProducts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured products',
            error: error.message
        });
    }
};

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getFeaturedProducts
};
