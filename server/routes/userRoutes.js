const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getLeaderboard,
  uploadAvatar
} = require('../controllers/userController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');


// Public routes
router.get('/leaderboard', getLeaderboard);

// Protected routes
router.get('/:id', getUserProfile);
// router.put('/profile', updateUserProfile);
// router.post('/avatar', upload.single('avatar'), uploadAvatar);

router.put(
  '/profile',
  protect,
  updateUserProfile
);

router.post(
  '/avatar',
  protect,
  upload.single('avatar'),
  uploadAvatar
);

module.exports = router;