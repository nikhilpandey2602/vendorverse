/**
 * VendorVerse - Auth Routes
 * Routes for user authentication
 */

const express = require('express');
const router = express.Router();

const {
    register,
    login,
    getMe,
    updateProfile,
    changePassword
} = require('../controllers/authController');

const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
