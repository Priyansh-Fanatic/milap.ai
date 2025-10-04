import React, { useEffect, useState } from 'react';
import missingimg from "./missingguy.png";
import "./Missing_persons.css";
import PersonCard from './PersonCard';
import LocationMap from './LocationMap';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faMapMarkerAlt, faCalendarAlt, faIdCard, faVenusMars, faRulerVertical, faWeight, faFingerprint, faPhoneAlt, faHome, faClipboardList } from '@fortawesome/free-solid-svg-icons';

const Missing_persons = () => {
    const [cases, setCases] = useState([]);
    const [filteredCases, setFilteredCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log("Fetching approved cases...");
                const response = await fetch("http://localhost:5000/api/cases/approved");

                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
                }

                let data = await response.json();
                console.log("API Response:", data);

                // Validate and sanitize data for the new case structure
                const validatedCases = data.map(item => {
                    console.log("Processing item:", item.name);
                    return {
                        ...item,
                        id: uuidv4(),
                        name: item.name || 'Unknown Name',
                        date_missing: item.dateMissing || null, // Updated field name
                        height: item.height || null,
                        identification: item.identification || 'None',
                        Gender: item.gender || 'Unknown', // Updated field name
                        lastSeenLocation: item.lastSeenLocation || 'Unknown',
                        image: item.image ? { data: item.image, contentType: 'image/jpeg' } : null, // Handle base64 image
                        caseId: item.caseId || 'Unknown Case'
                    };
                });
                
                console.log("Validated cases before filtering:", validatedCases);
                
                // Only filter out cases that don't have essential data
                const filteredCases = validatedCases.filter(item => 
                    item.name && item.name !== 'Unknown Name'
                );
                
                console.log("Final filtered cases:", filteredCases);
                setCases(filteredCases);
                setFilteredCases(filteredCases);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load missing persons. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, []);

    // Search functionality
    useEffect(() => {
        if (!searchTerm) {
            setFilteredCases(cases);
        } else {
            const filtered = cases.filter(person => 
                person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                person.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                person.lastSeenLocation.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCases(filtered);
        }
    }, [searchTerm, cases]);

    // Handle person card click
    const handlePersonClick = async (person) => {
        // Show modal immediately with basic data
        setSelectedPerson(person);
        setShowModal(true);
        setModalLoading(true);
        
        // Then fetch additional details in background
        try {
            const response = await fetch(`http://localhost:5000/api/cases/public/case/${person._id}`);
            if (response.ok) {
                const result = await response.json();
                // Update with full data once loaded
                setSelectedPerson(result.case || person);
            }
        } catch (error) {
            console.error('Error fetching case details:', error);
            // Keep the basic data if fetch fails
        } finally {
            setModalLoading(false);
        }
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedPerson(null);
        setModalLoading(false);
    };

    

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    return (
        <motion.div
            className="missing-persons-page"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Animated Header */}
            <motion.div
                className="header"
                variants={cardVariants}
            >
                <motion.h1
                    className="header-title"
                    variants={cardVariants}
                >
                    Missing People
                </motion.h1>
                <motion.img
                    src={missingimg}
                    alt="Missing"
                    className="header-image"
                    variants={cardVariants}
                />
            </motion.div>

            {/* Search Bar */}
            <motion.div
                className="search-container"
                variants={cardVariants}
                style={{
                    marginBottom: '2rem',
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <div style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '500px'
                }}>
                    <FontAwesomeIcon 
                        icon={faSearch} 
                        style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#64748b',
                            zIndex: 1
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search by name, case ID, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem 1rem 1rem 3rem',
                            border: '2px solid #e2e8f0',
                            borderRadius: '50px',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#3b82f6';
                            e.target.style.boxShadow = '0 4px 15px rgba(59,130,246,0.15)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                        }}
                    />
                </div>
            </motion.div>

            {/* Loading or Error Message */}
            <motion.div
                variants={cardVariants}
            >
                {loading ? (
                    <p className="loading-message">Loading...</p>
                ) : error ? (
                    <p className="error-message">{error}</p>
                ) : (
                    <div className="person-grid">
                        <AnimatePresence>
                            {/* Double-check cases and cases.length *right before* mapping */}
                            {filteredCases && filteredCases.length > 0 ? (
                                filteredCases.map((element) => {
                                    if (!element.image || !element.image.data) {
                                        console.warn("Missing image data for:", element);
                                        return null;
                                    }

                                    try {
                                        // Handle base64 image from new case format
                                        const src = element.image.data.startsWith('data:') 
                                            ? element.image.data 
                                            : `data:${element.image.contentType};base64,${element.image.data}`;

                                        return (
                                            <motion.div key={element.caseId || element._id} variants={cardVariants} exit={{ opacity: 0, y: -50 }}>
                                                <PersonCard
                                                    name={element.name}
                                                    date_missing={element.date_missing ? element.date_missing.substring(0, 10) : "Not specified"}
                                                    height={element.height || "Not specified"}
                                                    identification={element.identification ?? "Not specified"}
                                                    gender={element.Gender ?? "Not specified"}
                                                    lastSeenLocation={element.lastSeenLocation ?? "Not specified"}
                                                    image={src}
                                                    caseId={element.caseId}
                                                    totalcases={cases}
                                                    changecase={setCases}
                                                    onClick={() => handlePersonClick(element)}
                                                />
                                            </motion.div>
                                        );
                                    } catch (imageError) {
                                        console.error("Error processing image:", element, imageError);
                                        return null; // Skip this card if there's an image processing error
                                    }
                                })
                            ) : searchTerm ? (
                                <div style={{
                                    gridColumn: '1 / -1',
                                    textAlign: 'center',
                                    padding: '2rem',
                                    color: '#64748b'
                                }}>
                                    <p>No missing persons found matching "{searchTerm}"</p>
                                </div>
                            ) : (
                                <p className="no-persons-message">No missing persons found.</p>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>

            {/* Add spacer at the bottom */}
            <div className="page-spacer"></div>

            {/* Person Detail Modal */}
            <AnimatePresence>
                {showModal && selectedPerson && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1000,
                            padding: '1rem'
                        }}
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '1rem',
                                width: '90%',
                                maxWidth: '600px',
                                maxHeight: '90vh',
                                overflow: 'auto',
                                position: 'relative',
                                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div style={{
                                padding: '1.5rem',
                                borderBottom: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: '#f8fafc',
                                borderRadius: '1rem 1rem 0 0'
                            }}>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: '#1e293b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    Missing Person Details
                                    {modalLoading && (
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            border: '2px solid #e2e8f0',
                                            borderTop: '2px solid #3b82f6',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }}></div>
                                    )}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer',
                                        color: '#64748b',
                                        padding: '0.5rem',
                                        borderRadius: '0.5rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.backgroundColor = '#e2e8f0';
                                        e.target.style.color = '#1e293b';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#64748b';
                                    }}
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div style={{ padding: '2rem' }}>
                                {/* Person Image and Basic Info */}
                                <div style={{
                                    display: 'flex',
                                    gap: '2rem',
                                    marginBottom: '2rem',
                                    flexWrap: 'wrap'
                                }}>
                                    <div style={{ flex: '0 0 200px' }}>
                                        {selectedPerson.image ? (
                                            <img
                                                src={
                                                    typeof selectedPerson.image === 'string' 
                                                        ? selectedPerson.image
                                                        : selectedPerson.image.data?.startsWith('data:') 
                                                            ? selectedPerson.image.data 
                                                            : `data:${selectedPerson.image?.contentType || 'image/jpeg'};base64,${selectedPerson.image?.data}`
                                                }
                                                alt={selectedPerson.name}
                                                style={{
                                                    width: '100%',
                                                    height: '250px',
                                                    objectFit: 'cover',
                                                    borderRadius: '0.75rem',
                                                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                                }}
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDIwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTI1QzExNi41NjkgMTI1IDEzMCAxMTEuNTY5IDEzMCA5NUMxMzAgNzguNDMxNSAxMTYuNTY5IDY1IDEwMCA2NUM4My40MzE1IDY1IDcwIDc4LjQzMTUgNzAgOTVDNzAgMTExLjU2OSA4My40MzE1IDEyNSAxMDAgMTI1WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTAwIDE0MEM4My40MzE1IDE0MCA3MCA1My40MzE1IDcwIDEzNy41VjE4NUgxMzBWMTM3LjVDMTMwIDEyNi40MzEgMTE2LjU2OSAxNDAgMTAwIDE0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                                                    e.target.style.backgroundColor = '#f3f4f6';
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '250px',
                                                backgroundColor: '#f3f4f6',
                                                borderRadius: '0.75rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#9ca3af'
                                            }}>
                                                No Image Available
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div style={{ flex: 1, minWidth: '250px' }}>
                                        <h3 style={{
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold',
                                            margin: '0 0 1rem 0',
                                            color: '#1e293b'
                                        }}>
                                            {selectedPerson.name}
                                        </h3>
                                        
                                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <FontAwesomeIcon icon={faIdCard} style={{ color: '#3b82f6', width: '20px' }} />
                                                <span style={{ fontWeight: '600', color: '#374151' }}>Case ID:</span>
                                                <span style={{ color: '#64748b' }}>{selectedPerson.caseId}</span>
                                            </div>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <FontAwesomeIcon icon={faVenusMars} style={{ color: '#8b5cf6', width: '20px' }} />
                                                <span style={{ fontWeight: '600', color: '#374151' }}>Gender:</span>
                                                <span style={{ color: '#64748b' }}>{selectedPerson.gender}</span>
                                            </div>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#f59e0b', width: '20px' }} />
                                                <span style={{ fontWeight: '600', color: '#374151' }}>Age:</span>
                                                <span style={{ color: '#64748b' }}>{selectedPerson.age} years</span>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#ef4444', width: '20px' }} />
                                                <span style={{ fontWeight: '600', color: '#374151' }}>Missing Since:</span>
                                                <span style={{ color: '#64748b' }}>
                                                    {selectedPerson.dateMissing ? new Date(selectedPerson.dateMissing).toLocaleDateString() : 'Not specified'}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: '#16a34a', width: '20px' }} />
                                                <span style={{ fontWeight: '600', color: '#374151' }}>Missing Location:</span>
                                                <span style={{ color: '#64748b' }}>
                                                    {selectedPerson.lastSeenLocation || 'Not specified'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Map and Tracking */}
                                <LocationMap 
                                    caseId={selectedPerson.caseId || selectedPerson._id}
                                    lastSeenLocation={selectedPerson.lastSeenLocation}
                                />

                                {/* Physical Description */}
                                <div style={{
                                    backgroundColor: '#f0f9ff',
                                    padding: '1.5rem',
                                    borderRadius: '0.75rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    <h4 style={{
                                        margin: '0 0 1rem 0',
                                        fontSize: '1.25rem',
                                        fontWeight: 'bold',
                                        color: '#1e293b'
                                    }}>
                                        Physical Description
                                    </h4>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                        {selectedPerson.height && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FontAwesomeIcon icon={faRulerVertical} style={{ color: '#0ea5e9' }} />
                                                <span style={{ fontWeight: '600' }}>Height:</span>
                                                <span>{selectedPerson.height}</span>
                                            </div>
                                        )}
                                        
                                        {selectedPerson.weight && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FontAwesomeIcon icon={faWeight} style={{ color: '#0ea5e9' }} />
                                                <span style={{ fontWeight: '600' }}>Weight:</span>
                                                <span>{selectedPerson.weight}</span>
                                            </div>
                                        )}

                                        {selectedPerson.identification && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FontAwesomeIcon icon={faFingerprint} style={{ color: '#0ea5e9' }} />
                                                <span style={{ fontWeight: '600' }}>ID Marks:</span>
                                                <span>{selectedPerson.identification}</span>
                                            </div>
                                        )}
                                    </div>

                                    {selectedPerson.distinguishingMarks && (
                                        <div style={{ marginTop: '1rem' }}>
                                            <span style={{ fontWeight: '600', color: '#374151' }}>Distinguishing Marks:</span>
                                            <p style={{ 
                                                margin: '0.25rem 0 0 0', 
                                                color: '#64748b',
                                                backgroundColor: 'white',
                                                padding: '0.75rem',
                                                borderRadius: '0.5rem',
                                                border: '1px solid #e2e8f0'
                                            }}>
                                                {selectedPerson.distinguishingMarks}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Case Description */}
                                {selectedPerson.description && (
                                    <div style={{
                                        backgroundColor: '#fefce8',
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
                                            <FontAwesomeIcon icon={faClipboardList} style={{ color: '#ca8a04' }} />
                                            Case Description
                                        </h4>
                                        <p style={{ 
                                            margin: 0, 
                                            color: '#64748b',
                                            lineHeight: '1.6',
                                            backgroundColor: 'white',
                                            padding: '1rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            {selectedPerson.description}
                                        </p>
                                    </div>
                                )}

                                {/* Contact Information Note */}
                                <div style={{
                                    backgroundColor: '#f0fdf4',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #bbf7d0',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ 
                                        margin: 0, 
                                        color: '#16a34a',
                                        fontWeight: '600'
                                    }}>
                                        📞 If you have any information about this person, please contact local authorities or the police.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Missing_persons;
