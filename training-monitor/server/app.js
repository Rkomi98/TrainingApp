const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');  // Import the authentication routes
const exerciseRoutes = require('./routes/exercises'); // Import exercise management routes
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware
app.use(express.json()); // for parsing application/json
app.use(cors({ origin: 'http://localhost:3000', methods: ['GET', 'POST'] }));

const MONGO_URI= 'mongodb+srv://Rkomi98:JKwQrVZEoEEM5sul@cluster0.2dvmw.mongodb.net/trainingApp?retryWrites=true&w=majority&appName=Cluster0'
// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Routes for authentication
app.use('/api/auth', authRoutes);

// Routes for exercise management (protected routes)
app.use('/api/exercises', authenticateJWT, exerciseRoutes);

// Middleware to protect routes with JWT
function authenticateJWT(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.sendStatus(403);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user; // Add user info to request object
        next();
    });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
