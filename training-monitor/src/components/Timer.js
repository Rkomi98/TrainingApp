// src/Timer.js
import React, { useEffect, useState } from 'react';

// Import the sound file for alerts
import alertSound from './alert.mp3'; // Ensure to place your sound file in the correct location

const Timer = () => {
  const [time, setTime] = useState(30); // Start from 30 seconds
  const [isRunning, setIsRunning] = useState(false);
  const audioRef = React.useRef(new Audio(alertSound)); // Create audio reference

  useEffect(() => {
    let timerId;
    
    if (isRunning) {
      timerId = setInterval(() => {
        setTime(prevTime => {
          if (prevTime > 0) {
            return prevTime - 1; // Decrement time
          } else {
            clearInterval(timerId); // Stop the timer when it reaches 0
            return 0;
          }
        });
      }, 1000);
    }

    return () => clearInterval(timerId);
  }, [isRunning]);

  useEffect(() => {
    // Play sound alerts at specified times
    if (time === 10 || time === 3 || time === 2 || time === 1) {
      audioRef.current.play().catch(error => console.error("Audio play error:", error));
    }
  }, [time]); // Runs every time `time` changes

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleStop = () => {
    setIsRunning(false);
    setTime(30); // Reset to 30 seconds
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="timer">
      <div className="timer-display">{formatTime(time)}</div>
      <div className="timer-controls">
        <button onClick={handleStart}>Start</button>
        <button onClick={handlePause}>Pause</button>
        <button onClick={handleStop}>Stop</button>
      </div>
    </div>
  );
};

export default Timer;
