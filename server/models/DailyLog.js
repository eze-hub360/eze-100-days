const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    challenge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge',
        required: true
    },
    day: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    date: {
        type: Date,
        default: Date.now
    },
    isCompleted: {
        type: Boolean,
        default: true
    },
    journal: {
        type: String,
        default: ''
    },
    mood: {
        type: String,
        enum: ['great', 'good', 'okay', 'tired', 'struggling'],
        default: 'good'
    },
    proofImage: {
        type: String,
        default: ''
    },
    xpEarned: {
        type: Number,
        default: 0
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DailyLog', dailyLogSchema);