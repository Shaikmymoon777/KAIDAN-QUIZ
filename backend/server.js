const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const colors = require('colors');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import routes
const authRoutes = require('./routes/authRoutes');
const examRoutes = require('./routes/examRoutes');
const questionRoutes = require('./routes/questionRoutes');
const rankingRoutes = require('./routes/rankingRoutes');
const vocabRoutes = require('./routes/vocabRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/error');

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cors = require('cors');

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5174', // Your frontend URL
  credentials: true
}));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/japanese-learning', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
  } catch (err) {
    console.error(`Error: ${err.message}`.red);
    // Exit process with failure
    process.exit(1);
  }
};

// Connect to the database before starting the server
connectDB().then(() => {
  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/exams', examRoutes);
  app.use('/api/questions', questionRoutes);
  app.use('/api/rankings', rankingRoutes);
  app.use('/api/vocab', vocabRoutes);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      success: true, 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    });
  });

  // Serve static assets in production
  if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../build')));
    
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
    });
  }

  // 404 handler
  app.use(notFound);

  // Error handler
  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`.yellow.bold);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Error: ${err.message}`.red);
    // Close server & exit process
    server.close(() => process.exit(1));
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error(`Error: ${err.message}`.red);
    // Close server & exit process
    server.close(() => process.exit(1));
  });

  // Handle SIGTERM
  process.on('SIGTERM', () => {
    console.log('SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
      console.log('Process terminated!');
    });
  });
}).catch(err => {
  console.error(`Error: ${err.message}`.red);
  process.exit(1);
});

module.exports = app;