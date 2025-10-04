import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import styles from './AdminDashboard.module.css';
import { getAdmin } from './utils/adminAuth';

export default function ViewUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const admin = getAdmin();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/users/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err.response?.data);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeactivateUser = async (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        const token = sessionStorage.getItem('adminToken');
        await axios.patch(`http://localhost:5000/api/users/deactivate/${userId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('User deactivated successfully');
        fetchUsers();
      } catch (err) {
        setError('Failed to deactivate user');
      }
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      const token = sessionStorage.getItem('adminToken');
      await axios.patch(`http://localhost:5000/api/users/activate/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('User activated successfully');
      fetchUsers();
    } catch (err) {
      setError('Failed to activate user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      try {
        const token = sessionStorage.getItem('adminToken');
        await axios.delete(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('User deleted successfully');
        fetchUsers();
        setShowModal(false);
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return '#16a34a';
      case 'inactive':
        return '#64748b';
      case 'suspended':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
            View Users
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

          {/* Search and Filter */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                minWidth: '250px',
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                minWidth: '150px'
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

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
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Phone</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Joined</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{user.name}</td>
                    <td style={{ padding: '1rem' }}>{user.email}</td>
                    <td style={{ padding: '1rem' }}>{user.phone || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        backgroundColor: getStatusBadgeColor(user.status) + '20',
                        color: getStatusBadgeColor(user.status)
                      }}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => handleViewUser(user)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                {searchTerm || filterStatus !== 'all' 
                  ? 'No users found matching your search criteria.' 
                  : 'No users found.'
                }
              </div>
            )}
          </div>

          {/* User Details Modal */}
          {showModal && selectedUser && (
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
                maxWidth: '600px',
                maxHeight: '90vh',
                overflow: 'auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>User Details</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      color: '#64748b'
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ fontWeight: '600', color: '#374151' }}>Name:</label>
                    <p style={{ margin: '0.5rem 0' }}>{selectedUser.name}</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: '600', color: '#374151' }}>Email:</label>
                    <p style={{ margin: '0.5rem 0' }}>{selectedUser.email}</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: '600', color: '#374151' }}>Phone:</label>
                    <p style={{ margin: '0.5rem 0' }}>{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: '600', color: '#374151' }}>Status:</label>
                    <p style={{ margin: '0.5rem 0' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        backgroundColor: getStatusBadgeColor(selectedUser.status) + '20',
                        color: getStatusBadgeColor(selectedUser.status)
                      }}>
                        {selectedUser.status || 'active'}
                      </span>
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: '600', color: '#374151' }}>Address:</label>
                  <p style={{ margin: '0.5rem 0' }}>{selectedUser.address || 'N/A'}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ fontWeight: '600', color: '#374151' }}>Joined Date:</label>
                    <p style={{ margin: '0.5rem 0' }}>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: '600', color: '#374151' }}>Last Updated:</label>
                    <p style={{ margin: '0.5rem 0' }}>{new Date(selectedUser.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedUser.emergencyContact && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontWeight: '600', color: '#374151' }}>Emergency Contact:</label>
                    <p style={{ margin: '0.5rem 0' }}>{selectedUser.emergencyContact}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  {selectedUser.status !== 'inactive' ? (
                    <button
                      onClick={() => handleDeactivateUser(selectedUser._id)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#64748b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivateUser(selectedUser._id)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Activate
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteUser(selectedUser._id)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
