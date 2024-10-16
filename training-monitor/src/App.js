import React, { useState, useEffect } from 'react';
import Exercises from './components/Exercises';
import Login from './components/Login';
import Register from './components/Register';
import { initializeAuth, setAuthToken } from './auth'; // Import auth functions
import './App.css';

function App() {
  const [userName, setUserName] = useState('');
  const [isRegistered, setIsRegistered] = useState(true);

  useEffect(() => {
    // Initialize auth and check for existing token
    initializeAuth();
    const token = localStorage.getItem('token');
    if (token) {
      // Decode the token to get the username
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUserName(decodedToken.username);
    }
  }, []);

  const handleLogin = (name, token) => {
    setUserName(name);
    setAuthToken(token);
  };

  const toggleRegister = () => {
    setIsRegistered(!isRegistered);
  };

  return (
    <div className="App">
      <header>
        <h1>Training Monitor</h1>
      </header>

      <main>
        {userName ? (
          // Show exercises component once the user logs in
          <Exercises userName={userName} />
        ) : isRegistered ? (
          // Show Login if the user is already registered
          <Login onLogin={handleLogin} onToggle={toggleRegister} />
        ) : (
          // Show Register if the user is not registered
          <Register onRegister={handleLogin} onToggle={toggleRegister} />
        )}
      </main>
    </div>
  );
}

export default App;