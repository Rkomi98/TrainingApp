const mongoose = require('mongoose');

// Define the schema for the exercises
const exerciseSchema = new mongoose.Schema({
  id: Number,
  name: String
});

module.exports = exerciseSchema; // Export the schema, not the model
