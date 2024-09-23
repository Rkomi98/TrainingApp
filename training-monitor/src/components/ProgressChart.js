import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

const ProgressChart = ({ history }) => {
  // Map exercise IDs to names
  const exerciseMap = {
    1: 'Addominali (retto)',
    2: 'Stabilizzazioni di bacino',
    3: 'Addominali tenute isometriche (plance)',
    4: 'Tenute laterali',
    5: 'Squat profondo con mani dietro il capo',
    6: 'Piston squat su rialzo',
    7: 'Affondo frontale sul posto',
    8: 'RDL una gamba',
    9: 'Piegamenti sulle braccia',
    10: 'Piegamento mono podalico con piede posteriore in appoggio',
    11: 'Cammina sulle mani all’indietro',
    12: 'Dragon walk',
  };

  // State to manage visibility of each exercise
  const [visibleExercises, setVisibleExercises] = useState(Object.keys(exerciseMap));

  // Prepare chart data
  const chartData = history.map(entry => ({
    date: entry.date,
    ...entry.scores,
  }));

  // Toggle visibility of exercises when legend is clicked
  const handleLegendClick = (e) => {
    const clickedExercise = e.dataKey;
    setVisibleExercises(prevVisible => 
      prevVisible.includes(clickedExercise)
        ? prevVisible.filter(ex => ex !== clickedExercise)
        : [...prevVisible, clickedExercise]
    );
  };

  // Function to create labels for the end of each curve
  const renderCustomLabel = (exerciseName) => ({ index, x, y }) => {
    const lastIndex = chartData.length - 1;
    if (index === lastIndex) {
      return (
        <text x={x + 5} y={y} fill="#000" fontSize={12} textAnchor="start">
          {exerciseName}
        </text>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend
          onClick={handleLegendClick}
          formatter={(value) => exerciseMap[value]}
        />

        {/* Add lines for each exercise, but hide them using strokeOpacity when toggled off */}
        {Object.keys(exerciseMap).map(id => (
          <Line
            key={id}
            type="monotone"
            dataKey={id}
            stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
            strokeOpacity={visibleExercises.includes(id) ? 1 : 0}  // Hide the line by setting strokeOpacity to 0
            activeDot={{ r: 8 }}
          >
            {/* Add label at the end of the curve if visible */}
            {visibleExercises.includes(id) && (
              <LabelList dataKey={id} content={renderCustomLabel(exerciseMap[id])} />
            )}
          </Line>
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProgressChart;
