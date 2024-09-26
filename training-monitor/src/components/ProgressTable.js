import React from 'react';

const ProgressTable = ({ history }) => {
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

  // Extract unique dates from the history to use as columns
  const dates = history.map(entry => entry.date);

  return (
    <div>
      <h3>Progress Table</h3>
      <table>
        <thead>
          <tr>
            <th>Exercise</th>
            {dates.map((date, index) => (
              <th key={index}>{date}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(exerciseMap).map(id => (
            <tr key={id}>
              <td>{exerciseMap[id]}</td>
              {dates.map((date, index) => {
                const entry = history.find(entry => entry.date === date);
                return (
                  <td key={index}>
                    {entry && entry.scores[id] ? entry.scores[id] : '-'}
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
