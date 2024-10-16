import React, { useState, useEffect } from 'react';
import Exercises from './components/Exercises';
import Login from './components/Login';
import Register from './components/Register';
import { initializeAuth, setAuthToken, getDecodedToken} from './components/auth'; // Import auth functions
import './App.css';

function App() {
  const [userName, setUserName] = useState('');
  const [isRegistered, setIsRegistered] = useState(true);

  useEffect(() => {
    initializeAuth();
    const decodedToken = getDecodedToken();
    if (decodedToken && decodedToken.username) {
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
          <Exercises userName={userName} />
        ) : isRegistered ? (
          <Login onLogin={handleLogin} onToggle={toggleRegister} />
        ) : (
          <Register onRegister={handleLogin} onToggle={toggleRegister} />
        )}
      </main>
    </div>
  );
}

export default App;