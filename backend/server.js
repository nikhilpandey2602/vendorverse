/**
 * VendorVerse - Main Server Entry Point
 * Express.js backend for multi-vendor e-commerce marketplace
 */

// Load environment variables first
require('dotenv').config();

// NOTE: Never log JWT_SECRET, MONGO_URI, or API keys to the console or logs.
// They are sensitive and would be exposed wherever server logs are stored.


const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// 
// Middleware
// 

// Security headers (Helmet). CSP is disabled because the frontend uses
// inline scripts and CDN assets; a proper CSP should be added separately.
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// CORS allowlist — explicit origins only, never '*' with credentials.
const allowedOrigins = (
    process.env.CORS_ORIGINS ||
    'http://localhost:5000,http://localhost:5500,http://127.0.0.1:5500,https://vendorverse-ekf8.onrender.com'
).split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        // Allow requests with no Origin header (curl, server-to-server, same-origin)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        const err = new Error('Origin not allowed by CORS');
        err.statusCode = 403;
        return callback(err);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again later.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // login/register attempts per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many login attempts. Please try again later.' }
});

const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 25, // protect the Gemini API key from quota abuse
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many AI requests. Please slow down.' }
});

app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/ai', aiLimiter);

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

// 
// Routes
// 

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
app.use('/api/ai', aiRoutes);

//
// Static File Serving (Frontend)
// Serve the frontend HTML/CSS/JS from the project root (one level up from /backend)
//

// SECURITY: Block sensitive paths (backend source, dependencies, dotfiles,
// git metadata) from ever being served as static files.
const BLOCKED_STATIC_PREFIXES = ['/backend', '/node_modules', '/.git', '/screenshots', '/.claude'];
app.use((req, res, next) => {
    const lowerPath = req.path.toLowerCase();
    const lastSegment = req.path.split('/').pop();

    const isBlocked = BLOCKED_STATIC_PREFIXES.some(prefix => lowerPath === prefix || lowerPath.startsWith(prefix + '/'));
    const isDotfile = lastSegment.startsWith('.') && lastSegment.length > 1;

    if (isBlocked || isDotfile) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
});

app.use(express.static(path.join(__dirname, '..')));

// Catch-all: serve index.html for any non-API route (SPA-style fallback)
app.get('*', (req, res, next) => {
    // Let API routes fall through to the 404 handler
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// 
// Error Handling
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

//
// Start Server
// 

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
