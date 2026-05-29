const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a challenge title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    default: ''
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setDate(date.getDate() + 100);
      return date;
    }
  },
  currentDay: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  streak: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['fitness', 'learning', 'productivity', 'meditation', 'coding', 'other'],
    default: 'other'
  }
}, {
  timestamps: true
});

// Remove the pre-save middleware that might be causing issues
// The endDate is now set in the default function

module.exports = mongoose.model('Challenge', challengeSchema);