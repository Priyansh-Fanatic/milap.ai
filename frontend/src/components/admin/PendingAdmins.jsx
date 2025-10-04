import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import styles from './AdminDashboard.module.css';
import { getAdmin, getAdminToken } from './utils/adminAuth';

export default function PendingAdmins() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const admin = getAdmin();

  useEffect(() => {
    async function fetchPending() {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('http://localhost:5000/api/admin/pending', {
          headers: { Authorization: `Bearer ${getAdminToken()}` }
        });
        setPending(res.data.pendingAdmins);
      } catch (err) {
        setError('Failed to fetch pending admins.');
      } finally {
        setLoading(false);
      }
    }
    fetchPending();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await axios.post(`/api/admin/approve/${id}`, { action }, {
        headers: { Authorization: `Bearer ${getAdminToken()}` }
      });
      setPending(pending.filter(a => a._id !== id));
    } catch {
      setError('Failed to update admin status.');
    }
  };

  return (
    <div className={styles.adminDashboardContainer}>
      <Sidebar role={admin.role} />
      <main className={styles.adminDashboardMain}>
        <div className={styles.adminDashboardWelcome}>Pending Admin Applications</div>
        {error && <div className={styles.adminRegisterError}>{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : pending.length === 0 ? (
          <div>No pending admin applications.</div>
        ) : (
          <div style={{ width: '100%', maxWidth: 700 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ padding: '0.7rem' }}>Name</th>
                  <th style={{ padding: '0.7rem' }}>Email</th>
                  <th style={{ padding: '0.7rem' }}>Role</th>
                  <th style={{ padding: '0.7rem' }}>Node</th>
                  <th style={{ padding: '0.7rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(a => (
                  <tr key={a._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.7rem' }}>{a.name}</td>
                    <td style={{ padding: '0.7rem' }}>{a.email}</td>
                    <td style={{ padding: '0.7rem' }}>{a.role}</td>
                    <td style={{ padding: '0.7rem' }}>{a.node || '-'}</td>
                    <td style={{ padding: '0.7rem' }}>
                      <button
                        className={styles.adminRegisterButton}
                        style={{ marginRight: 8, padding: '0.4rem 1.1rem', fontSize: '1rem' }}
                        onClick={() => handleAction(a._id, 'approve')}
                      >Approve</button>
                      <button
                        className={styles.adminRegisterButton}
                        style={{ background: '#ef4444', marginLeft: 0, padding: '0.4rem 1.1rem', fontSize: '1rem' }}
                        onClick={() => handleAction(a._id, 'decline')}
                      >Decline</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
} 