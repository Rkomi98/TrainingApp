const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');  // Import the Schedule model

// Get all exercises from the schedule
router.get('/', async (req, res) => {
  try {
    const schedule = await Schedule.findOne();  // Retrieve the schedule document

    if (!schedule) {
      return res.status(404).json({ message: 'No schedule found' });
    }

    // Return the exercises array
    res.json(schedule.exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);  // Log the error
    res.status(500).json({ message: 'Server error while fetching exercises' });
  }
});

// POST route to receive and save scores
router.post('/scores', async (req, res) => {
  try {
    const { userName, scores, date } = req.body;

    // Check if the user's schedule exists
    let schedule = await Schedule.findOne({ player: userName });

    if (!schedule) {
      // Create a new schedule if it doesn't exist
      schedule = new Schedule({
        coach: 'Coach123', // Assign a coach or make this dynamic
        player: userName,
        exercises: Object.entries(scores).map(([id, scoreData]) => ({
          id: parseInt(id), // Convert to int if needed
          score1: scoreData.score1,
          score2: scoreData.score2,
        })),
        createdBy: 'Coach123', // Assign a creator or make this dynamic
        createdAt: new Date(),
        date: date || new Date(), // Use provided date or current date
      });
    } else {
      // Update existing schedule
      schedule.exercises.forEach((exercise) => {
        if (scores[exercise.id]) {
          exercise.score1 = scores[exercise.id].score1;
          exercise.score2 = scores[exercise.id].score2;
        }
      });
    }

    // Save the schedule (either new or updated)
    await schedule.save();

    res.json({ message: 'Scores saved successfully', schedule });
  } catch (error) {
    console.error('Error saving scores:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

module.exports = router;
