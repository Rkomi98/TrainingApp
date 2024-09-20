import React from 'react';

function Scoreboard({ entries }) {
  return (
    <div className="scoreboard">
      <h2>Scoreboard</h2>
      <ul>
        {entries.map((entry, index) => (
          <li key={index}>
            {entry.userName}: {entry.score}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Scoreboard;
