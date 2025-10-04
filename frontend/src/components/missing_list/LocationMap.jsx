import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faEye, faClock, faLocationArrow } from '@fortawesome/free-solid-svg-icons';

const LocationMap = ({ caseId, lastSeenLocation }) => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLocationData();
    }, [caseId]);

    const fetchLocationData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/cases/locations/${caseId}`);
            
            if (response.ok) {
                const data = await response.json();
                setLocations(data.locations || []);
            } else {
                // Fallback to initial location data
                setLocations([
                    {
                        id: 1,
                        location: lastSeenLocation,
                        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
                        source: 'Initial Report',
                        confidence: 'High',
                        coordinates: { lat: 28.6139, lng: 77.2090 }
                    }
                ]);
            }
        } catch (error) {
            console.error('Error fetching location data:', error);
            // Fallback data
            setLocations([
                {
                    id: 1,
                    location: lastSeenLocation,
                    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    source: 'Initial Report',
                    confidence: 'High',
                    coordinates: { lat: 28.6139, lng: 77.2090 }
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const generateMapUrl = (location) => {
        // Use OpenStreetMap instead of Google Maps (no API key required)
        const encodedLocation = encodeURIComponent(location);
        return `https://www.openstreetmap.org/export/embed.html?bbox=77.1,28.5,77.3,28.7&layer=mapnik&marker=28.6139,77.2090`;
    };

    if (loading) {
        return (
            <div style={{
                backgroundColor: '#f8fafc',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                marginBottom: '1.5rem'
            }}>
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                    Loading location data...
                </div>
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem'
        }}>
            <h4 style={{
                margin: '0 0 1rem 0',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: '#16a34a' }} />
                Location Tracking & Map
            </h4>
            
            {/* Location Timeline Table */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0',
                marginBottom: '1rem',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    fontWeight: '600',
                    color: '#374151'
                }}>
                    📍 Tracked Locations Timeline
                </div>
                
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {locations.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                    <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                                        <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '0.25rem' }} />
                                        Location
                                    </th>
                                    <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                                        <FontAwesomeIcon icon={faClock} style={{ marginRight: '0.25rem' }} />
                                        Time
                                    </th>
                                    <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                                        <FontAwesomeIcon icon={faEye} style={{ marginRight: '0.25rem' }} />
                                        Source
                                    </th>
                                    <th style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {locations.map((loc, index) => (
                                    <tr key={loc.id || index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.875rem' }}>
                                            <div style={{ fontWeight: '500', color: '#1f2937' }}>{loc.location}</div>
                                            {loc.coordinates && (
                                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                                    📍 {loc.coordinates.lat?.toFixed(4)}, {loc.coordinates.lng?.toFixed(4)}
                                                    {loc.coordinates.source && ` (${loc.coordinates.source})`}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                                            {new Date(loc.timestamp).toLocaleDateString()} <br />
                                            <span style={{ fontSize: '0.75rem' }}>
                                                {new Date(loc.timestamp).toLocaleTimeString()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                                            {loc.source}
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '1rem',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                backgroundColor: loc.confidence === 'High' ? '#dcfce7' : '#fef3c7',
                                                color: loc.confidence === 'High' ? '#166534' : '#92400e'
                                            }}>
                                                {loc.confidence}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>
                            No location data available
                        </div>
                    )}
                </div>
            </div>

            {/* Interactive Map */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    fontWeight: '600',
                    color: '#374151',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>🗺️ Last Known Location Map</span>
                    <button
                        onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(lastSeenLocation)}`, '_blank')}
                        style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}
                    >
                        <FontAwesomeIcon icon={faLocationArrow} />
                        Open in Maps
                    </button>
                </div>
                
                <div style={{ height: '300px', position: 'relative' }}>
                    {/* Enhanced map placeholder with location info and coordinates */}
                    <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f0f9ff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: '2px dashed #3b82f6',
                        borderRadius: '0.5rem',
                        textAlign: 'center',
                        padding: '2rem'
                    }}>
                        <FontAwesomeIcon 
                            icon={faMapMarkerAlt} 
                            style={{ fontSize: '3rem', color: '#3b82f6', marginBottom: '1rem' }} 
                        />
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1.25rem' }}>
                            {lastSeenLocation}
                        </h3>
                        
                        {/* Show coordinates if available */}
                        {locations.length > 0 && locations[0].coordinates && (
                            <div style={{ 
                                margin: '0 0 1rem 0', 
                                color: '#3b82f6',
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                backgroundColor: 'white',
                                padding: '0.5rem',
                                borderRadius: '0.25rem',
                                border: '1px solid #bfdbfe'
                            }}>
                                📍 {locations[0].coordinates.lat?.toFixed(6)}, {locations[0].coordinates.lng?.toFixed(6)}
                                <br />
                                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                    Source: {locations[0].coordinates.source || 'Unknown'}
                                </span>
                            </div>
                        )}
                        
                        <p style={{ margin: '0 0 1rem 0', color: '#64748b' }}>
                            Last known location of the missing person
                        </p>
                        
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => {
                                    const coords = locations.length > 0 && locations[0].coordinates
                                        ? `${locations[0].coordinates.lat},${locations[0].coordinates.lng}`
                                        : encodeURIComponent(lastSeenLocation);
                                    window.open(`https://www.google.com/maps/search/${coords}`, '_blank');
                                }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}
                            >
                                <FontAwesomeIcon icon={faLocationArrow} />
                                View in Google Maps
                            </button>
                            <button
                                onClick={() => {
                                    const coords = locations.length > 0 && locations[0].coordinates
                                        ? `${locations[0].coordinates.lat},${locations[0].coordinates.lng}`
                                        : encodeURIComponent(lastSeenLocation);
                                    window.open(`https://www.openstreetmap.org/?mlat=${locations[0]?.coordinates?.lat || 28.6139}&mlon=${locations[0]?.coordinates?.lng || 77.2090}&zoom=15`, '_blank');
                                }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#16a34a',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}
                            >
                                🗺️ View in OpenStreetMap
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Location Notes */}
            <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: '#92400e'
            }}>
                <strong>Note:</strong> Location data is updated through face recognition models and surveillance systems. 
                Times shown are approximate and based on available tracking information.
            </div>
        </div>
    );
};

export default LocationMap;
