import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import NotFound from './components/NotFound';  // Ensure this import exists

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedUser = localStorage.getItem('user');
    if (loggedUser) {
      setUser(JSON.parse(loggedUser));
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={user ? <Dashboard user={user} setUser={setUser} /> : <Login setUser={setUser} />} />
          <Route path="*" element={<NotFound />} />  {/* Ensure this route exists */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
