import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';
import '../styles/Register.css';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    terms: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 2;
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });

    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const closeModal = () => {
    setShowSuccessModal(false);
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!form.name.trim()) newErrors.name = 'Full name is required';
      if (!form.company.trim()) newErrors.company = 'Company name is required';
    }

    if (stepNumber === 2) {
      if (!form.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        newErrors.email = 'Email address is invalid';
      }

      if (!form.password) {
        newErrors.password = 'Password is required';
      } else if (form.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      // Remove terms validation since checkbox is commented out
      // if (!form.terms) {
      //   newErrors.terms = 'You must agree to the terms and conditions';
      // }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
         
    if (!validateStep(step)) {
      console.log('Validation failed:', errors); // Debug log
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Prepare data according to the API structure
      const userData = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: "user", // Default role
        company: form.company
      }; 

      const res = await axios.post(`${API_BASE_URL}/api/users`, userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      }); 
      
      setIsSubmitting(false);
      
      // Show success modal
      setModalMessage(`Registration successful! Welcome, ${res.data.user.name}!`);
      setIsError(false);
      setShowSuccessModal(true);
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
    } catch (err) {
      console.error('Registration error:', err); // Debug log
      console.error('Error response:', err.response); // Debug log
      
      setIsSubmitting(false);
      const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      
      // Set error state to true for error modal
      setIsError(true);
      setModalMessage(errorMsg);
      setShowSuccessModal(true);
      
      // If server returns field-specific errors
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="form-step"
          >
            <h3 className="step-title">Personal & Company Information</h3>
            <p className="step-description">Tell us about yourself and your organization</p>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="company">Company Name</label>
              <input
                type="text"
                name="company"
                id="company"
                placeholder="Enter your company name"
                value={form.company}
                onChange={handleChange}
                className={errors.company ? 'error' : ''}
              />
              {errors.company && <div className="error-message">{errors.company}</div>}
            </div>

            <div className="button-container">
              <button
                type="button"
                className="next-button"
                onClick={nextStep}
              >
                Continue
              </button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="form-step"
          >
            <h3 className="step-title">Account Credentials</h3>
            <p className="step-description">Set up your login credentials</p>

            <div className="form-group register-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your business email"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="form-group register-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="Create a secure password"
                  value={form.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle-button"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <div className="error-message">{errors.password}</div>}
              <small className="password-hint">Password must be at least 6 characters</small>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="terms"
                  checked={form.terms}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                <span className="checkbox-label">
                  I agree to the <a href="#terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> and <a href="#privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                </span>
              </label>
              {errors.terms && <div className="error-message">{errors.terms}</div>}
            </div>

            
            <div className="button-container">
              <button
                type="button"
                className="back-button"
                onClick={prevStep}
              >
                Back
              </button>
              <button
                type="submit"
                className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>Create Your Account</h2>
          <p className="register-subtitle">Join our business intelligence platform</p>
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              ></div>
            </div>
            <div className="step-indicators">
              {[...Array(totalSteps)].map((_, index) => (
                <div
                  key={index}
                  className={`step-dot ${index + 1 <= step ? 'active' : ''}`}
                >
                  <span className="step-number">{index + 1}</span>
                </div>
              ))}
            </div>
            <div className="step-labels">
              <span className={step >= 1 ? 'active' : ''}>Info</span>
              <span className={step >= 2 ? 'active' : ''}>Account</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {renderStep()}
        </form>

        <div className="register-footer">
          <p>Already have an account? <a href="/login">Sign in here</a></p>
        </div>
      </div>

      <div className="register-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className={`success-modal ${isError ? 'error-modal' : ''}`}>
            <button 
              className="modal-close-button" 
              onClick={closeModal}
              aria-label="Close modal"
            >
              <FaTimes />
            </button>
            <div className={`success-icon ${isError ? 'error-icon' : ''}`}>
              {isError ? '✗' : '✓'}
            </div>
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
  );
};

export default Register;