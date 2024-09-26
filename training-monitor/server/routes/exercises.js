const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT and authorize role
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.sendStatus(403);

  jwt.verify(token, 'your-jwt-secret', (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;
    next();
  });
};

const authorizeCoach = (req, res, next) => {
  if (req.user.role !== 'coach') {
    return res.status(403).send('Access denied. Coach only.');
  }
  next();
};

// Route to add exercises (coach only)
router.post('/add', authenticateJWT, authorizeCoach, (req, res) => {
  // Add exercise logic here...
  res.send('Exercise added');
});

// Route to get player exercises (player-only)
router.get('/player', authenticateJWT, (req, res) => {
  // Fetch player exercises here...
  res.send('Player exercises');
});

module.exports = router;
