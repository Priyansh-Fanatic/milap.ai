import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './AdminLogin.module.css';

export default function AdminLogin({ setAdmin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in both email and password.');
      return;
    }
    try {
      const res = await axios.post('http://localhost:5000/api/admin/login', form);
      sessionStorage.setItem('adminToken', res.data.token);
      sessionStorage.setItem('admin', JSON.stringify(res.data.admin));
      setAdmin(res.data.admin);
      window.location.href = '/admin/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };
  return (
    <div className={styles.adminLoginContainer}>
      <form className={styles.adminLoginCard} onSubmit={handleSubmit}>
        <div className={styles.backButtonContainer}>
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className={styles.backButton}
          >
            ← Back to Home
          </button>
        </div>
        <div className={styles.adminLoginTitle}>Admin Login</div>
        {error && <div className={styles.adminLoginError}>{error}</div>}
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className={styles.adminLoginInput}
          autoComplete="username"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className={styles.adminLoginInput}
          autoComplete="current-password"
        />
        <button type="submit" className={styles.adminLoginButton}>Login</button>
        <div className={styles.adminLoginLinks}>
          <span>Don't have an admin account? </span>
          <Link to="/admin/register" className={styles.adminLoginLink}>
            Create Admin Account
          </Link>
        </div>
      </form>
    </div>
  );
} 