import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import styles from './AdminDashboard.module.css';
import { getAdmin } from './utils/adminAuth';

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const admin = getAdmin();

  useEffect(() => {
    fetchAdmins();
    fetchPendingAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = sessionStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter to only show approved admins in the active tab
      const approvedAdmins = (response.data.admins || []).filter(admin => admin.status === 'approved');
      setAdmins(approvedAdmins);
    } catch (err) {
      setError('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingAdmins = async () => {
    try {
      const token = sessionStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/admin/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingAdmins(response.data.pendingAdmins || []);
    } catch (err) {
      console.error('Failed to fetch pending admins');
    }
  };

  const handleApprove = async (adminId) => {
    try {
      const token = sessionStorage.getItem('adminToken');
      await axios.post(`http://localhost:5000/api/admin/approve/${adminId}`, 
        { action: 'approve' }, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSuccess('Admin approved successfully');
      fetchAdmins();
      fetchPendingAdmins();
    } catch (err) {
      console.error('Approve error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to approve admin');
    }
  };

  const handleReject = async (adminId) => {
    if (window.confirm('Are you sure you want to reject this admin application?')) {
      try {
        const token = sessionStorage.getItem('adminToken');
        await axios.post(`http://localhost:5000/api/admin/approve/${adminId}`, 
          { action: 'decline' }, 
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setSuccess('Admin application rejected');
        fetchPendingAdmins();
      } catch (err) {
        console.error('Reject error:', err.response?.data);
        setError(err.response?.data?.message || 'Failed to reject admin');
      }
    }
  };

  const handleDeactivate = async (adminId) => {
    if (window.confirm('Are you sure you want to deactivate this admin?')) {
      try {
        const token = sessionStorage.getItem('adminToken');
        await axios.patch(`http://localhost:5000/api/admin/deactivate/${adminId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Admin deactivated successfully');
        fetchAdmins();
      } catch (err) {
        setError('Failed to deactivate admin');
      }
    }
  };

  const handleActivate = async (adminId) => {
    try {
      const token = sessionStorage.getItem('adminToken');
      await axios.patch(`http://localhost:5000/api/admin/activate/${adminId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Admin activated successfully');
      fetchAdmins();
    } catch (err) {
      setError('Failed to activate admin');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin':
        return '#dc2626';
      case 'node_admin':
        return '#2563eb';
      case 'supervisor':
        return '#16a34a';
      default:
        return '#64748b';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'approved':
        return '#16a34a';
      case 'inactive':
        return '#64748b';
      case 'pending':
        return '#f59e0b';
      case 'declined':
        return '#dc2626';
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
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '2rem' }}>
            Manage Admins
          </h1>

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

          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            marginBottom: '2rem'
          }}>
            <button
              onClick={() => setActiveTab('active')}
              style={{
                padding: '1rem 2rem',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeTab === 'active' ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === 'active' ? '#3b82f6' : '#64748b',
                fontWeight: activeTab === 'active' ? '600' : '400',
                cursor: 'pointer'
              }}
            >
              Active Admins ({admins.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              style={{
                padding: '1rem 2rem',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeTab === 'pending' ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === 'pending' ? '#3b82f6' : '#64748b',
                fontWeight: activeTab === 'pending' ? '600' : '400',
                cursor: 'pointer'
              }}
            >
              Pending Approvals ({pendingAdmins.length})
            </button>
          </div>

          {/* Active Admins Tab */}
          {activeTab === 'active' && (
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
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Role</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((adminUser) => (
                    <tr key={adminUser._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem' }}>{adminUser.name}</td>
                      <td style={{ padding: '1rem' }}>{adminUser.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          backgroundColor: getRoleBadgeColor(adminUser.role) + '20',
                          color: getRoleBadgeColor(adminUser.role)
                        }}>
                          {adminUser.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          backgroundColor: getStatusBadgeColor(adminUser.status) + '20',
                          color: getStatusBadgeColor(adminUser.status)
                        }}>
                          {adminUser.status || 'approved'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {adminUser._id !== admin._id && (
                            <>
                              {adminUser.status === 'approved' ? (
                                <button
                                  onClick={() => handleDeactivate(adminUser._id)}
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
                                  Deactivate
                                </button>
                              ) : adminUser.status === 'inactive' ? (
                                <button
                                  onClick={() => handleActivate(adminUser._id)}
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
                              ) : null}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {admins.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  No active admins found.
                </div>
              )}
            </div>
          )}

          {/* Pending Admins Tab */}
          {activeTab === 'pending' && (
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
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Role</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Applied Date</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingAdmins.map((adminUser) => (
                    <tr key={adminUser._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem' }}>{adminUser.name}</td>
                      <td style={{ padding: '1rem' }}>{adminUser.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          backgroundColor: getRoleBadgeColor(adminUser.role) + '20',
                          color: getRoleBadgeColor(adminUser.role)
                        }}>
                          {adminUser.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {adminUser.createdAt ? 
                          new Date(adminUser.createdAt).toLocaleDateString() : 
                          'N/A'
                        }
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleApprove(adminUser._id)}
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
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(adminUser._id)}
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
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pendingAdmins.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  No pending admin applications.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
