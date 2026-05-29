const express = require('express');
const router = express.Router();
const {
  getFeed,
  toggleLike,
  addComment,
  getComments,
  followUser,
  getFollowers,
  getFollowing
} = require('../controllers/communityController');

router.get('/feed', getFeed);
router.post('/like', toggleLike);
router.post('/comment', addComment);
router.get('/comments/:logId', getComments);
router.post('/follow/:userId', followUser);
router.get('/followers/:userId', getFollowers);
router.get('/following/:userId', getFollowing);

module.exports = router;