const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  log: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DailyLog',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Please add comment text'],
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Comment', commentSchema);