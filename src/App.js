import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  // No useEffect, no duplicate triggers - keep it simple
  
  return (
    <Router>
      <div className="App" translate="yes">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;