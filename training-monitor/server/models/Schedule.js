const mongoose = require('mongoose');

// Import the Exercise schema
const exerciseSchema = require('./Exercise');

// Define the Schedule schema
const scheduleSchema = new mongoose.Schema({
  coach: { type: String, required: true },
  player: { type: String, required: true },
  exercises: [exerciseSchema], // Embed the Exercise schema here
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  date: { type: Date, required: true } // Add the date field
});

// Create the model
const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;  // Export the Schedule model
