import React from 'react';

const exercises = {
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

const ProgressTable = ({ history }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Exercise</th>
          {history.map((entry) => (
            <th key={entry.date}>{entry.date}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.keys(exercises).map((exerciseId) => (
          <tr key={exerciseId}>
            <td>{exercises[exerciseId]}</td>
            {history.map((entry) => (
              <td key={entry.date}>
                {entry.scores[exerciseId]?.score1 || 'N/A'} / {entry.scores[exerciseId]?.score2 || 'N/A'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProgressTable;
