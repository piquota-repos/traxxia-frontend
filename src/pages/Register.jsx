import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';
import '../styles/Register.css';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    gender: '',
    terms: false,
    email: '',
    password: ''
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
      if (!form.name.trim()) newErrors.name = 'Name is required';
      if (!form.description.trim()) newErrors.description = 'Description is required';
      if (!form.gender) newErrors.gender = 'Please select a gender';
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

      if (!form.terms) {
        newErrors.terms = 'You must agree to the terms and conditions';
      }
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
    
    if (!validateStep(step)) return;
    
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/register`, form);
      setIsSubmitting(false);
      
      // Show success modal
      setModalMessage('Registration successful!');
      setIsError(false);
      setShowSuccessModal(true);
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
    } catch (err) {
      setIsSubmitting(false);
      const errorMsg = err.response?.data?.message || 'Registration failed';
      console.log(err.response?.data?.message);
      
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
            <h3 className="step-title">Personal Information</h3>
            <p className="step-description">Tell us about yourself</p>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="description">About You</label>
              <textarea
                name="description"
                id="description"
                placeholder="Tell us a bit about yourself"
                value={form.description}
                onChange={handleChange}
                className={errors.description ? 'error' : ''}
                rows="4"
              />
              {errors.description && <div className="error-message">{errors.description}</div>}
            </div>

            <div className="form-group">
              <label>Gender</label>
              <div className="radio-group">
                <label className={`radio-option ${form.gender === 'Male' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    onChange={handleChange}
                    checked={form.gender === 'Male'}
                  />
                  <span className="radio-label">Male</span>
                </label>

                <label className={`radio-option ${form.gender === 'Female' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    onChange={handleChange}
                    checked={form.gender === 'Female'}
                  />
                  <span className="radio-label">Female</span>
                </label>
              </div>
              {errors.gender && <div className="error-message">{errors.gender}</div>}
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
            <h3 className="step-title">Account Details</h3>
            <p className="step-description">Set up your login credentials</p>

            <div className="form-group register-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
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
                  placeholder="Enter your password"
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
                  I agree to the <a href="#terms">terms and conditions</a>
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
                {isSubmitting ? 'Registering...' : 'Create Account'}
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
          <h2>Create an Account</h2>
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
                ></div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {renderStep()}
        </form>

        <div className="register-footer">
          <p>Already have an account? <a href="/login">Sign in</a></p>
        </div>
      </div>

      <div className="register-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="success-modal">
            <button 
              className="modal-close-button" 
              onClick={closeModal}
              aria-label="Close modal"
            >
              <FaTimes />
            </button>
            <div className="success-icon">{isError ? '✗' : '✓'}</div>
            <h3>{isError ? 'Failed' : 'Success!'}</h3>
            <p>{modalMessage}</p>
            {!isError && <p className="redirect-text">Redirecting to login page...</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;