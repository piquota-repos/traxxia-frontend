// Frontend: src/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      console.log(token)
      if (!token) {
        alert('Unauthorized access. Please log in.');
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/dashboard', {
          headers: { Authorization: token },
        });
        setMessage(res.data.message);
      } catch (err) {
        alert(err.response?.data?.message || 'Error fetching data');
        navigate('/login');
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="container mt-5">
      <h2>Dashboard</h2>
      <p>{message}</p>
      <button onClick={handleLogout} className="btn btn-danger">
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
