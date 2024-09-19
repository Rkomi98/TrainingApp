# TrainingApp

A useful application for tracking your team's training progress

Create a new React project

`npx create-react-app training-monitor
cd training-monitor`

Install additional dependencies

`npm install react-router-dom chart.js react-chartjs-2`

Remove unnecessary files

`rm src/logo.svg src/App.test.js src/reportWebVitals.js src/setupTests.js`

Update src/index.js

`echo "import React from 'react';`
`import ReactDOM from 'react-dom/client';`
`import './index.css';`
`import App from './App';`

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);" > src/index.js `

Update src/App.js

`echo "import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ExerciseLog from './components/ExerciseLog';
import Progress from './components/Progress';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/" component={Login} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/log" component={ExerciseLog} />
          <Route path="/progress" component={Progress} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;" > src/App.js`

Create component files

`mkdir src/components
touch src/components/Login.js src/components/Dashboard.js src/components/ExerciseLog.js src/components/Progress.js`
