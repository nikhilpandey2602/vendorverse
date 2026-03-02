/**
 * VendorVerse - Main Server Entry Point
 * Express.js backend for multi-vendor e-commerce marketplace
 */

// Load environment variables first
require('dotenv').config();
console.log("JWT_SECRET from env:", process.env.JWT_SECRET);
console.log("MONGO_URI from env:", process.env.MONGO_URI);


const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// ============================================
// Middleware
// ============================================

// Enable CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
        next();
    });
}

// ============================================
// Routes
// ============================================

// Test route
app.get('/api/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'VendorVerse backend running successfully',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// ============================================
// Error Handling
// ============================================

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: messages
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`
        });
    }

    // JWT error
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    // Default error response
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================
// Start Server
// ============================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                                                        ║');
    console.log('║   🚀 VendorVerse Backend Server                        ║');
    console.log('║                                                        ║');
    console.log(`║   📡 Port: ${PORT}                                        ║`);
    console.log(`║   🌍 Environment: ${(process.env.NODE_ENV || 'development').padEnd(14)}               ║`);
    console.log('║                                                        ║');
    console.log('║   📚 API Endpoints:                                    ║');
    console.log(`║      GET  http://localhost:${PORT}/api/test               ║`);
    console.log(`║      POST http://localhost:${PORT}/api/auth/register      ║`);
    console.log(`║      POST http://localhost:${PORT}/api/auth/login         ║`);
    console.log(`║      GET  http://localhost:${PORT}/api/products           ║`);
    console.log('║                                                        ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
    process.exit(1);
});

module.exports = app;
