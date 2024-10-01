import React from 'react';

// Retrieve schedule for this user. If no data is found online for that user: "No data pigrone" has to be shown

const ProgressTable = ({ history, exercises }) => {
  // Check if exercises data is available
  if (!exercises || exercises.length === 0) {
    return <div>No data pigrone</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Exercise</th>
          {history.map((entry) => (
            <th key={entry.date}>{entry.date}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.keys(exercises).map((exerciseId) => (
          <tr key={exerciseId}>
            <td>{exercises[exerciseId].name}</td>
            {history.map((entry) => (
              <td key={entry.date}>
                {entry.scores[exerciseId]?.score1 || 'N/A'} / {entry.scores[exerciseId]?.score2 || 'N/A'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProgressTable;

