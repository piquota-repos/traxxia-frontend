import React from 'react';
import ReactDOM from 'react-dom/client';  // Use 'react-dom/client' for React 18+
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './Home';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  </Router>
);

const root = ReactDOM.createRoot(document.getElementById('root'));  // Correct way in React 18+
root.render(<App />);

export default App;
