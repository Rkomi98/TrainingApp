import React from 'react';
import { Router, Route, Routes} from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ExerciseLog from './components/ExerciseLog';
import Progress from './components/Progress';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route exact path="/" component={Login} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/log" component={ExerciseLog} />
          <Route path="/progress" component={Progress} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
