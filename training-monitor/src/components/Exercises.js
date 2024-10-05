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
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
    
        // Fetch exercises
        const exercisesResponse = await fetch('https://trainingapp-cn47.onrender.com/api/exercises', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        if (!exercisesResponse.ok) {
          throw new Error('Failed to fetch exercises');
        }
        const exercisesData = await exercisesResponse.json();
        setExercises(exercisesData);
    
        // Fetch history from server
        const historyResponse = await fetch(`https://trainingapp-cn47.onrender.com/api/schedule/${userName}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        let serverHistory = [];
        if (historyResponse.status === 404) {
          console.log('No history found for new user');
        } else if (!historyResponse.ok) {
          throw new Error('Failed to fetch history from server');
        } else {
          serverHistory = await historyResponse.json();
        }
    
        // Ensure serverHistory is an array
        if (!Array.isArray(serverHistory)) {
          console.warn('Server history is not an array, using empty array instead');
          serverHistory = [];
        }
    
        // Load history from local storage
        const localHistory = JSON.parse(localStorage.getItem(`${userName}-history`)) || [];
    
        // Merge server and local history, prioritizing server data
        const mergedHistory = [...serverHistory, ...localHistory].reduce((acc, curr) => {
          if (typeof curr === 'object' && curr !== null && curr.date && curr.scores) {
            const existingEntry = acc.find(entry => entry.date === curr.date);
            if (!existingEntry) {
              acc.push(curr);
            }
          } else {
            console.warn('Invalid history entry:', curr);
          }
          return acc;
        }, []);
    
        // Sort history by date
        mergedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
        setExerciseHistory(mergedHistory);
        localStorage.setItem(`${userName}-history`, JSON.stringify(mergedHistory));
    
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Failed to fetch data: ${err.message}`);
        setLoading(false);
      }
    };

  fetchData();
}, [userName]);

  // Load scores and exercise history from local storage for the user
  useEffect(() => {
    const storedScores = JSON.parse(localStorage.getItem(userName)) || {};
    console.log('Loaded scores from local storage:', storedScores);
    setScores(storedScores);
    const history = JSON.parse(localStorage.getItem(`${userName}-history`)) || [];
    console.log('Loaded history from local storage:', history);
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
  
      const currentDate = new Date().toISOString();
      
      // Convert scores object to array format
      const scoresArray = Object.entries(scores).map(([id, score]) => ({
        id: Number(id),
        score1: score.score1,
        score2: score.score2,
      }));
  
      const newEntry = {
        date: currentDate,
        scores: scoresArray
      };
  
      const response = await fetch(`https://trainingapp-cn47.onrender.com/api/schedule/${userName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(newEntry),
      });
  
      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(`Failed to update schedule: ${responseData.message || 'Unknown error'}`);
      }
  
      const responseData = await response.json();
      console.log('Server response:', responseData);
  
      // Update local state
      setExerciseHistory(prevHistory => {
        const updatedHistory = [...prevHistory, newEntry];
        updatedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        return updatedHistory;
      });
  
      // Update local storage
      const updatedHistory = [...exerciseHistory, newEntry].sort((a, b) => new Date(b.date) - new Date(a.date));
      localStorage.setItem(`${userName}-history`, JSON.stringify(updatedHistory));
  
      setScores({}); // Clear the form after successful submission
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
