import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [role, setRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setRole(decoded.role);
    }
  }, []);

  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      {role === 'coach' ? <CoachPanel /> : <PlayerPanel />}
    </div>
  );
};

const CoachPanel = () => (
  <div>
    <h2>Coach Panel</h2>
    {/* Coach-specific components */}
  </div>
);

const PlayerPanel = () => (
  <div>
    <h2>Player Panel</h2>
    {/* Player-specific components */}
  </div>
);

export default Dashboard;
