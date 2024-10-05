import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Exercises from './components/Exercises';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

function App() {
  const [userName, setUserName] = useState('');

  const handleLogin = (name) => {
    setUserName(name);
  };

  return (
    <Router basename="/TrainingApp">
      <div className="App">
        <header>
          <h1>Training Monitor</h1>
        </header>

        <main>
          <Routes>
            <Route path="/login" element={
              userName ? <Navigate to="/exercises" /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/register" element={
              userName ? <Navigate to="/exercises" /> : <Register onRegister={handleLogin} />
            } />
            <Route path="/exercises" element={
              userName ? <Exercises userName={userName} /> : <Navigate to="/login" />
            } />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;