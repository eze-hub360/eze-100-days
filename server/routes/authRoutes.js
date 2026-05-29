const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
// Google Auth Routes
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
        try {
            // Generate JWT token
            const token = jwt.sign(
                { id: req.user._id },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );
            
            // Prepare user data
            const userData = {
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                avatar: req.user.avatar,
                xp: req.user.xp || 0,
                level: req.user.level || 1,
                streak: req.user.streak || 0,
                achievements: req.user.achievements || []
            };
            
            // Redirect to frontend
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
            const encodedUser = encodeURIComponent(JSON.stringify(userData));
            
            res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${encodedUser}`);
        } catch (error) {
            console.error('Google callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}/login`);
        }
    }
);

module.exports = router;