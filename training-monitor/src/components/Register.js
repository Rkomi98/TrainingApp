import React, { useState } from 'react';
import axios from 'axios';
// Removed useNavigate as it wasn't being used effectively here; App.js handles the view change
// import { useNavigate } from 'react-router-dom';

// Define the API base URL using the environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL;

const Register = ({ onRegister, onToggle }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('player');
  const [errorMessage, setErrorMessage] = useState('');
  // const navigate = useNavigate(); // Removed

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous error
    try {
      // Use the API_BASE_URL variable to construct the full endpoint
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username: name,
        password,
        role,
      });

      // Assuming response.data is a success message string like "User registered successfully"
      alert(response.data.message || "Registration successful!"); // Use message field if exists

      // Option 1: Automatically log the user in (if backend returns token on register)
      // if (response.data.token) {
      //   onRegister(name, response.data.token); // Pass name and token
      // } else {
      //   // Option 2: Just toggle back to login view
      //   onToggle();
      // }

      // Simplest: Just toggle back to login after successful registration
      onToggle(); // Call onToggle to switch the view in App.js back to Login


    } catch (error) {
      // Improved error handling
      console.error("Registration error:", error);
      const message = error.response?.data?.message || // Check nested message property
                      error.response?.data || // Check if data itself is the message string
                      error.message || // Axios error message
                     'An error occurred during registration. Please try again.';
      setErrorMessage(message);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <label>
          Username:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Choose a username"
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
            placeholder="Create a password"
            required
            autoComplete="new-password"
          />
        </label>
        <label>
          Role:
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="player">Player</option>
            <option value="coach">Coach</option>
          </select>
        </label>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account?{' '}
        <button type="button" className="link-button" onClick={onToggle}>
          Login here
        </button>
      </p>
    </div>
  );
};

export default Register;