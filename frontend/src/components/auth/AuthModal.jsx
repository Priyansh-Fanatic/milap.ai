import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, LogIn, UserPlus } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:5000/api/auth";

const AuthModal = ({ isOpen, onClose, mode = 'login', setUser }) => {
  const [currentMode, setCurrentMode] = useState(mode);
  const [form, setForm] = useState({
    name: '',
    username: '',
    adhaarNumber: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (currentMode === 'login') {
        // Login validation
        if (!form.email || !form.password) {
          setError('Please fill all fields');
          setLoading(false);
          return;
        }
        response = await axios.post(`${API_URL}/login`, {
          email: form.email,
          password: form.password
        });
      } else {
        // Register validation
        if (!form.name || !form.username || !form.adhaarNumber || !form.email || !form.password) {
          setError('Please fill all fields');
          setLoading(false);
          return;
        }
        if (form.password.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }
        response = await axios.post(`${API_URL}/register`, form);
      }

      const { token, user } = response.data;
      
      // Store in sessionStorage
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      
      // Update parent component
      if (setUser) setUser(user);
      
      // Close modal and navigate
      onClose();
      navigate('/profile');
      
    } catch (err) {
      console.error('Authentication error:', err);
      setError(
        err.response?.data?.message || 
        `${currentMode === 'login' ? 'Login' : 'Registration'} failed. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth Success
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/google`, {
        credential: credentialResponse.credential
      });

      const { token, user } = response.data;
      
      // Store in sessionStorage
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      
      // Update parent component
      if (setUser) setUser(user);
      
      // Close modal and navigate
      onClose();
      navigate('/profile');
      
    } catch (err) {
      console.error('Google authentication error:', err);
      setError(
        err.response?.data?.message || 
        'Google authentication failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth Error
  const handleGoogleError = () => {
    setError('Google authentication failed. Please try again.');
  };

  const switchMode = () => {
    setCurrentMode(currentMode === 'login' ? 'register' : 'login');
    setError('');
    setForm({
      name: '',
      username: '',
      adhaarNumber: '',
      email: form.email, // Keep email when switching
      password: ''
    });
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      >
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
            <div className="flex items-center space-x-3">
              {currentMode === 'login' ? (
                <LogIn className="text-indigo-600 dark:text-indigo-400" size={24} />
              ) : (
                <UserPlus className="text-indigo-600 dark:text-indigo-400" size={24} />
              )}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {currentMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {currentMode === 'login' 
                ? 'Sign in to access your account and report missing persons'
                : 'Join our community to help find missing persons'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Register-only fields */}
            {currentMode === 'register' && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required={currentMode === 'register'}
                    disabled={loading}
                  />
                </div>
                
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required={currentMode === 'register'}
                    disabled={loading}
                  />
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    name="adhaarNumber"
                    placeholder="Aadhaar Number (12 digits)"
                    value={form.adhaarNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setForm({ ...form, adhaarNumber: value });
                      setError('');
                    }}
                    className="w-full pl-4 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    maxLength={12}
                    required={currentMode === 'register'}
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {/* Email field */}
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-4 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            {/* Password field */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                name="password"
                placeholder={currentMode === 'register' ? 'Password (min 6 characters)' : 'Password'}
                value={form.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                disabled={loading}
                minLength={currentMode === 'register' ? 6 : undefined}
              />
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transform hover:scale-[1.02]'
              }`}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{currentMode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
                </div>
              ) : (
                currentMode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </motion.button>
          </form>

          {/* Separator */}
          <div className="px-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          {/* Google Login Button */}
          <div className="px-6 pb-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              text={currentMode === 'login' ? 'signin_with' : 'signup_with'}
              shape="rectangular"
              theme="outline"
              size="large"
              width="100%"
            />
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 text-center border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={switchMode}
                className="ml-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold hover:underline"
              >
                {currentMode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
