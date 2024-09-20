import React, { useState, useEffect } from 'react';
import ProgressTable from './ProgressTable';
import ProgressChart from './ProgressChart';

function Exercises({ userName }) {
  const [scores, setScores] = useState({});
  const [exerciseHistory, setExerciseHistory] = useState([]);

  const exercises = [
    { id: 1, name: 'Push-ups' },
    { id: 2, name: 'Squats' },
    { id: 3, name: 'Sit-ups' },
  ];

  useEffect(() => {
    const storedScores = JSON.parse(localStorage.getItem(userName)) || {};
    setScores(storedScores);
    const history = JSON.parse(localStorage.getItem(`${userName}-history`)) || [];
    setExerciseHistory(history);
  }, [userName]);

  const handleScoreChange = (id, value) => {
    setScores({ ...scores, [id]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newHistory = { date: new Date().toLocaleDateString(), scores };

    // Save scores in local storage
    localStorage.setItem(userName, JSON.stringify(scores));
    
    // Update and save history
    const updatedHistory = [...exerciseHistory, newHistory];
    localStorage.setItem(`${userName}-history`, JSON.stringify(updatedHistory));
    setExerciseHistory(updatedHistory);
    
    // Clear scores after submission
    setScores({});
  };

  return (
    <div>
      <h2>Exercises for Today</h2>
      <form onSubmit={handleSubmit}>
        <table>
          <thead>
            <tr>
              <th>Exercise</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {exercises.map((exercise) => (
              <tr key={exercise.id}>
                <td>{exercise.name}</td>
                <td>
                  <input
                    type="number"
                    value={scores[exercise.id] || ''}
                    onChange={(e) => handleScoreChange(exercise.id, e.target.value)}
                    min="0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="submit">Submit Scores</button>
      </form>
      <h3>Your Progress</h3>
      <ProgressTable history={exerciseHistory} />
      <ProgressChart history={exerciseHistory} />
    </div>
  );
}

export default Exercises;
