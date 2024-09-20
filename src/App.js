import React, { useState } from 'react';
import './App.css';

function App() {
  const [userName, setUserName] = useState('');
  const [score, setScore] = useState('');
  const [entries, setEntries] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userName && score) {
      setEntries([...entries, { userName, score }]);
      setUserName('');
      setScore('');
    }
  };

  return (
    <div className="App">
      <h1>Training Monitor</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Enter your score"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
      <div>
        <h2>Scoreboard</h2>
        <ul>
          {entries.map((entry, index) => (
            <li key={index}>
              {entry.userName}: {entry.score}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
