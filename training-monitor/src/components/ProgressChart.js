import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ProgressChart = ({ history }) => {
    const exerciseMap = {
        1: 'Push-ups',
        2: 'Squats',
        3: 'Sit-ups',
      };

    // Transform history data to chart data format
  const chartData = history.map(entry => ({
    date: entry.date,
    ...entry.scores,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend 
          formatter={(value) => exerciseMap[value]} // Change legend labels
        />
        <Line type="monotone" dataKey="1" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="2" stroke="#82ca9d" />
        <Line type="monotone" dataKey="3" stroke="#ffc658" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProgressChart;
