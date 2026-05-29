const User = require('../models/User');
const Challenge = require('../models/Challenge');
const DailyLog = require('../models/DailyLog');

// @desc    Get user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const challenges = await Challenge.find({ user: user._id });
        const completedChallenges = challenges.filter(c => c.isCompleted).length;
        const totalLogs = await DailyLog.countDocuments({ user: user._id, isCompleted: true });
        
        res.json({
            ...user.toObject(),
            completedChallenges,
            totalDays: totalLogs
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user profile
const updateUserProfile = async (req, res) => {
    try {
        console.log('Update profile request:', req.body);
        console.log('REQ USER:', req.user);
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (req.body.name) user.name = req.body.name;
        if (req.body.bio !== undefined) user.bio = req.body.bio;
        
        await user.save();
        
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio,
            xp: user.xp,
            level: user.level,
            streak: user.streak,
            longestStreak: user.longestStreak,
            achievements: user.achievements
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Upload avatar
const uploadAvatar = async (req, res) => {
    try {
        console.log('Avatar upload request');
        console.log('File:', req.file ? req.file.originalname : 'No file');
        console.log('REQ USER:', req.user);
        console.log('REQ FILE:', req.file);
        
        if (!req.file) {
            return res.status(400).json({ message: 'Please select an image file' });
        }
        
        // Convert to base64
        const base64 = req.file.buffer.toString('base64');
        const avatarUrl = `data:${req.file.mimetype};base64,${base64}`;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.avatar = avatarUrl;
        await user.save();
        
        res.json({ 
            success: true, 
            avatar: avatarUrl 
        });
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ message: 'Failed to upload avatar' });
    }
};

// @desc    Get leaderboard
const getLeaderboard = async (req, res) => {
    try {
        const users = await User.find()
            .select('name avatar xp level streak longestStreak achievements')
            .sort({ xp: -1 })
            .limit(100);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getUserProfile, updateUserProfile, uploadAvatar, getLeaderboard };