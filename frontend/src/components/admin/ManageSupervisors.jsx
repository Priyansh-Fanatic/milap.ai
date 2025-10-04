import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import styles from './AdminDashboard.module.css';
import { getAdmin } from './utils/adminAuth';

export default function ManageSupervisors() {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    contactNumber: '',
    department: '',
    employeeId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const admin = getAdmin();

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    try {
      const token = sessionStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/admin/supervisors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSupervisors(response.data.supervisors || []);
    } catch (err) {
      setError('Failed to fetch supervisors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = sessionStorage.getItem('adminToken');
      const payload = {
        ...form,
        role: 'supervisor'
      };

      if (editingSupervisor) {
        // Remove password if empty during edit
        if (!form.password) {
          delete payload.password;
        }
        await axios.put(`http://localhost:5000/api/admin/supervisor/${editingSupervisor._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Supervisor updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/admin/supervisor', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Supervisor created successfully');
      }
      
      resetForm();
      fetchSupervisors();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (supervisor) => {
    setEditingSupervisor(supervisor);
    setForm({
      name: supervisor.name,
      email: supervisor.email,
      password: '', // Don't populate password for security
      contactNumber: supervisor.contactNumber || '',
      department: supervisor.department || '',
      employeeId: supervisor.employeeId || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (supervisorId) => {
    if (window.confirm('Are you sure you want to delete this supervisor?')) {
      try {
        const token = sessionStorage.getItem('adminToken');
        await axios.delete(`http://localhost:5000/api/admin/supervisor/${supervisorId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Supervisor deleted successfully');
        fetchSupervisors();
      } catch (err) {
        setError('Failed to delete supervisor');
      }
    }
  };

  const handleActivate = async (supervisorId) => {
    try {
      const token = sessionStorage.getItem('adminToken');
      await axios.patch(`http://localhost:5000/api/admin/activate/${supervisorId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Supervisor activated successfully');
      fetchSupervisors();
    } catch (err) {
      setError('Failed to activate supervisor');
    }
  };

  const handleDeactivate = async (supervisorId) => {
    try {
      const token = sessionStorage.getItem('adminToken');
      await axios.patch(`http://localhost:5000/api/admin/deactivate/${supervisorId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Supervisor deactivated successfully');
      fetchSupervisors();
    } catch (err) {
      setError('Failed to deactivate supervisor');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      password: '',
      contactNumber: '',
      department: '',
      employeeId: ''
    });
    setEditingSupervisor(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return '#16a34a';
      case 'inactive':
        return '#64748b';
      default:
        return '#64748b';
    }
  };

  if (loading) {
    return (
      <div className={styles.adminDashboardContainer}>
        <Sidebar role={admin.role} />
        <main className={styles.adminDashboardMain}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            Loading...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.adminDashboardContainer}>
      <Sidebar role={admin.role} />
      <main className={styles.adminDashboardMain}>
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>Manage Supervisors</h1>
            <button
              onClick={() => setShowForm(true)}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Add New Supervisor
            </button>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid #bbf7d0'
            }}>
              {success}
            </div>
          )}

          {showForm && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '1rem',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflow: 'auto'
              }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {editingSupervisor ? 'Edit Supervisor' : 'Add New Supervisor'}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Password {editingSupervisor && <span style={{ fontSize: '0.875rem', color: '#64748b' }}>(leave empty to keep current)</span>}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required={!editingSupervisor}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={form.contactNumber}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Employee ID
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      value={form.employeeId}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={resetForm}
                      style={{
                        padding: '0.75rem 1.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        backgroundColor: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      {editingSupervisor ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Department</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Employee ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {supervisors.map((supervisor) => (
                  <tr key={supervisor._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '1rem' }}>{supervisor.name}</td>
                    <td style={{ padding: '1rem' }}>{supervisor.email}</td>
                    <td style={{ padding: '1rem' }}>{supervisor.department || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>{supervisor.employeeId || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        backgroundColor: getStatusBadgeColor(supervisor.status) + '20',
                        color: getStatusBadgeColor(supervisor.status)
                      }}>
                        {supervisor.status || 'active'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEdit(supervisor)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          Edit
                        </button>
                        {supervisor.status !== 'inactive' ? (
                          <button
                            onClick={() => handleDeactivate(supervisor._id)}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#64748b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.25rem',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(supervisor._id)}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#16a34a',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.25rem',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(supervisor._id)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {supervisors.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                No supervisors found. Add your first supervisor to get started.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
