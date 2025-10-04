import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import styles from './AdminDashboard.module.css';
import { getAdmin } from './utils/adminAuth';
import { FaUsers, FaFileAlt, FaCheckCircle, FaHourglassHalf, FaSitemap, FaUserShield } from 'react-icons/fa';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCases: 0,
    pendingCases: 0,
    approvedCases: 0,
    totalNodes: 0,
    totalAdmins: 0,
    recentCases: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [coordinateUpdateLoading, setCoordinateUpdateLoading] = useState(false);

  const admin = getAdmin();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      const token = sessionStorage.getItem('adminToken');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }
      
      console.log('🔄 Fetching dashboard stats...');
      const response = await axios.get('http://localhost:5000/api/admin/dashboard/stats', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Dashboard response:', response.data);
      setStats(response.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch dashboard statistics');
      }
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <div style={{
        padding: '1rem',
        borderRadius: '0.75rem',
        backgroundColor: color + '20',
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div>
        <h3 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          margin: 0, 
          color: '#1e293b' 
        }}>
          {loading ? '...' : value}
        </h3>
        <p style={{ 
          margin: '0.25rem 0 0 0', 
          color: '#64748b', 
          fontSize: '0.875rem',
          fontWeight: '500'
        }}>
          {title}
        </p>
        {subtitle && (
          <p style={{ 
            margin: '0.25rem 0 0 0', 
            color: '#94a3b8', 
            fontSize: '0.75rem'
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'approved':
        return '#16a34a';
      case 'rejected':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      case 'resolved':
        return '#3b82f6';
      default:
        return '#64748b';
    }
  };

  const handleViewDocument = async (caseId, docType) => {
    console.log('🔍 Dashboard - View document clicked:', { caseId, docType });
    
    try {
      const token = sessionStorage.getItem('adminToken');
      if (!token) {
        console.error('❌ No token found');
        setError('No authentication token found. Please login again.');
        return;
      }

      console.log('🔑 Token found, making request...');
      
      // Create a secure document viewing request
      const url = `http://localhost:5000/api/cases/admin/document/${caseId}/${docType}`;
      console.log('📡 Request URL:', url);
      
      try {
        // Use fetch with authentication to get the document
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📥 Response status:', response.status);
        console.log('📥 Response ok:', response.ok);

        if (!response.ok) {
          if (response.status === 401) {
            console.error('❌ Authentication failed');
            setError('Authentication failed. Please login again.');
            return;
          }
          const errorText = await response.text();
          console.error('❌ Response error:', errorText);
          throw new Error(`Failed to fetch ${docType === 'image' ? 'photo' : 'FIR report'}: ${response.status}`);
        }

        console.log('✅ Response successful, creating blob...');
        const blob = await response.blob();
        console.log('✅ Blob created, size:', blob.size);
        
        const blobUrl = URL.createObjectURL(blob);
        console.log('✅ Blob URL created:', blobUrl);
        
        // Set document data for modal display
        setDocumentData(blobUrl);
        setDocumentType(docType);
        setShowDocumentModal(true);

        console.log('✅ Document modal opened');
        
      } catch (fetchError) {
        console.error('❌ Fetch error:', fetchError);
        setError(`Failed to load ${docType === 'image' ? 'photo' : 'FIR report'}. Please try again.`);
      }
    } catch (error) {
      console.error('❌ General error:', error);
      setError('Failed to open document viewer.');
    }
  };

  const handleQuickResolve = async (caseId, caseName) => {
    try {
      const reason = prompt(`Resolve case for ${caseName}?\nReason (optional):`) || 'Person found';
      const foundLocation = prompt('Where was the person found? (optional):') || '';
      const foundDate = prompt('When was the person found? (YYYY-MM-DD, optional):') || new Date().toISOString().split('T')[0];
      
      if (!reason) return; // User cancelled
      
      const resolutionData = {
        reason,
        foundLocation,
        foundDate
      };
      
      if (window.confirm(`Resolve case for ${caseName}?\nReason: ${reason}\nLocation: ${foundLocation || 'Not specified'}\nDate: ${foundDate}`)) {
        const token = sessionStorage.getItem('adminToken');
        if (!token) {
          setError('No authentication token found. Please login again.');
          return;
        }
        
        await axios.patch(`http://localhost:5000/api/cases/resolve/${caseId}`, 
          resolutionData, 
          { 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        
        setError(''); // Clear any errors
        // Refresh dashboard stats to reflect the change
        fetchDashboardStats();
        alert('Case resolved successfully!');
      }
    } catch (err) {
      console.error('Quick resolve error:', err.response?.data);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to resolve case');
      }
    }
  };

  const handleUpdateCoordinates = async () => {
    if (!window.confirm('This will update coordinates for all approved cases. This may take a few minutes. Continue?')) {
      return;
    }

    try {
      setCoordinateUpdateLoading(true);
      setError('');
      
      const token = sessionStorage.getItem('adminToken');
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      console.log('🔄 Starting bulk coordinate update...');
      const response = await axios.post('http://localhost:5000/api/cases/admin/update-coordinates', {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Coordinate update response:', response.data);
      
      if (response.data.success) {
        const { results } = response.data;
        alert(`Coordinate update completed!\nUpdated: ${results.updated}/${results.total} cases\nErrors: ${results.errors.length}`);
        
        if (results.errors.length > 0) {
          console.log('❌ Errors during update:', results.errors);
        }
      }
      
    } catch (err) {
      console.error('Coordinate update error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to update coordinates');
      }
    } finally {
      setCoordinateUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.adminDashboardContainer}>
        <Sidebar role={admin.role} />
        <main className={styles.adminDashboardMain}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.125rem', color: '#64748b' }}>Loading dashboard...</div>
            </div>
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
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
              Dashboard
            </h1>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
              Welcome back, {admin.name}! Here's what's happening today.
            </p>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '2rem',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {admin.role === 'supervisor' && (
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon={<FaUsers size={24} />}
                color="#3b82f6"
                subtitle="Registered platform users"
              />
            )}
            
            <StatCard
              title="Total Cases"
              value={stats.totalCases}
              icon={<FaFileAlt size={24} />}
              color="#8b5cf6"
              subtitle="All reported cases"
            />

            <StatCard
              title="Pending Cases"
              value={stats.pendingCases}
              icon={<FaHourglassHalf size={24} />}
              color="#f59e0b"
              subtitle="Awaiting approval"
            />

            <StatCard
              title="Approved Cases"
              value={stats.approvedCases}
              icon={<FaCheckCircle size={24} />}
              color="#16a34a"
              subtitle="Active investigations"
            />

            {admin.role === 'super_admin' && (
              <>
                <StatCard
                  title="Total Nodes"
                  value={stats.totalNodes}
                  icon={<FaSitemap size={24} />}
                  color="#ef4444"
                  subtitle="Regional offices"
                />
                <StatCard
                  title="Total Admins"
                  value={stats.totalAdmins}
                  icon={<FaUserShield size={24} />}
                  color="#06b6d4"
                  subtitle="System administrators"
                />
              </>
            )}
          </div>

          {/* Recent Cases */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>
                Recent Cases
              </h2>
            </div>
            
            {stats.recentCases && stats.recentCases.length > 0 ? (
              <div style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Case ID</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Name</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Location</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Date</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentCases.slice(0, 5).map((caseItem, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem', color: '#64748b' }}>
                          {caseItem.caseId || caseItem._id.slice(-8)}
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '500' }}>{caseItem.name}</td>
                        <td style={{ padding: '1rem' }}>{caseItem.lastSeenLocation}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            backgroundColor: getStatusBadgeColor(caseItem.status) + '20',
                            color: getStatusBadgeColor(caseItem.status)
                          }}>
                            {caseItem.status || 'pending'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {new Date(caseItem.dateReported || caseItem.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => handleViewDocument(caseItem._id, 'image')}
                              style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.25rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}
                              title="View Person Photo"
                            >
                              📷
                            </button>
                            <button
                              onClick={() => handleViewDocument(caseItem._id, 'fir-report')}
                              style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#16a34a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.25rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}
                              title="View FIR Report Image"
                            >
                              📄
                            </button>
                            {(caseItem.status === 'approved' || caseItem.status === 'pending') && (
                              <button
                                onClick={() => handleQuickResolve(caseItem._id, caseItem.name)}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  backgroundColor: '#8b5cf6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '0.25rem',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  fontWeight: '500'
                                }}
                                title="Resolve Case (Person Found)"
                              >
                                ✅
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                No recent cases to display.
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
              Quick Actions
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {admin.role === 'super_admin' && (
                <>
                  <button
                    onClick={() => window.location.href = '/admin/nodes'}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}
                  >
                    Manage Nodes
                  </button>
                  <button
                    onClick={() => window.location.href = '/admin/admins'}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}
                  >
                    Manage Admins
                  </button>
                </>
              )}
              
              {admin.role === 'node_admin' && (
                <button
                  onClick={() => window.location.href = '/admin/supervisors'}
                  style={{
                    padding: '1rem',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}
                >
                  Manage Supervisors
                </button>
              )}

              <button
                onClick={() => window.location.href = '/admin/cases'}
                style={{
                  padding: '1rem',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textAlign: 'center'
                }}
              >
                Review Cases
              </button>

              {(admin.role === 'super_admin' || admin.role === 'node_admin') && (
                <button
                  onClick={handleUpdateCoordinates}
                  disabled={coordinateUpdateLoading}
                  style={{
                    padding: '1rem',
                    backgroundColor: coordinateUpdateLoading ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: coordinateUpdateLoading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {coordinateUpdateLoading && (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  )}
                  {coordinateUpdateLoading ? 'Updating...' : '🌍 Update Coordinates'}
                </button>
              )}

              {admin.role === 'supervisor' && (
                <button
                  onClick={() => window.location.href = '/admin/users'}
                  style={{
                    padding: '1rem',
                    backgroundColor: '#06b6d4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}
                >
                  View Users
                </button>
              )}
            </div>
          </div>

          {/* Document Viewing Modal */}
          {showDocumentModal && documentData && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1001
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '1rem',
                width: '90vw',
                height: '90vh',
                maxWidth: '900px',
                maxHeight: '800px',
                overflow: 'auto',
                position: 'relative'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '1rem',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '1rem'
                }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                    {documentType === 'image' ? '📷 Person Photo' : '📋 FIR Report Image'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowDocumentModal(false);
                      if (documentData) {
                        URL.revokeObjectURL(documentData);
                      }
                      setDocumentData(null);
                      setDocumentType('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '2rem',
                      cursor: 'pointer',
                      color: '#64748b',
                      padding: '0.5rem'
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: 'calc(100% - 80px)'
                }}>
                  <img
                    src={documentData}
                    alt={documentType === 'image' ? 'Person Photo' : 'FIR Report'}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 