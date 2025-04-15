const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Import path module for absolute path checking
require('dotenv').config();
const jwt = require('jsonwebtoken');
// --- Debug dotenv ---
console.log("Attempting to load .env file from:", path.resolve(__dirname, '.env')); // Show where it's looking
const dotenvResult = require('dotenv').config(); 
if (dotenvResult.error) {
  console.error('Error loading .env file:', dotenvResult.error);
} else {
  console.log('Successfully loaded .env file');
}

const authRoutes = require('./routes/auth');  // Import the authentication routes
const exerciseRoutes = require('./routes/exercises'); // Import exercise management routes
const Schedule = require('./models/Schedule');  // Make sure this path is correct
const TrainingSession = require('./models/TrainingSession'); 
const app = express();

//const REACT_APP_API_URL= 'https://rkomi98.github.io'//'https://rkomi98.github.io/TrainingApp/' //'http://192.168.1.107:3000',//'http://localhost:3000',  // Frontend domain
//const REACT_APP_API_URL = 'http://192.168.1.107:3000'
const REACT_APP_API_URL = process.env.MONGO_URI; // Get URI from loaded environment
const LOCAL_FRONTEND_URL = process.env.LOCAL_FRONTEND_URL || 'http://localhost:3000'; // Fallback just in case
const PRODUCTION_FRONTEND_URL = process.env.PRODUCTION_FRONTEND_URL || 'https://rkomi98.github.io'; // Replace with your ACTUAL production frontend URL

console.log("Value of MONGO_URI after dotenv load:", REACT_APP_API_URL); // Log the value IMMEDIATELY

if (!REACT_APP_API_URL) {
    console.error("------------------------------------------------------------------");
    console.error("FATAL ERROR: process.env.MONGO_URI is still undefined!");
    console.error("Please check:");
    console.error("1. Is the file named EXACTLY '.env' (with the leading dot)?");
    console.error("2. Is the file located in the SAME directory as your package.json and where you run 'node app.js'?");
    console.error("   -> Expected location based on __dirname:", path.resolve(__dirname));
    console.error("3. Does the .env file contain the line 'MONGO_URI=your_connection_string' with the correct variable name?");
    console.error("4. Are there any syntax errors or weird characters in the .env file?");
    console.error("------------------------------------------------------------------");
    process.exit(1); // Exit if the DB connection string is missing
}

console.log('Attempting to connect to MongoDB...');
// Middleware
app.use(express.json()); // for parsing application/json
app.use(cors({
  origin: PRODUCTION_FRONTEND_URL, 
  methods: ['GET', 'POST', 'PUT', 'DELETE','OPTIONS'],  // Allowed methods
  credentials: true,  // If your requests include cookies or HTTP authentication
  allowedHeaders: [ // <-- UPDATE THIS ARRAY
    'Content-Type',
    'Authorization',
    'Cache-Control', // Allow Cache-Control header
    'Pragma',        // Allow Pragma header
    'Expires'        // Allow Expires header
  ]
}));

const MONGO_URI = process.env.MONGO_URI
// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Routes for authentication
app.use('/api/auth', authRoutes);

// Routes for exercise management (protected routes)
app.use('/api/exercises', authenticateJWT, exerciseRoutes);

// Middleware to protect routes with JWT
function authenticateJWT(req, res, next) {
  const token = req.headers.authorization;
  console.log('Authorization header:', token);  // Log the token received in the request

  if (!token) {
      return res.sendStatus(403);  // No token, deny access
  }

  const bearerToken = token.split(' ')[1];  // Extract the token part (Bearer TOKEN)
  jwt.verify(bearerToken, process.env.JWT_SECRET, (err, user) => {
      if (err) {
          return res.sendStatus(403);  // Invalid token, deny access
      }
      req.user = user;  // Attach user info to the request object
      next();
  });
}


// Schedule routes
app.get('/api/schedule/:player', authenticateJWT, async (req, res) => {
  const { player } = req.params;
  try {
    const schedule = await Schedule.findOne({ player });
    if (!schedule) {
      return res.status(404).json({ message: 'No schedule found for this user' });
    }
    res.status(200).json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/history/:player', authenticateJWT, async (req, res) => {
  const { player } = req.params;
  // Expect the body to contain the scores array directly (or nested as needed)
  const { scores, date } = req.body; // Get scores array and optionally a date from client

  console.log('Received POST request for player:', player);
  console.log('Received scores:', scores);
  console.log('Received date (optional):', date);


  if (!Array.isArray(scores) || scores.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty scores array provided.' });
  }

  // Basic validation on scores structure (optional but recommended)
  const validScores = scores.every(s => typeof s.id !== 'undefined' && typeof s.score1 !== 'undefined' && typeof s.score2 !== 'undefined');
  if (!validScores) {
       return res.status(400).json({ message: 'Scores array contains items with invalid structure.' });
  }


  try {
      const newSession = new TrainingSession({
          player: player,
          // Use client-provided date if available and valid, otherwise default
          date: date ? new Date(date) : new Date(),
          scores: scores // The array [{ id, name?, score1, score2 }, ...]
      });

      const savedSession = await newSession.save();
      console.log('Saved new training session:', savedSession);
      res.status(201).json(savedSession); // 201 Created status

  } catch (error) {
      console.error('Error saving training session:', error);
      res.status(500).json({ message: 'Server error saving session', error: error.toString() });
  }
});

// --- NEW: Route to GET Training History for a Player ---
app.get('/api/history/:player', authenticateJWT, async (req, res) => {
  const { player } = req.params;
  try {
      // Find all sessions for the player, sort by date descending (most recent first)
      const history = await TrainingSession.find({ player }).sort({ date: -1 });

      // Add cache control headers - IMPORTANT for fetching history
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      if (!history || history.length === 0) {
          // Send 200 OK with an empty array, not 404
          return res.status(200).json([]);
      }

      res.status(200).json(history); // Send the array of session documents

  } catch (error) {
      console.error('Error fetching training history:', error);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // Also on error
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.status(500).json({ message: 'Server error fetching history', error: error.message });
  }
});




// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
