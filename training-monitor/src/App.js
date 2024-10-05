import React, { useState } from 'react';
import Exercises from './components/Exercises';
import Login from './components/Login';
import Register from './components/Register'; // Add Register component
import './App.css';

function App() {
  const [userName, setUserName] = useState('');
  const [isRegistered, setIsRegistered] = useState(true); // To toggle between login and register

  const handleLogin = (name) => {
    setUserName(name);
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
