import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import styles from './AdminDashboard.module.css';
import { getAdmin } from './utils/adminAuth';

export default function ApproveCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('pending');

  const admin = getAdmin();

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      const token = sessionStorage.getItem('adminToken');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }
      
      // Use the cases/admin/by-status endpoint
      const url = `http://localhost:5000/api/cases/admin/by-status?status=${filter}`;
        
      console.log('Fetching cases from:', url);
      console.log('Using token:', token?.substring(0, 10) + '...');
      
      const response = await axios.get(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Cases response:', response.data);
      setCases(response.data.cases || []);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Fetch cases error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
        // Could redirect to login here
      } else {
        setError(err.response?.data?.message || 'Failed to fetch cases');
      }
      setCases([]); // Clear cases on error
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleApprove = async (caseId) => {
    try {
      setError(''); // Clear any previous errors
      const token = sessionStorage.getItem('adminToken');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }
      
      await axios.patch(`http://localhost:5000/api/cases/approve/${caseId}`, {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setSuccess('Case approved successfully');
      fetchCases();
      setShowModal(false);
    } catch (err) {
      console.error('Approve error:', err.response?.data);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to approve case');
      }
    }
  };

  const handleReject = async (caseId, reason) => {
    try {
      setError(''); // Clear any previous errors
      const token = sessionStorage.getItem('adminToken');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }
      
      await axios.patch(`http://localhost:5000/api/cases/reject/${caseId}`, 
        { reason }, 
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      setSuccess('Case rejected successfully');
      fetchCases();
      setShowModal(false);
    } catch (err) {
      console.error('Reject error:', err.response?.data);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to reject case');
      }
    }
  };

  const handleResolve = async (caseId, resolutionData) => {
    try {
      setError(''); // Clear any previous errors
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
      setSuccess('Case resolved successfully');
      fetchCases();
      setShowModal(false);
    } catch (err) {
      console.error('Resolve error:', err.response?.data);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to resolve case');
      }
    }
  };

  const handleViewCase = (caseItem) => {
    setSelectedCase(caseItem);
    setShowModal(true);
  };

  const handleViewDocument = async (caseId, docType) => {
    console.log('🔍 View document clicked:', { caseId, docType });
    
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

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#16a34a';
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
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
              Approve Cases
            </h1>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            >
              <option value="pending">Pending Cases</option>
              <option value="approved">Approved Cases</option>
              <option value="rejected">Rejected Cases</option>
              <option value="resolved">Resolved Cases</option>
              <option value="all">All Cases</option>
            </select>
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

          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Case ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Age</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Location</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Priority</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((caseItem) => (
                  <tr key={caseItem._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem', color: '#64748b' }}>
                      {caseItem.caseId || caseItem._id.slice(-8)}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{caseItem.name}</td>
                    <td style={{ padding: '1rem' }}>{caseItem.age}</td>
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
                      {caseItem.resolutionRequested && caseItem.status !== 'resolved' && (
                        <div style={{ marginTop: '0.25rem' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            backgroundColor: '#f59e0b20',
                            color: '#f59e0b',
                            display: 'inline-block'
                          }}>
                            🕒 Resolution Requested
                          </span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        backgroundColor: getPriorityBadgeColor(caseItem.priority) + '20',
                        color: getPriorityBadgeColor(caseItem.priority)
                      }}>
                        {caseItem.priority || 'medium'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {new Date(caseItem.dateReported || caseItem.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => handleViewCase(caseItem)}
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
            {cases.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                No cases found for the selected filter.
              </div>
            )}
          </div>

          {/* Case Details Modal */}
          {showModal && selectedCase && (
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
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Case Details</h2>
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
                    <p style={{ margin: '0.5rem 0' }}>{selectedCase.name}</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: '600', color: '#374151' }}>Age:</label>
                    <p style={{ margin: '0.5rem 0' }}>{selectedCase.age}</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: '600', color: '#374151' }}>Gender:</label>
                    <p style={{ margin: '0.5rem 0' }}>{selectedCase.gender}</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: '600', color: '#374151' }}>Contact:</label>
                    <p style={{ margin: '0.5rem 0' }}>{selectedCase.contactNumber}</p>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: '600', color: '#374151' }}>Last Seen Location:</label>
                  <p style={{ margin: '0.5rem 0' }}>{selectedCase.lastSeenLocation}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: '600', color: '#374151' }}>Description:</label>
                  <p style={{ margin: '0.5rem 0' }}>{selectedCase.description}</p>
                </div>

                {/* Resolution Request Information */}
                {selectedCase.resolutionRequested && selectedCase.status !== 'resolved' && (
                  <div style={{ 
                    marginBottom: '1.5rem', 
                    padding: '1rem', 
                    backgroundColor: '#fef3c7', 
                    borderRadius: '0.5rem',
                    border: '1px solid #f59e0b'
                  }}>
                    <h4 style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>
                      🕒 Resolution Request Pending
                    </h4>
                    <p style={{ color: '#92400e', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                      <strong>Requested on:</strong> {new Date(selectedCase.resolutionRequestDate).toLocaleDateString()}
                    </p>
                    <p style={{ color: '#92400e', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                      <strong>Reason:</strong> {selectedCase.resolutionRequestReason}
                    </p>
                    {selectedCase.requestedFoundLocation && (
                      <p style={{ color: '#92400e', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                        <strong>Found Location:</strong> {selectedCase.requestedFoundLocation}
                      </p>
                    )}
                    {selectedCase.requestedFoundDate && (
                      <p style={{ color: '#92400e', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                        <strong>Found Date:</strong> {new Date(selectedCase.requestedFoundDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Resolution Information (if already resolved) */}
                {selectedCase.status === 'resolved' && (
                  <div style={{ 
                    marginBottom: '1.5rem', 
                    padding: '1rem', 
                    backgroundColor: '#dbeafe', 
                    borderRadius: '0.5rem',
                    border: '1px solid #3b82f6'
                  }}>
                    <h4 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>
                      ✅ Case Resolved - Person Found!
                    </h4>
                    <p style={{ color: '#1e40af', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                      <strong>Resolved on:</strong> {new Date(selectedCase.resolvedAt).toLocaleDateString()}
                    </p>
                    <p style={{ color: '#1e40af', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                      <strong>Reason:</strong> {selectedCase.resolutionReason}
                    </p>
                    {selectedCase.foundLocation && (
                      <p style={{ color: '#1e40af', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                        <strong>Found Location:</strong> {selectedCase.foundLocation}
                      </p>
                    )}
                    {selectedCase.foundDate && (
                      <p style={{ color: '#1e40af', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                        <strong>Found Date:</strong> {new Date(selectedCase.foundDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Verification Documents Section */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: '600', color: '#374151', marginBottom: '0.75rem', display: 'block' }}>
                    Verification Documents:
                  </label>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleViewDocument(selectedCase._id, 'image')}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      📷 View Person Photo
                    </button>
                    <button
                      onClick={() => handleViewDocument(selectedCase._id, 'fir-report')}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      📄 View FIR Report 
                    </button>
                  </div>
                </div>

                {selectedCase.image && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontWeight: '600', color: '#374151' }}>Photo Preview:</label>
                    <img
                      src={selectedCase.image}
                      alt={selectedCase.name}
                      style={{
                        width: '200px',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '0.5rem',
                        border: '1px solid #e2e8f0',
                        marginTop: '0.5rem'
                      }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    backgroundColor: getStatusBadgeColor(selectedCase.status) + '20',
                    color: getStatusBadgeColor(selectedCase.status)
                  }}>
                    Status: {selectedCase.status || 'pending'}
                  </span>
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    backgroundColor: getPriorityBadgeColor(selectedCase.priority) + '20',
                    color: getPriorityBadgeColor(selectedCase.priority)
                  }}>
                    Priority: {selectedCase.priority || 'medium'}
                  </span>
                </div>

                {(selectedCase.status === 'pending' || selectedCase.status === 'approved') && (
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {selectedCase.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleReject(selectedCase._id, 'Insufficient information')}
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
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(selectedCase._id)}
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
                          Approve
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        const reason = prompt('Resolution reason (optional):') || 'Person found';
                        const foundLocation = prompt('Where was the person found? (optional):') || '';
                        const foundDate = prompt('When was the person found? (YYYY-MM-DD, optional):') || '';
                        
                        const resolutionData = {
                          reason,
                          foundLocation,
                          foundDate: foundDate || new Date().toISOString().split('T')[0]
                        };
                        
                        if (window.confirm(`Are you sure you want to resolve this case?\nReason: ${reason}\nFound Location: ${foundLocation || 'Not specified'}\nFound Date: ${foundDate || 'Today'}`)) {
                          handleResolve(selectedCase._id, resolutionData);
                        }
                      }}
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
                      ✅ Resolve Case
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

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
