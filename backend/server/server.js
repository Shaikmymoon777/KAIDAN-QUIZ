require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const scoresRouter = require('./routes/scores');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware - enable CORS for all routes
app.use(cors());
app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// API Routes
app.use('/api/scores', scoresRouter);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI}`);
});