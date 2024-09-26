import React, { useState } from 'react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('player');

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role })
    });

    if (res.ok) {
      alert('Registered successfully');
    } else {
      alert('Error in registration');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="player">Player</option>
        <option value="coach">Coach</option>
      </select>
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
