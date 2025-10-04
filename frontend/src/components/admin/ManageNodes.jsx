import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import styles from './AdminDashboard.module.css';
import { getAdmin } from './utils/adminAuth';

export default function ManageNodes() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [form, setForm] = useState({
    name: '',
    location: '',
    address: '',
    contactPerson: '',
    contactNumber: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const admin = getAdmin();

  useEffect(() => {
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    try {
      const token = sessionStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/node', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNodes(response.data.nodes || []);
    } catch (err) {
      setError('Failed to fetch nodes');
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
      if (editingNode) {
        await axios.put(`http://localhost:5000/api/node/${editingNode._id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Node updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/node', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Node created successfully');
      }
      
      resetForm();
      fetchNodes();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (node) => {
    setEditingNode(node);
    setForm({
      name: node.name,
      location: node.location,
      address: node.address,
      contactPerson: node.contactPerson,
      contactNumber: node.contactNumber,
      email: node.email
    });
    setShowForm(true);
  };

  const handleDelete = async (nodeId) => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      try {
        const token = sessionStorage.getItem('adminToken');
        await axios.delete(`http://localhost:5000/api/node/${nodeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Node deleted successfully');
        fetchNodes();
      } catch (err) {
        setError('Failed to delete node');
      }
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      location: '',
      address: '',
      contactPerson: '',
      contactNumber: '',
      email: ''
    });
    setEditingNode(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>Manage Nodes</h1>
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
              Add New Node
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
                  {editingNode ? 'Edit Node' : 'Add New Node'}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Node Name
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
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
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
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      required
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Contact Person
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={form.contactPerson}
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
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={form.contactNumber}
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
                  <div style={{ marginBottom: '1.5rem' }}>
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
                      {editingNode ? 'Update' : 'Create'}
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
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Location</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Contact Person</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Contact Number</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node) => (
                  <tr key={node._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '1rem' }}>{node.name}</td>
                    <td style={{ padding: '1rem' }}>{node.location}</td>
                    <td style={{ padding: '1rem' }}>{node.contactPerson}</td>
                    <td style={{ padding: '1rem' }}>{node.contactNumber}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEdit(node)}
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
                        <button
                          onClick={() => handleDelete(node._id)}
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
            {nodes.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                No nodes found. Add your first node to get started.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
