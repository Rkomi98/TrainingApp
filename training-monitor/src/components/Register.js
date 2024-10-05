import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = ({ onRegister, onToggle }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('player'); // Default role
  const [errorMessage, setErrorMessage] = useState(''); // State to hold error messages
  const navigate = useNavigate(); // Use React Router's navigation

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://trainingapp-cn47.onrender.com/api/auth/register', {
        username: name,
        password,
        role,
      });
      alert(response.data);
      onRegister(name); // Handle successful registration in App.js
      navigate('/'); // Navigate back to login after registration
    } catch (error) {
      // Display the error message returned from the backend
      const message = error.response?.data || 'An error occurred. Please try again.';
      setErrorMessage(message); // Set error message state
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
            placeholder="Enter your username"
            required
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
          />
        </label>
        <label>
          Role:
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="player">Player</option>
            <option value="coach">Coach</option>
          </select>
        </label>
        {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Show error message if exists */}
        <button type="submit">Register</button>
      </form>
      <button className="back-to-login" onClick={onToggle}>
        Go Back to Login
      </button> {/* Use onToggle to switch back to login */}
    </div>
  );
};

export default Register;
