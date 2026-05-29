const DailyLog = require('../models/DailyLog');
const Challenge = require('../models/Challenge');
const User = require('../models/User');

const createDailyLog = async (req, res) => {
    try {
        const { challengeId, day, journal, mood } = req.body;
        
        console.log('========== CREATING LOG ==========');
        console.log('User:', req.user.id);
        console.log('Challenge:', challengeId);
        console.log('Day:', day);
        
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        
        if (challenge.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        
        // Check if already logged
        const existingLog = await DailyLog.findOne({
            challenge: challengeId,
            user: req.user.id,
            day: parseInt(day)
        });
        
        if (existingLog) {
            return res.status(400).json({ message: 'You already logged this day!' });
        }
        
        // Handle image upload
        let proofImageUrl = '';
        if (req.file) {
            try {
                const cloudinary = require('../config/cloudinary');
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'eze100days/proofs' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(req.file.buffer);
                });
                proofImageUrl = result.secure_url;
            } catch (uploadError) {
                console.error('Upload error:', uploadError);
            }
        }
        
        // Calculate XP
        let xpEarned = 10;
        if (journal && journal.length > 20) xpEarned += 5;
        if (mood === 'great') xpEarned += 5;
        if (mood === 'good') xpEarned += 3;
        
        // Create log
        const log = new DailyLog({
            user: req.user.id,
            challenge: challengeId,
            day: parseInt(day),
            journal: journal || '',
            mood: mood || 'good',
            isCompleted: true,
            proofImage: proofImageUrl,
            xpEarned: xpEarned,
            completedAt: new Date()
        });
        
        await log.save();
        
        // ========== STREAK CALCULATION FIX ==========
        const user = await User.findById(req.user.id);
        
        // Get all completed logs for this user (any challenge)
        const allLogs = await DailyLog.find({
            user: req.user.id,
            isCompleted: true
        }).sort({ completedAt: 1 }); // Sort by date completed
        
        console.log('Total completed logs:', allLogs.length);
        
        // Calculate streak based on consecutive days
        let currentStreak = 0;
        let longestStreak = user.longestStreak || 0;
        
        if (allLogs.length > 0) {
            // Group logs by date (not by day number)
            const logDates = [];
            allLogs.forEach(log => {
                const date = new Date(log.completedAt);
                const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                if (!logDates.includes(dateStr)) {
                    logDates.push(dateStr);
                }
            });
            
            // Sort dates
            logDates.sort();
            
            console.log('Log dates:', logDates);
            
            // Calculate current streak from today backwards
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
            
            let streak = 0;
            let checkDate = new Date();
            
            for (let i = 0; i < 100; i++) {
                const dateStr = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;
                if (logDates.includes(dateStr)) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
            
            currentStreak = streak;
            
            // Update longest streak
            if (currentStreak > longestStreak) {
                longestStreak = currentStreak;
            }
        }
        
        console.log('Calculated streak:', currentStreak);
        console.log('Longest streak:', longestStreak);
        
        // Update user
        user.streak = currentStreak;
        user.longestStreak = longestStreak;
        user.xp = (user.xp || 0) + xpEarned;
        
        // Update level
        const newLevel = Math.floor(user.xp / 1000) + 1;
        let levelUp = false;
        if (newLevel > (user.level || 1)) {
            user.level = newLevel;
            levelUp = true;
        }
        
        await user.save();
        
        // Update challenge current day
        if (parseInt(day) > (challenge.currentDay || 0)) {
            challenge.currentDay = parseInt(day);
            await challenge.save();
        }
        
        console.log('User updated - Streak:', user.streak, 'XP:', user.xp);
        console.log('========== LOG CREATED ==========');
        
        res.status(201).json({
            success: true,
            log: {
                _id: log._id,
                day: log.day,
                mood: log.mood,
                isCompleted: log.isCompleted,
                xpEarned: xpEarned
            },
            xpEarned: xpEarned,
            newLevel: levelUp ? newLevel : null,
            streak: currentStreak,
            longestStreak: longestStreak
        });
        
    } catch (error) {
        console.error('Create log error:', error);
        res.status(500).json({ 
            message: 'Failed to create daily log', 
            error: error.message 
        });
    }
};

const getChallengeLogs = async (req, res) => {
    try {
        const logs = await DailyLog.find({
            challenge: req.params.challengeId,
            user: req.user.id
        }).sort({ day: 1 });
        
        res.json(logs);
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateDailyLog = async (req, res) => {
    try {
        const log = await DailyLog.findById(req.params.id);
        if (!log) {
            return res.status(404).json({ message: 'Log not found' });
        }
        if (log.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        
        const updated = await DailyLog.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createDailyLog,
    getChallengeLogs,
    updateDailyLog
};