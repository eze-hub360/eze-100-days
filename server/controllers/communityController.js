const DailyLog = require('../models/DailyLog');
const User = require('../models/User');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');

// @desc    Get community feed
// @route   GET /api/community/feed
// @access  Private
const getFeed = async (req, res) => {
  try {
    // Get users that the current user follows
    const following = await Follow.find({ follower: req.user.id }).select('following');
    const followingIds = following.map(f => f.following);
    
    // Include current user's own posts
    followingIds.push(req.user.id);
    
    const logs = await DailyLog.find({
      user: { $in: followingIds },
      isCompleted: true
    })
    .populate('user', 'name avatar level streak')
    .populate('challenge', 'title')
    .sort({ completedAt: -1 })
    .limit(50);
    
    // Get like counts and user's likes
    const logsWithStats = await Promise.all(logs.map(async (log) => {
      const likeCount = await Like.countDocuments({
        targetType: 'log',
        targetId: log._id
      });
      
      const userLiked = await Like.exists({
        user: req.user.id,
        targetType: 'log',
        targetId: log._id
      });
      
      const comments = await Comment.find({ log: log._id })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(5);
      
      const commentCount = await Comment.countDocuments({ log: log._id });
      
      return {
        ...log.toObject(),
        likeCount,
        userLiked: !!userLiked,
        comments,
        commentCount
      };
    }));
    
    res.json(logsWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Like/unlike a post
// @route   POST /api/community/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const { targetId, targetType } = req.body;
    
    const existingLike = await Like.findOne({
      user: req.user.id,
      targetType,
      targetId
    });
    
    if (existingLike) {
      await existingLike.deleteOne();
      res.json({ liked: false });
    } else {
      await Like.create({
        user: req.user.id,
        targetType,
        targetId
      });
      
      const io = req.app.get('io');
      io.emit('post-liked', {
        userId: req.user.id,
        targetId,
        targetType
      });
      
      res.json({ liked: true });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add comment to post
// @route   POST /api/community/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    const { logId, text } = req.body;
    
    const comment = await Comment.create({
      user: req.user.id,
      log: logId,
      text
    });
    
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name avatar');
    
    const io = req.app.get('io');
    io.emit('comment-added', {
      comment: populatedComment,
      logId
    });
    
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get comments for a post
// @route   GET /api/community/comments/:logId
// @access  Private
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ log: req.params.logId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Follow a user
// @route   POST /api/community/follow/:userId
// @access  Private
const followUser = async (req, res) => {
  try {
    if (req.params.userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }
    
    const existingFollow = await Follow.findOne({
      follower: req.user.id,
      following: req.params.userId
    });
    
    if (existingFollow) {
      await existingFollow.deleteOne();
      res.json({ following: false });
    } else {
      await Follow.create({
        follower: req.user.id,
        following: req.params.userId
      });
      res.json({ following: true });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user's followers
// @route   GET /api/community/followers/:userId
// @access  Private
const getFollowers = async (req, res) => {
  try {
    const followers = await Follow.find({ following: req.params.userId })
      .populate('follower', 'name avatar level streak');
    res.json(followers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user's following
// @route   GET /api/community/following/:userId
// @access  Private
const getFollowing = async (req, res) => {
  try {
    const following = await Follow.find({ follower: req.params.userId })
      .populate('following', 'name avatar level streak');
    res.json(following);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getFeed,
  toggleLike,
  addComment,
  getComments,
  followUser,
  getFollowers,
  getFollowing
};