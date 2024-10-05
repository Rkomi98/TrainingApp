import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin, onToggle }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://trainingapp-cn47.onrender.com/auth/login', {
        username: name,
        password,
      });
      // Save the token to local storage (or handle it as needed)
      localStorage.setItem('token', response.data.token);
      alert('Login successful!');
      onLogin(name); // Call the login handler passed from App.js
    } catch (error) {
      const message = error.response?.data.message || 'An error occurred. Please try again.';
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
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit">Login</button>
      </form>
      <button className="back-to-register" onClick={onToggle}>
        Go to Register
      </button>
    </div>
  );
};

export default Login;
