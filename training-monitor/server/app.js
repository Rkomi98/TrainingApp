const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');  // Import the authentication routes
const exerciseRoutes = require('./routes/exercises'); // Import exercise management routes
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwl= 'JKwQrVZEoEEM5sul'

// Middleware
app.use(express.json()); // for parsing application/json
app.use(cors({
  origin: 'http://192.168.1.107:3000',//'http://localhost:3000',  // Frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed methods
  credentials: true  // If your requests include cookies or HTTP authentication
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

app.get('/api/schedule/:player', async (req, res) => {
  try {
    const { player } = req.params;
    const schedule = await Schedule.findOne({ player });

    if (!schedule) {
      return res.status(404).json({ message: 'No schedule found' });
    }

    // Transform the data if necessary
    const responseData = {
      _id: schedule._id,
      player: schedule.player,
      coach: schedule.coach,
      exercises: schedule.exercises.map(exercise => ({
        id: exercise.id, // This will be a number
        // Include other fields if necessary
      })),
      createdAt: schedule.createdAt,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});


app.post('/api/schedule', async (req, res) => {
  try {
    const { player, coach, exercises } = req.body; // Destructure incoming data
    const existingSchedule = await Schedule.findOne({ player, coach });

    if (existingSchedule) {
      // Update existing schedule
      existingSchedule.exercises.push(...exercises);
      await existingSchedule.save();
      return res.status(200).json(existingSchedule);
    } else {
      // Create new schedule
      const newSchedule = new Schedule({ player, coach, exercises });
      await newSchedule.save();
      return res.status(201).json(newSchedule);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
