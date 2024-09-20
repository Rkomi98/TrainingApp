import React, { useState } from 'react';
import Form from './components/Form';
import Scoreboard from './components/Scoreboard';
import './App.css';

function App() {
  const [entries, setEntries] = useState([]);

  const handleFormSubmit = (userName, score) => {
    setEntries([...entries, { userName, score }]);
  };

  return (
    <div className="App">
      <header>
        <h1>Training Monitor</h1>
      </header>

      <main>
        <Form onSubmit={handleFormSubmit} />
        <Scoreboard entries={entries} />
      </main>
    </div>
  );
}

export default App;
