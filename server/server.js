require('dotenv').config();

require('./config/passport');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const session = require('express-session');
const passport = require('passport');

// Import routes
const authRoutes = require('./routes/authRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const dailyLogRoutes = require('./routes/dailyLogRoutes');
const communityRoutes = require('./routes/communityRoutes');
const userRoutes = require('./routes/userRoutes');

// Import middleware
const { protect } = require('./middleware/authMiddleware');

// Initialize express app
const app = express();
const server = http.createServer(app);

// CORS
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'https://eze-100-days.vercel.app',
    ],
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      'eze100days_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Socket.IO
const io = socketio(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'https://eze-100-days.vercel.app',
    ],
    credentials: true,
  },
});

app.set('io', io);

// Online users
const users = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('user-online', (userId) => {
    if (userId) {
      users.set(userId, socket.id);
      io.emit('users-online', Array.from(users.keys()));
    }
  });

  socket.on('like-post', (data) => {
    socket.broadcast.emit('post-liked', data);
  });

  socket.on('new-comment', (data) => {
    io.emit('comment-added', data);
  });

  socket.on('streak-milestone', (data) => {
    io.emit('streak-celebration', data);
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of users.entries()) {
      if (socketId === socket.id) {
        users.delete(userId);
        break;
      }
    }

    io.emit('users-online', Array.from(users.keys()));
    console.log('Client disconnected:', socket.id);
  });
});

// Health Check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EZE 100 Days API Running',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/challenges', protect, challengeRoutes);
app.use('/api/logs', protect, dailyLogRoutes);
app.use('/api/community', protect, communityRoutes);
app.use('/api/users', protect, userRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
    stack:
      process.env.NODE_ENV === 'development'
        ? err.stack
        : undefined,
  });
});

// MongoDB Connection
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');

    console.log(
      'GOOGLE_CLIENT_ID:',
      process.env.GOOGLE_CLIENT_ID
        ? 'FOUND'
        : 'MISSING'
    );

    console.log(
      'GOOGLE_CLIENT_SECRET:',
      process.env.GOOGLE_CLIENT_SECRET
        ? 'FOUND'
        : 'MISSING'
    );

    console.log(
      'GOOGLE_CALLBACK_URL:',
      process.env.GOOGLE_CALLBACK_URL
    );

    server.listen(PORT, () => {
      console.log(
        `🚀 Server running on http://localhost:${PORT}`
      );
    });
  })
  .catch((err) => {
    console.error(
      '❌ MongoDB Connection Error:',
      err.message
    );
    process.exit(1);
  });