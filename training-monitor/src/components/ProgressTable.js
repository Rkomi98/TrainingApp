import React from 'react';

const formatDate = (date) => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const ProgressTable = ({ history }) => {
  // Check if history is provided and contains data
  if (!history || history.length === 0) {
    return <div>No progress recorded yet</div>;
  }

  // Get the exercises from the first entry
  const exercises = history[0].exercises || [];

  return (
    <table>
      <thead>
        <tr>
          <th>Exercise</th>
          {history.map((entry) => (
            <th key={entry.date}>{formatDate(entry.date)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {exercises.map((exercise) => (
          <tr key={exercise.id}>
            <td>{exercise.name}</td>
            {history.map((entry) => {
              // Find the exercise entry for the current exercise in the current history entry
              const exerciseEntry = entry.exercises.find(e => e.id === exercise.id);
              return (
                <td key={entry.date}>
                  {exerciseEntry ? `${exerciseEntry.score1 || 'N/A'} / ${exerciseEntry.score2 || 'N/A'}` : 'N/A'}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProgressTable;
