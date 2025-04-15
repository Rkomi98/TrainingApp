import React, { useState, useEffect } from 'react'; // Import useEffect
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid, // Added for better readability
  Tooltip,
  Legend,
  ResponsiveContainer,
  // LabelList, // Removing LabelList for now to simplify, can be added back if needed
} from 'recharts';

// Helper to format date ticks on X-axis
const formatDateTick = (isoDateString) => {
  try {
    return new Date(isoDateString).toLocaleDateString('en-US', { // Or your preferred locale
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return isoDateString; // Fallback
  }
};

const ProgressChart = ({ history, exercises }) => {
  // --- State for Selected Exercise ---
  const [selectedExerciseId, setSelectedExerciseId] = useState(null); // Store the ID

  // --- Create Exercise Map for Dropdown ---
  // This needs to run whenever 'exercises' prop changes
  const exerciseMap = React.useMemo(() => {
      const map = {};
      if (Array.isArray(exercises)) {
        exercises.forEach(exercise => {
          if (exercise && exercise.id && exercise.name) {
            map[exercise.id] = exercise.name;
          }
        });
      }
      return map;
  }, [exercises]); // Recalculate only when exercises array changes

  // --- Effect to Set Initial/Default Selected Exercise ---
  useEffect(() => {
      // Find the first valid ID from the map
      const firstValidId = Object.keys(exerciseMap)[0] || null;
      // Set the initial selection, or if the current selection becomes invalid
      if (firstValidId && (!selectedExerciseId || !exerciseMap[selectedExerciseId])) {
          setSelectedExerciseId(firstValidId);
      }
      // If the map becomes empty and an exercise was selected, clear selection
      else if (!firstValidId && selectedExerciseId){
          setSelectedExerciseId(null);
      }
  }, [exerciseMap, selectedExerciseId]); // Re-run when map changes or selection exists


  // --- Prepare Data for the Chart ---
  // This depends on history and the selectedExerciseId
  const chartData = React.useMemo(() => {
    if (!selectedExerciseId || !Array.isArray(history)) {
      return []; // Return empty if no selection or history
    }

    // Filter history to include only entries relevant to the selected exercise
    // and transform into the format recharts needs: { date: ..., score1: ..., score2: ... }
    return history
      .map(dailyEntry => {
          // Find the specific exercise's scores within the daily entry
          let score1 = null;
          let score2 = null;
          if (dailyEntry && dailyEntry.date && Array.isArray(dailyEntry.exercises)) {
              const exerciseData = dailyEntry.exercises.find(ex => ex && ex.id?.toString() === selectedExerciseId.toString());
              if (exerciseData) {
                  score1 = typeof exerciseData.score1 === 'number' ? exerciseData.score1 : null;
                  score2 = typeof exerciseData.score2 === 'number' ? exerciseData.score2 : null;
              }
              // Return object only if scores were found for this day? Or always return date?
              // Let's always return the date object, scores might be null
              return {
                  date: dailyEntry.date, // Keep original date (ISO string assumed)
                  score1: score1,
                  score2: score2,
              };
          }
          return null; // Ignore invalid daily entries
      })
      .filter(entry => entry !== null) // Remove ignored entries
      // Sort by date ascending (recharts usually expects this)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

  }, [history, selectedExerciseId]); // Recalculate when history or selection changes

  // --- Calculate Y-Axis Domain ---
  const yAxisDomain = React.useMemo(() => {
      if (chartData.length === 0) {
          return [0, 1]; // Default domain if no data
      }
      // Find max score1 and score2 from the prepared chartData
      const scores = chartData.flatMap(d => [d.score1, d.score2])
                              .filter(s => typeof s === 'number'); // Only numeric scores

      const maxValue = scores.length > 0 ? Math.max(...scores) : 0;
      const yMax = Math.ceil(maxValue) + 1; // Use ceiling and add 1

      return [0, yMax]; // Domain starts at 0

  }, [chartData]); // Recalculate when chartData changes


  // --- Render Logic ---

  // Handle cases where data is not ready
  if (!Array.isArray(exercises) || exercises.length === 0) {
    return <div>Loading exercises list...</div>; // Or No exercises defined
  }
  if (Object.keys(exerciseMap).length === 0) {
    return <div>Processing exercises...</div>; // Should be brief
  }
   if (!selectedExerciseId) {
     return <div>Please select an exercise.</div>; // Handle no selection state
   }


  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Select an Exercise</h3>
      <select
        value={selectedExerciseId} // Use the ID for the value
        // Ensure onChange updates with the ID (which should be a string from option value)
        onChange={(e) => setSelectedExerciseId(e.target.value)}
        style={styles.dropdown}
      >
        {/* Default unselected option? */}
        {/* <option value="" disabled>-- Select --</option> */}
        {Object.entries(exerciseMap).map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>

      {/* Only render chart if there's data */}
      {chartData.length > 0 ? (
        <div style={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={300}>
            {/* Add key to LineChart if data changes drastically might help re-render */}
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 25 }}>
              {/* Add Cartesian Grid */}
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

              {/* X Axis Configuration */}
              <XAxis
                dataKey="date"
                tickFormatter={formatDateTick} // Format ticks
                angle={-45} // Angle ticks if they overlap
                textAnchor="end" // Adjust anchor for angled ticks
                height={60} // Increase bottom margin if needed for angled labels
                interval="preserveStartEnd" // Try to show first/last, let recharts skip others
                // Or force all ticks (can cause overlap): interval={0}
              />

              {/* Y Axis Configuration */}
              <YAxis
                domain={yAxisDomain} // Apply calculated domain [0, max+1]
                allowDecimals={false} // No decimals on axis if scores are integers
                width={40} // Adjust left margin if needed
              />

              {/* Tooltip */}
              <Tooltip
                labelFormatter={formatDateTick} // Format date in tooltip label
                formatter={(value, name) => { // Format score values in tooltip
                    const scoreType = name === 'score1' ? 'Score 1' : 'Score 2';
                    return [value, scoreType];
                }}
              />

              {/* Legend */}
              <Legend formatter={(value) => (value === 'score1' ? 'Score 1' : 'Score 2')} />

              {/* Lines - use simple dataKeys */}
              <Line
                type="monotone"
                dataKey="score1" // Use the direct key from chartData
                stroke="#8884d8" // Blue/Purple
                strokeWidth={2}
                activeDot={{ r: 6 }}
                connectNulls={true} // Connect line over null data points
              />
              <Line
                type="monotone"
                dataKey="score2" // Use the direct key from chartData
                stroke="#82ca9d" // Green
                strokeWidth={2}
                activeDot={{ r: 6 }}
                connectNulls={true} // Connect line over null data points
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        // Message if an exercise is selected but has no history data
        <p>No history data found for "{exerciseMap[selectedExerciseId]}".</p>
      )}
    </div>
  );
};

// --- Styles (Keep as is) ---
const styles = {
  container: {
    padding: '10px',
    backgroundColor: '#f7f9fc',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    marginTop: '20px', // Add some space above the chart
  },
  heading: {
    textAlign: 'center',
    fontSize: '1.2em',
    color: '#333',
    marginBottom: '10px',
  },
  dropdown: {
    display: 'block', // Make dropdown block level for centering/width
    width: '80%', // Adjust width as needed
    maxWidth: '400px', // Max width
    margin: '0 auto 15px auto', // Center the dropdown
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '1em',
    backgroundColor: 'white',
  },
  chartWrapper: {
    width: '100%',
    overflowX: 'auto', // Allow horizontal scroll if needed on small screens
    padding: '10px 0', // Add padding top/bottom
  },
};

export default ProgressChart;