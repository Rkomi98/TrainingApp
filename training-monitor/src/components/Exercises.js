import React, { useEffect, useState } from 'react';

const Exercises = ({ userName, userRole }) => {
    const [exercises, setExercises] = useState([]);
    const [newExercise, setNewExercise] = useState('');
    const [error, setError] = useState('');

    // Fetch exercises when component mounts
    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/exercises', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming you store the token
                    },
                });
                const data = await response.json();
                setExercises(data);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch exercises');
            }
        };

        fetchExercises();
    }, []);

    // Handle adding an exercise
    const handleAddExercise = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/exercises', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming you store the token
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newExercise }),
            });
            if (!response.ok) throw new Error('Failed to add exercise');
            const addedExercise = await response.json();
            setExercises([...exercises, addedExercise]);
            setNewExercise('');
        } catch (err) {
            console.error(err);
            setError('Failed to add exercise');
        }
    };

    // Handle deleting an exercise
    const handleDeleteExercise = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/exercises/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming you store the token
                },
            });
            if (!response.ok) throw new Error('Failed to delete exercise');
            setExercises(exercises.filter(exercise => exercise._id !== id));
        } catch (err) {
            console.error(err);
            setError('Failed to delete exercise');
        }
    };

    return (
        <div>
            <h2>Exercises</h2>
            {error && <p className="error">{error}</p>}
            <ul>
                {exercises.map(exercise => (
                    <li key={exercise._id}>
                        {exercise.name} 
                        {userRole === 'coach' && (
                            <button onClick={() => handleDeleteExercise(exercise._id)}>Delete</button>
                        )}
                    </li>
                ))}
            </ul>
            {userRole === 'coach' && (
                <form onSubmit={handleAddExercise}>
                    <input 
                        type="text" 
                        value={newExercise} 
                        onChange={(e) => setNewExercise(e.target.value)} 
                        placeholder="New Exercise Name" 
                        required 
                    />
                    <button type="submit">Add Exercise</button>
                </form>
            )}
        </div>
    );
};

export default Exercises;
