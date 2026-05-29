const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketio = require('socket.io');

// Load environment variables
dotenv.config();

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

// CORS configuration - FIXED
// app.use(cors({
//     origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'https://eze-100-days.vercel.app'
    ],
    credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO setup
const io = socketio(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'https://eze-100-days.vercel.app'],
        
        credentials: true
    }
});

app.set('io', io);

// Socket events
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
        for (let [userId, socketId] of users.entries()) {
            if (socketId === socket.id) {
                users.delete(userId);
                break;
            }
        }
        io.emit('users-online', Array.from(users.keys()));
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/challenges', protect, challengeRoutes);
app.use('/api/logs', protect, dailyLogRoutes);
app.use('/api/community', protect, communityRoutes);
app.use('/api/users', protect, userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong!',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected successfully');
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });