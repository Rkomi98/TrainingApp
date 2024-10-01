import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

const ProgressChart = ({ history, exercises }) => {
  // Create exerciseMap without using Object.fromEntries
  const exerciseMap = {};
  
  if (exercises && Object.keys(exercises).length > 0) {
    Object.keys(exercises).forEach((id) => {
      exerciseMap[id] = exercises[id].name;
    });
  }

  const [selectedExercise, setSelectedExercise] = useState(Object.keys(exerciseMap)[0] || null); // Default to the first exercise or null

  // Check if exercises data is available
  if (!exercises || Object.keys(exerciseMap).length === 0) {
    return <div>No data pigrone</div>;
  }

  // Prepare chart data filtered by selected exercise
  const chartData = history.map(entry => {
    const scores = {};
    const exerciseId = selectedExercise; // Get the currently selected exercise ID

    // Get the scores for the selected exercise
    scores[`${exerciseId}-score1`] = entry.scores[exerciseId]?.score1 || null;
    scores[`${exerciseId}-score2`] = entry.scores[exerciseId]?.score2 || null;
    return { date: entry.date, ...scores };
  });

  // Function to create labels for the end of each curve
  const renderCustomLabel = (exerciseName, scoreType) => ({ index, x, y }) => {
    const lastIndex = chartData.length - 1;
    if (index === lastIndex) {
      return (
        <text x={x + 5} y={y} fill="#000" fontSize={12} textAnchor="start">
          {`${exerciseName} - ${scoreType}`}
        </text>
      );
    }
    return null;
  };

  // Calculate the maximum value to set y-axis limits
  const maxValue = Math.max(...chartData.flatMap(entry => Object.values(entry).slice(1))); // Skip the date field
  const yMax = maxValue + 0.5;

  return (
    <div>
      <h3>Select an Exercise</h3>
      <select
        value={selectedExercise}
        onChange={(e) => setSelectedExercise(Number(e.target.value))}
      >
        {Object.keys(exerciseMap).map((id) => (
          <option key={id} value={id}>
            {exerciseMap[id]}
          </option>
        ))}
      </select>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis domain={[0, yMax]} />
          <Tooltip />
          <Legend
            formatter={(value) => {
              const [exerciseId, scoreType] = value.split('-');
              const exerciseName = exerciseMap[exerciseId];
              return `${exerciseName} - ${scoreType.replace('score', 'Score ')}`;
            }}
          />

          {/* Lines for selected exercise scores */}
          <Line
            type="monotone"
            dataKey={`${selectedExercise}-score1`}
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          >
            <LabelList dataKey={`${selectedExercise}-score1`} content={renderCustomLabel(exerciseMap[selectedExercise], 'Score 1')} />
          </Line>
          <Line
            type="monotone"
            dataKey={`${selectedExercise}-score2`}
            stroke="#82ca9d"
            activeDot={{ r: 8 }}
          >
            <LabelList dataKey={`${selectedExercise}-score2`} content={renderCustomLabel(exerciseMap[selectedExercise], 'Score 2')} />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
