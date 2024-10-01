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
        const response = await fetch('http://localhost:5000/api/exercises', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include' // This line is important for CORS with credentials
        });
        if (!response.ok) {
          throw new Error('Failed to fetch exercises');
        }
        const data = await response.json();
        setExercises(data);
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
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      console.log('Submitting scores for user:', userName);
      console.log('Scores to submit:', scores);
  
      const scoresArray = Object.entries(scores).map(([id, score]) => ({
        id: Number(id),
        score1: score.score1,
        score2: score.score2,
      }));
  
      console.log('Formatted scores array:', scoresArray);
  
      const response = await fetch(`http://localhost:5000/api/schedule/${userName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ scores: scoresArray }),
      });
  
      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);
  
      if (!response.ok) {
        throw new Error(`Failed to update schedule: ${responseData.message || 'Unknown error'}`);
      }
  
      console.log('Schedule updated successfully:', responseData);

      // Update local storage
      localStorage.setItem(userName, JSON.stringify(scores));
      const history = JSON.parse(localStorage.getItem(`${userName}-history`)) || [];
      history.push({ date: new Date(), scores });
      localStorage.setItem(`${userName}-history`, JSON.stringify(history));

      // Update state
      setExerciseHistory(history);

      alert('Scores submitted successfully!');
    } catch (error) {
      console.error('Detailed error:', error);
      alert(`Failed to submit scores. Error: ${error.message}`);
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
