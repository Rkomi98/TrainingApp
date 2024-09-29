// In your server's exerciseRoutes.js file
const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise'); // Adjust the path according to your project structure
const jwt = require('jsonwebtoken');

// Middleware to protect routes with JWT
function authenticateJWT(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.sendStatus(403); // Forbidden if no token is present
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden if token is invalid
    }
    req.user = user; // Add user info to request object
    next(); // Proceed to the next middleware or route handler
  });
}
// GET all exercises (protected route)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const exercises = await Exercise.find(); // Fetch all exercises
    res.json(exercises); // Send as JSON response
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching exercises.' });
  }
});

// Add a new exercise (only for coaches)
router.post('/', authenticateJWT, async (req, res) => {
  // Ensure the user is a coach
  if (req.user.role !== 'coach') {
      return res.status(403).send('Access denied');
  }

  const { name } = req.body;
  const newExercise = new Exercise({ name });

  try {
      await newExercise.save();
      res.status(201).json(newExercise);
  } catch (error) {
      res.status(400).send('Error adding exercise');
  }
});

// Delete an exercise (only for coaches)
router.delete('/:id', authenticateJWT, async (req, res) => {
  // Ensure the user is a coach
  if (req.user.role !== 'coach') {
      return res.status(403).send('Access denied');
  }

  try {
      const exercise = await Exercise.findByIdAndRemove(req.params.id);
      if (!exercise) return res.status(404).send('Exercise not found');
      res.send('Exercise deleted successfully');
  } catch (error) {
      res.status(500).send('Error deleting exercise');
  }
});

module.exports = router;
