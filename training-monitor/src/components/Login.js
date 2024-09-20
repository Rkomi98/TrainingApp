import React, { useState } from 'react';

function Login({ onLogin }) {
  const [userName, setUserName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userName) {
      onLogin(userName);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <input
        type="text"
        placeholder="Enter your name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
