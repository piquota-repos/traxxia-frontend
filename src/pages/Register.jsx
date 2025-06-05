import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';
import { FaAngleLeft } from 'react-icons/fa';
import '../styles/Register.css';
import logo from '../assets/01a2750def81a5872ec67b2b5ec01ff5e9d69d0e.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    lastName: '',
    
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const validate = () => {
  const newErrors = {};

  if (!form.name.trim()) {
    newErrors.name = 'First name is required';
    toast.error(newErrors.name);
  }
  if (!form.lastName.trim()) {
    newErrors.lastName = 'Last name is required';
    toast.error(newErrors.lastName);
  }
  
  if (!form.email.trim()) {
    newErrors.email = 'Email is required';
    toast.error(newErrors.email);
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    newErrors.email = 'Email address is invalid';
    toast.error(newErrors.email);
  }

  if (!form.password) {
    newErrors.password = 'Password is required';
    toast.error(newErrors.password);
  } else if (form.password.length < 6) {
    newErrors.password = 'Password must be at least 6 characters';
    toast.error(newErrors.password);
  }

  if (!form.confirmPassword) {
    newErrors.confirmPassword = 'Please confirm your password';
    toast.error(newErrors.confirmPassword);
  } else if (form.password !== form.confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match';
    toast.error(newErrors.confirmPassword);
  }

  if (!form.terms) {
    newErrors.terms = 'You must agree to the terms';
    toast.error(newErrors.terms);
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  const closeModal = () => {
    setShowSuccessModal(false);
    setModalMessage('');
    setIsError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const userData = {
        name: `${form.name} ${form.lastName}`,
        email: form.email,
        password: form.password,
        role: 'user',
        company: form.company
      };
      const res = await axios.post(`${API_BASE_URL}/api/users`, userData);

      setModalMessage(`Registration successful! Welcome, ${res.data.user.name}!`);
      setIsError(false);
      setShowSuccessModal(true);
      setTimeout(() => (window.location.href = '/login'), 2000);
    } catch (err) {
      setIsSubmitting(false);
      const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setIsError(true);
      setModalMessage(errorMsg);
      setShowSuccessModal(true);
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
    }
  };

  return (
    <div className="register-container">
      <div className="REGISTER-left-section">
        <div className="company-branding">
          <div className="logo-container">
           <img src={logo} alt="Traxxia Logo" className="logo" />
          </div>
          <div className="decoration-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
      </div>
      <div className="register-right">
        <div className="register-wrapper">
          <form onSubmit={handleSubmit} className="register-form">
              <div className="register-title">
              <FaAngleLeft size={34} onClick={() => navigate('/')} className="back-icon" />
              <h4>Sign up</h4>
            </div>
            <p className="register-subtitle">Create a account to get started</p>

            <div className="form-group1">
              <label>First Name</label>
              <input type="text" name="name" placeholder='Enter your first name' value={form.name} onChange={handleChange} className={errors.name ? 'error' : ''} />
            </div>
            <div className="form-group1">
              <label>Last Name</label>
              <input type="text" name="lastName" placeholder='Enter your last name' value={form.lastName} onChange={handleChange} className={errors.lastName ? 'error' : ''} />
            </div>
            <div className="form-group1">
              <label>Email</label>
              <input type="email" name="email"  placeholder='Enter your e-mail address' value={form.email} onChange={handleChange} className={errors.email ? 'error' : ''} />
            </div>
            <div className="form-group1">
              <label>Password</label>
              <div className="password-input-container">
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder='Create a password' value={form.password} onChange={handleChange} className={errors.password ? 'error' : ''} />
                <button type="button" className="password-toggle-button" onClick={togglePasswordVisibility}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
              </div>
            </div>
            <div className="form-group1">

              <div className="password-input-container">
                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder='Confirm password' value={form.confirmPassword} onChange={handleChange} className={errors.confirmPassword ? 'error' : ''} />
                <button type="button" className="password-toggle-button" onClick={toggleConfirmPasswordVisibility}>{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</button>
              </div>
            </div>
            <div className=" checkbox-group">
              <label className="checkbox-container">
                <input type="checkbox" name="terms" checked={form.terms} onChange={handleChange} />
                <span className="checkbox-label">I've read and agree with the  <a href="#terms">Terms and Conditions</a> and the <a href="#privacy">Privacy Policy</a></span>
              </label>
            </div>
            <button type="submit" className={`submit-button ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
         
        </div>
        {showSuccessModal && (
          <div className="modal-overlay">
            <div className={`success-modal ${isError ? 'error-modal' : ''}`}>
              <button className="modal-close-button" onClick={closeModal}><FaTimes /></button>
              <div className={`success-icon ${isError ? 'error-icon' : ''}`}>{isError ? '✗' : '✓'}</div>
              <h3>{isError ? 'Registration Failed' : 'Account Created!'}</h3>
              <p>{modalMessage}</p>
              {!isError && (
                <div className="success-details">
                  <p className="redirect-text">Redirecting to login page...</p>
                  <div className="loading-spinner"></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

    </div>
  );
};

export default Register;
