import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './AdminRegister.module.css';

const roleOptions = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'node_admin', label: 'Node Admin' },
  { value: 'supervisor', label: 'Supervisor' },
];

export default function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'node_admin',
    node: '',
  });
  const [nodes, setNodes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/node/public')
      .then(res => {
        console.log('Nodes fetched:', res.data.nodes);
        setNodes(res.data.nodes);
      })
      .catch(error => {
        console.error('Error fetching nodes:', error);
        setNodes([]);
      });
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'role' && value === 'super_admin') {
      setForm(prev => ({ ...prev, node: '' }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (form.role === 'super_admin') delete payload.node;
      await axios.post('http://localhost:5000/api/admin/register', payload);
      setSuccess('Your application has been submitted and is pending approval.');
      setSubmitted(true);
      setForm({ name: '', email: '', password: '', role: 'node_admin', node: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminRegisterContainer}>
      <form className={styles.adminRegisterCard} onSubmit={handleSubmit}>
        <div className={styles.backButtonContainer}>
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className={styles.backButton}
          >
            ← Back to Home
          </button>
        </div>
        <div className={styles.adminRegisterTitle}>Register New Admin</div>
        {error && <div className={styles.adminRegisterError}>{error}</div>}
        {success && <div className={styles.adminRegisterSuccess}>{success}</div>}
        {!submitted && <>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className={styles.adminRegisterInput}
            required
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className={styles.adminRegisterInput}
            required
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className={styles.adminRegisterInput}
            required
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className={styles.adminRegisterInput}
            required
          >
            {roleOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {form.role !== 'super_admin' && (
            <select
              name="node"
              value={form.node}
              onChange={handleChange}
              className={styles.adminRegisterInput}
              required
            >
              <option value="">Select Node</option>
              {nodes.map(node => (
                <option key={node._id} value={node._id}>{node.name}</option>
              ))}
            </select>
          )}
          <button type="submit" className={styles.adminRegisterButton} disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          <div className={styles.adminRegisterLinks}>
            <span>Already have an admin account? </span>
            <Link to="/admin/login" className={styles.adminRegisterLink}>
              Login Here
            </Link>
          </div>
        </>}
      </form>
    </div>
  );
} 