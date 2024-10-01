const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  id: Number,
  score1: Number,
  score2: Number
});

const scheduleSchema = new mongoose.Schema({
  player: String,
  coach: String,
  exercises: [exerciseSchema],
  createdAt: { type: Date, default: Date.now },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', scheduleSchema);