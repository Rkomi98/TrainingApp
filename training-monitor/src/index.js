import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import App from './App';
import './index.css';

const basename = new URL(process.env.PUBLIC_URL || window.location.origin).pathname;

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter basename={basename}> {/* Wrap the App in BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
