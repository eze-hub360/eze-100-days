const Challenge = require('../models/Challenge');
const DailyLog = require('../models/DailyLog');
const User = require('../models/User');

// @desc    Create a new challenge
// @route   POST /api/challenges
// @access  Private
// const createChallenge = async (req, res) => {
//   try {
//     const { title, description, category } = req.body;
    
//     // Check if user already has an active challenge
//     const existingChallenge = await Challenge.findOne({
//       user: req.user.id,
//       isActive: true
//     });
    
//     if (existingChallenge) {
//       return res.status(400).json({ message: 'You already have an active challenge' });
//     }
    
//     const challenge = await Challenge.create({
//       user: req.user.id,
//       title,
//       description,
//       category
//     });
    
//     res.status(201).json(challenge);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// @desc    Create a new challenge
// @route   POST /api/challenges
// @access  Private
const createChallenge = async (req, res) => {
  try {
    console.log('Creating challenge for user:', req.user.id);
    console.log('Request body:', req.body);
    
    const { title, description, category } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Challenge title is required' });
    }
    
    // Check if user already has an active challenge
    const existingChallenge = await Challenge.findOne({
      user: req.user.id,
      isActive: true
    });
    
    if (existingChallenge) {
      return res.status(400).json({ 
        message: 'You already have an active challenge. Complete it first!' 
      });
    }
    
    // Calculate end date (100 days from now)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 100);
    
    // Create challenge
    const challenge = await Challenge.create({
      user: req.user.id,
      title: title,
      description: description || '',
      category: category || 'other',
      startDate: startDate,
      endDate: endDate,
      currentDay: 1,
      isActive: true,
      isCompleted: false,
      streak: 0
    });
    
    console.log('Challenge created successfully:', challenge._id);
    
    res.status(201).json(challenge);
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get user's challenges
// @route   GET /api/challenges
// @access  Private
const getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single challenge
// @route   GET /api/challenges/:id
// @access  Private
const getChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    if (challenge.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update challenge
// @route   PUT /api/challenges/:id
// @access  Private
const updateChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    if (challenge.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const updatedChallenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json(updatedChallenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get challenge progress
// @route   GET /api/challenges/:id/progress
// @access  Private
const getChallengeProgress = async (req, res) => {
  try {
    const logs = await DailyLog.find({
      challenge: req.params.id,
      user: req.user.id
    }).sort({ day: 1 });
    
    const completedDays = logs.filter(log => log.isCompleted).length;
    const totalDays = 100;
    const progress = (completedDays / totalDays) * 100;
    
    res.json({
      totalDays,
      completedDays,
      progress,
      currentStreak: req.user.streak,
      logs
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createChallenge,
  getChallenges,
  getChallenge,
  updateChallenge,
  getChallengeProgress
};