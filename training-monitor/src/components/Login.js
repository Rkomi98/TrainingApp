import React, { useState } from 'react';
import axios from 'axios';

// Define the API base URL using the environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL;

const Login = ({ onLogin, onToggle }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous error
    try {
      // Use the API_BASE_URL variable to construct the full endpoint
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: name,
        password,
      });

      // Assuming response.data contains { token: '...', user: { username: '...' } } or similar
      const { token, user } = response.data; // Adjust based on your actual backend response

      if (!token) {
          throw new Error("Login successful, but no token received.");
      }

      // Determine username from response if available, otherwise use input name
      const loggedInUsername = user?.username || name;

      localStorage.setItem('token', token); // Still store token directly or use setAuthToken
      alert('Login successful!');
      onLogin(loggedInUsername, token); // Pass username from response and token

    } catch (error) {
      // Improved error handling: Log the full error for debugging
      console.error("Login error:", error);
      const message = error.response?.data?.message || // Check nested message property
                      error.response?.data || // Check if data itself is the message string
                      error.message || // Axios error message
                      'An error occurred during login. Please try again.';
      setErrorMessage(message);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>
          Username:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your username"
            required
            autoComplete="username"
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />
        </label>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account?{' '}
        <button type="button" className="link-button" onClick={onToggle}>
           Register here
        </button>
      </p>
    </div>
  );
};

export default Login;