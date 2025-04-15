import React from 'react';

const formatDate = (date) => {
  if (!(date instanceof Date)) {
    try {
      date = new Date(date);
      // Check if the date is valid after conversion
      if (isNaN(date.getTime())) {
        console.warn("Invalid date encountered:", date);
        return "Invalid Date";
      }
    } catch (e) {
      console.error("Error parsing date:", date, e);
      return "Invalid Date";
    }
  }
  // Add error handling for invalid date objects just in case
  if (isNaN(date.getTime())) {
      console.warn("Invalid date object passed:", date);
      return "Invalid Date";
  }
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const ProgressTable = ({ history, exercises }) => {
  if (!history || history.length === 0 || !exercises || exercises.length === 0) {
    return <div>No progress recorded yet: Pigrone!</div>;
  }
  // Filter out potential invalid history entries just in case
  const validHistory = history.filter(entry => entry && entry.date && (entry.scores || entry.exercises));

  if (validHistory.length === 0) {
    return <div>No valid progress recorded yet</div>;
  }

  return (
    // The CSS class "table-container" will apply the scroll styles
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {/* Sticky Header for Exercise Name */}
            <th>Exercise</th>
            {validHistory.map((entry, index) => (
              <th key={entry.date || index}>{formatDate(entry.date)}</th> // Use date as key if available
            ))}
          </tr>
        </thead>
        <tbody>
          {exercises.map((exercise) => (
            <tr key={exercise.id}>
              {/* Sticky Column for Exercise Name */}
              <td>{exercise.name}</td>
              {validHistory.map((entry, index) => {
                let score1 = 'N/A';
                let score2 = 'N/A';

                // Refined logic for score finding
                if (Array.isArray(entry.scores)) {
                  // New array format
                  const exerciseScore = entry.scores.find(score => score && score.id === exercise.id);
                  if (exerciseScore) {
                    score1 = exerciseScore.score1 ?? 'N/A';
                    score2 = exerciseScore.score2 ?? 'N/A';
                  }
                } else if (typeof entry.scores === 'object' && entry.scores !== null && entry.scores[exercise.id]) {
                  // Old object format
                  score1 = entry.scores[exercise.id].score1 ?? 'N/A';
                  score2 = entry.scores[exercise.id].score2 ?? 'N/A';
                } else if (Array.isArray(entry.exercises)) {
                  // Fallback for very old data structure
                  const exerciseEntry = entry.exercises.find(e => e && e.id === exercise.id);
                  if (exerciseEntry) {
                    score1 = exerciseEntry.score1 ?? 'N/A';
                    score2 = exerciseEntry.score2 ?? 'N/A';
                  }
                }

                // Use date + exercise ID for a more stable key if possible
                const cellKey = `${entry.date || index}-${exercise.id}`;

                return (
                  <td key={cellKey}>
                    {score1} / {score2}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProgressTable;