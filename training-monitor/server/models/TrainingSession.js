const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the structure for a single exercise score within a session
const ExerciseScoreSchema = new Schema({
    id: { type: Number, required: true }, // ID of the exercise
    name: { type: String }, // Optional: Store name for easier display later
    score1: { type: Number, default: null },
    score2: { type: Number, default: null }
}, { _id: false }); // Don't create separate _id for each score

const TrainingSessionSchema = new Schema({
    player: { // Reference to the user who performed the session
        type: String, // Or mongoose.Schema.Types.ObjectId if you link to a User collection
        required: true,
        index: true // Index for faster querying by player
    },
    date: { // The date the session was performed/submitted
        type: Date,
        required: true,
        default: Date.now,
        index: true // Index for sorting/querying by date
    },
    scores: [ExerciseScoreSchema] // Array of scores for this specific session
    // You could add other fields like 'notes', 'duration', etc.
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

module.exports = mongoose.model('TrainingSession', TrainingSessionSchema);