const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');  // Import the authentication routes
const exerciseRoutes = require('./routes/exercises'); // Import exercise management routes
const Schedule = require('./models/Schedule');  // Make sure this path is correct
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwl= 'JKwQrVZEoEEM5sul'

const REACT_APP_API_URL= 'https://rkomi98.github.io/TrainingApp/' //'http://192.168.1.107:3000',//'http://localhost:3000',  // Frontend domain

// Middleware
app.use(express.json()); // for parsing application/json
app.use(cors({
  origin: REACT_APP_API_URL, 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed methods
  credentials: true,  // If your requests include cookies or HTTP authentication
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const MONGO_URI= 'mongodb+srv://Rkomi98:JKwQrVZEoEEM5sul@cluster0.2dvmw.mongodb.net/trainingApp?retryWrites=true&w=majority&appName=Cluster0'
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
  jwt.verify(bearerToken, jwl, (err, user) => {
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

app.put('/api/schedule/:player', authenticateJWT, async (req, res) => {
  const { player } = req.params;
  const { scores } = req.body;

  console.log('Received update request for player:', player);
  console.log('Received scores:', scores);

  try {
    if (!Array.isArray(scores)) {
      console.error('Invalid scores format. Expected an array.');
      return res.status(400).json({ message: 'Invalid scores format. Expected an array.' });
    }

    let schedule = await Schedule.findOne({ player });
    console.log('Existing schedule:', schedule);

    if (!schedule) {
      console.log('Creating new schedule for player:', player);
      schedule = new Schedule({
        player,
        coach: 'Coach123',
        exercises: scores,
        createdAt: new Date(),
        date: new Date()
      });
    } else {
      console.log('Updating existing schedule for player:', player);
      schedule.exercises = scores;
      schedule.date = new Date();
    }

    console.log('Saving schedule:', schedule);
    const updatedSchedule = await schedule.save();
    console.log('Schedule saved successfully:', updatedSchedule);

    res.status(200).json(updatedSchedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ message: 'Server error', error: error.toString(), stack: error.stack });
  }
});




// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
