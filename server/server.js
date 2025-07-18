const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const academicRoutes = require('./routes/academicRoutes'); // Add this line

const app = express();

connectDB();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware (optional)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
        next();
    });
}

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        success: true,
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes - Main auth routes
app.get('/', (req, res) => {
    res.send('🎉 Welcome to the Academic Tracker API. Visit /api/health to check server status.');
  });  
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/academic', academicRoutes); // Add this line

// Direct routes for convenience (optional - if you want /api/signup to work)
app.use('/api', authRoutes);

// Handle 404 routes
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📝 Signup endpoint: http://localhost:${PORT}/api/auth/signup`);
    console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
    console.log(`🎓 Academic endpoint: http://localhost:${PORT}/api/academic`); // Add this line
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error('Unhandled Rejection:', err.message);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
    process.exit(1);
});

module.exports = app;