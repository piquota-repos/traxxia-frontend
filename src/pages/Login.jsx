import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    sessionStorage.clear(); // Clear any existing session data
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/login`, {
        email,
        password,
      });
      
      // Store all user data in sessionStorage
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('userId', res.data.user.id);
      sessionStorage.setItem('userName', res.data.user.name);
      sessionStorage.setItem('userEmail', res.data.user.email);
      sessionStorage.setItem('userRole', res.data.user.role);
      sessionStorage.setItem('latestVersion', res.data.latest_version || '');
      sessionStorage.setItem('isAdmin', res.data.user.role === 'admin' ? 'true' : 'false');
      
      // Navigate based on role
      // if (res.data.user.role === 'admin') {
      //   navigate('/admin-dashboard');
      // } else {
      //   navigate('/dashboard');
      // }
      navigate('/dashboard');
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-left-section">
        <div className="company-branding">
          <div className="logo-container">
            <div className="logo-circle"></div>
            <h1>Traxxia</h1>
          </div>
          <p className="tagline">Empowering your business with smart solutions.</p>
          <div className="decoration-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
      </div>
      
      <div className="login-right-section">
        <div className="login-box">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Enter your credentials to access your account</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-container">
                <i className="input-icon email-icon"></i>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <div className="password-header">
                <label>Password</label>
              </div>
              <div className="input-container">
                <i className="input-icon password-icon"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`eye-icon ${showPassword ? "eye-open" : "eye-closed"}`}></i>
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className={`login-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Log In'}
            </button>
          </form>
          
          <div className="login-footer">
            <p>Don't have an account? <a href="/register">Sign up</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;