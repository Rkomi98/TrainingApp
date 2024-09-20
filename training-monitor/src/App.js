import React, { useState } from 'react';
import Login from './components/Login';
import Exercises from './components/Exercises';
import './App.css';

function App() {
  const [userName, setUserName] = useState('');

  const handleLogin = (name) => {
    setUserName(name);
  };

  return (
    <div className="App">
      <header>
        <h1>Training Monitor</h1>
      </header>

      <main>
        {userName ? (
          <Exercises userName={userName} />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </main>
    </div>
  );
}

export default App;
