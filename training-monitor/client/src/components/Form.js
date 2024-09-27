import React, { useState } from 'react';

function Form({ onSubmit }) {
  const [userName, setUserName] = useState('');
  const [score, setScore] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userName && score) {
      onSubmit(userName, score);
      setUserName('');
      setScore('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="score-form">
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
  );
}

export default Form;
