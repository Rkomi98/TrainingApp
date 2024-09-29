const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['player', 'coach'], // Roles for players and coaches
    default: 'player',
  },
});

module.exports = mongoose.model('User', UserSchema);