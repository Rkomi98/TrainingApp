// src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
const basename = process.env.NODE_ENV === 'production' ? '/TrainingApp' : '/';

console.log(`Router basename set to: "${basename}" (NODE_ENV=${process.env.NODE_ENV})`); // Add log for verification

// --- End of replacement ---


ReactDOM.render(
  <React.StrictMode>
    {/* Ensure this uses the 'basename' variable defined above */}
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);