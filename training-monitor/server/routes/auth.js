const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Adjust the path if needed
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Add this line

// Register endpoint
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).send('User already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ username, password: hashedPassword, role });

    try {
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(400).send('Error registering user: ' + error.message);
    }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '12h' } // Changed to 7 hours
  );
  res.json({ token });
});

router.post('/refresh', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const newToken = jwt.sign(
      { id: decoded.id, username: decoded.username, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '12h' } // Changed to 12 hours
    );
    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
