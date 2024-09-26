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

const ProgressChart = ({ history }) => {
  // Map exercise IDs to names
  const exerciseMap = {
    1: 'Addominali (Jacknife)',
    2: 'Stabilizzazioni di bacino',
    3: 'Addominali tenute isometriche (elbow plank)',
    4: 'Tenute laterali (side plank)',
    5: 'Squat profondo con mani dietro il capo',
    6: 'Pistol squat su rialzo',
    7: 'Affondo frontale sul posto',
    8: 'Romanian Deadlift una gamba',
    9: 'Piegamenti sulle braccia',
    10: 'Piegamento mono podalico con piede posteriore in appoggio',
    11: 'Cammina sulle mani all’indietro',
    12: 'Dragon walk',
  };

  const [selectedExercise, setSelectedExercise] = useState(1); // Default to the first exercise

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
          <YAxis />
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
