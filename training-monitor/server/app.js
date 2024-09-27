const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');  // Import the authentication routes
const exerciseRoutes = require('./routes/exercises'); // Import exercise management routes
const app = express();

app.use(express.json()); // for parsing application/json

// Connect to MongoDB
mongoose.connect('your-mongodb-connection-string', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Example routes for user registration and login
app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const user = new User({ username, password: hashedPassword, role });

  await user.save();

  res.status(201).send('User registered successfully');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Find user by username
  const user = await User.findOne({ username });

  if (!user) return res.status(400).send('User not found');

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return res.status(400).send('Invalid credentials');

  // Generate JWT token
  const token = jwt.sign({ id: user._id, role: user.role }, 'your-jwt-secret');

  res.json({ token });
});

// Middleware to protect routes
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.sendStatus(403);

  jwt.verify(token, 'your-jwt-secret', (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;  // Add user info to request object
    next();
  });
};

// Protected route example
app.get('/profile', authenticateJWT, (req, res) => {
  res.send(`Welcome, ${req.user.id}!`);
});

// Start server
app.listen(5000, () => console.log('Server running on port 5000'));
