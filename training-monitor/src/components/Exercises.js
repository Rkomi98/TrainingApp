import React, { useState, useEffect } from 'react';
import ProgressTable from './ProgressTable';
import ProgressChart from './ProgressChart';
import Timer from './Timer';
import axios from 'axios';

function Exercises({ userName }) {
  const [scores, setScores] = useState({});
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const [exercises, setExercises] = useState([]); // Fetch exercises from backend
  const [loading, setLoading] = useState(true);  // Handle loading state
  const [error, setError] = useState(null);      // Handle errors

  // Fetch exercises from the backend when the component mounts
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/exercises', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExercises(response.data); // Set the exercises from the API
        setLoading(false);
      } catch (err) {
        console.error('Error fetching exercises:', err);
        setError('Failed to fetch exercises');
        setLoading(false);
      }
    };

    fetchExercises();
  }, []); // Empty dependency array ensures it only runs once

  // Load scores and exercise history from local storage for the user
  useEffect(() => {
    const storedScores = JSON.parse(localStorage.getItem(userName)) || {};
    setScores(storedScores);
    const history = JSON.parse(localStorage.getItem(`${userName}-history`)) || [];
    setExerciseHistory(history);
  }, [userName]);

  // Handle score changes for each exercise input
  const handleScoreChange = (id, field, value) => {
    const parsedValue = parseFloat(value);
    const isValidNumber = !isNaN(parsedValue); // Check if the value is a valid number
    const newScores = { ...scores, [id]: { ...scores[id], [field]: isValidNumber ? parsedValue: '' } };
    setScores(newScores);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const newHistory = { date: new Date().toLocaleDateString(), scores };
  
    try {
      const response = await fetch('http://localhost:5000/api/exercises/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming you're using JWT for auth
        },
        body: JSON.stringify({
          userName,
          scores,
          date: new Date().toISOString(), // Optional: Include a date in a standard format
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Scores submitted successfully:', data);
  
        // Update local history after successful submission
        const updatedHistory = [...exerciseHistory, newHistory];
        setExerciseHistory(updatedHistory);
  
        // Clear scores after submission
        setScores({});
      } else {
        console.error('Failed to submit scores:', response.statusText);
      }
    } catch (error) {
      console.error('An error occurred while submitting the scores:', error);
    }
  };

  // Show a loading indicator or error if necessary
  if (loading) return <p>Loading exercises...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Exercises for Today</h2>
      <Timer />
      <form onSubmit={handleSubmit}>
        <table>
          <thead>
            <tr>
              <th>Exercise</th>
              <th>Score 1</th>
              <th>Score 2</th>
            </tr>
          </thead>
          <tbody>
            {exercises.map((exercise) => (
              <tr key={exercise.id}>
                <td>{exercise.name}</td>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    value={scores[exercise.id]?.score1 || ''}
                    onChange={(e) => handleScoreChange(exercise.id, 'score1', e.target.value)}
                    min="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    value={scores[exercise.id]?.score2 || ''}
                    onChange={(e) => handleScoreChange(exercise.id, 'score2', e.target.value)}
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
      {exerciseHistory.length > 0 ? (
        <>
          <ProgressTable history={exerciseHistory} exercises={exercises} />
          <ProgressChart history={exerciseHistory} exercises={exercises} />
        </>
      ) : (
        <p>No progress recorded yet.</p>
      )}
    </div>
  );
}

export default Exercises;
