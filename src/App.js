import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './components/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} /> 
      <Route path="/about" element={<About />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute adminOnly={true}>
            <Admin />
          </ProtectedRoute>
        } 
      />
    </Routes>
  </Router>
);

export default App;