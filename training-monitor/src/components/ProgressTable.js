import React from 'react';

const ProgressTable = ({ history }) => {
  if (history.length === 0) {
    return <p>No data available.</p>;
  }

  // Map exercise IDs to names
  const exerciseMap = {
    1: 'Push-ups',
    2: 'Squats',
    3: 'Sit-ups',
    // Add more mappings if you have more exercises
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Scores</th>
        </tr>
      </thead>
      <tbody>
        {history.map((entry, index) => {
          // Convert scores to a more readable format
          const readableScores = Object.entries(entry.scores).reduce((acc, [id, score]) => {
            acc[exerciseMap[id]] = score; // Map ID to name
            return acc;
          }, {});

          return (
            <tr key={index}>
              <td>{entry.date}</td>
              <td>{JSON.stringify(readableScores)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ProgressTable;
