import React, { useState, useEffect } from 'react';
import Exercises from './components/Exercises';
import Login from './components/Login';
import Register from './components/Register';
// Assuming auth.js handles token storage/retrieval and API calls for auth
import { initializeAuth, setAuthToken, getDecodedToken } from './components/auth';
import './App.css';

// Ensure components that make API calls use the environment variable
// Make sure Login.js, Register.js, and potentially auth.js use this:
// const API_BASE_URL = process.env.REACT_APP_API_URL;

function App() {
  const [userName, setUserName] = useState('');
  const [isRegistered, setIsRegistered] = useState(true); // Controls Login/Register view

  // Check for existing token on initial load
  useEffect(() => {
    initializeAuth(); // Potentially reads token from localStorage
    const decodedToken = getDecodedToken(); // Decodes token if found
    if (decodedToken && decodedToken.username) {
      setUserName(decodedToken.username);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Called by Login/Register components on successful authentication
  const handleLogin = (name, token) => {
    setUserName(name); // Update state to show Exercises component
    setAuthToken(token); // Store the token (likely in localStorage via auth.js)
  };

  // Toggles between Login and Register forms
  const toggleRegister = () => {
    setIsRegistered(!isRegistered);
  };

  // --- SUGGESTION: Add a Logout Handler ---
  const handleLogout = () => {
    setUserName(''); // Clear user state
    // You'll need a function in auth.js to remove the token
    // e.g., removeAuthToken();
    localStorage.removeItem('token'); // Or whatever key auth.js uses
    // Optionally redirect or refresh if needed
  };


  return (
    <div className="App">
      <header className="App-header"> {/* Added class for potential styling */}
        <h1>Training Monitor</h1>
        {/* Show logout button only when logged in */}
        {userName && (
          <button onClick={handleLogout} className="logout-button">
            Logout ({userName})
          </button>
        )}
      </header>

      <main>
        {userName ? (
          // If logged in, show Exercises
          <Exercises userName={userName} />
        ) : isRegistered ? (
          // If not logged in, show Login or Register
          <Login onLogin={handleLogin} onToggle={toggleRegister} />
        ) : (
          <Register onRegister={handleLogin} onToggle={toggleRegister} />
        )}
      </main>

      <footer className="App-footer">
        <p>© 2023 Training App</p>
      </footer>
    </div>
  );
}

export default App;