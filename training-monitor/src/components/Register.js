import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('player'); // Default role
  const [errorMessage, setErrorMessage] = useState(''); // State to hold error messages

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://trainingapp-cn47.onrender.com/api/auth/register', {
        username: name,
        password,
        role,
      });
      alert(response.data); // Show success message
      window.location.href = '/login'; // Redirect to login page
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
      <button className="back-to-login" onClick={() => (window.location.href = '/login')}>
        Go Back to Login
      </button> {/* Go back to login */}
    </div>
  );
};

export default Register;
