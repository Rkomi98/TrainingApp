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

const ProgressTable = ({ history, exercises }) => {
  if (!history || history.length === 0 || !exercises || exercises.length === 0) {
    return <div>No progress recorded yet</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Exercise</th>
          {history.map((entry, index) => (
            <th key={index}>{formatDate(entry.date)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {exercises.map((exercise) => (
          <tr key={exercise.id}>
            <td>{exercise.name}</td>
            {history.map((entry, index) => {
              let score1 = 'N/A';
              let score2 = 'N/A';
              
              if (Array.isArray(entry.scores)) {
                // New array format
                const exerciseScore = entry.scores.find(score => score.id === exercise.id);
                if (exerciseScore) {
                  score1 = exerciseScore.score1 ?? 'N/A';
                  score2 = exerciseScore.score2 ?? 'N/A';
                }
              } else if (entry.scores && entry.scores[exercise.id]) {
                // Old object format
                score1 = entry.scores[exercise.id].score1 ?? 'N/A';
                score2 = entry.scores[exercise.id].score2 ?? 'N/A';
              } else if (Array.isArray(entry.exercises)) {
                // Fallback for old data structure
                const exerciseEntry = entry.exercises.find(e => e.id === exercise.id);
                if (exerciseEntry) {
                  score1 = exerciseEntry.score1 ?? 'N/A';
                  score2 = exerciseEntry.score2 ?? 'N/A';
                }
              }
              
              return (
                <td key={index}>
                  {score1} / {score2}
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