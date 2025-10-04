import React from 'react';
import { motion } from 'framer-motion';
import './Missing_persons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faIdCard, faCalendarAlt, faRulerVertical, faFingerprint, faVenusMars, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const PersonCard = ({ name, date_missing, height, identification, gender, lastSeenLocation, image, caseId, totalcases, changecase, onClick }) => {
    const deletethis = async (id) => {
        const response = await fetch(`http://localhost:5000/api/missingpeople/deleteperson/${id}`, {
            method: 'DELETE',
        });

        const json = await response.json();
        console.log(json);
        console.log(id);
        const responsestatus = response.status;
        if (responsestatus === 200) {
            alert(`person having adhaar number ${id} deleted successfully`);
        }

        const newcases = totalcases.filter((noteelement) => noteelement.adhaar_number !== id);
        changecase(newcases);
    };

    const buttonVariants = {
        hover: { scale: 1.1, backgroundColor: '#53B2EA' },
        tap: { scale: 0.95 },
    };

    return (
        <motion.div 
            className="person-card"
            onClick={onClick}
            style={{ cursor: 'pointer' }}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
        >
            <img src={image} alt={name} className="person-image" />
            <div className="person-details">
                <h3 className="person-name">{name}</h3>
                
                {caseId && (
                    <div className="detail-row">
                        <FontAwesomeIcon icon={faIdCard} />
                        <div className="detail-label">Case ID:</div>
                        <div className="detail-value">{caseId}</div>
                    </div>
                )}
                
                <div className="detail-row">
                    <FontAwesomeIcon icon={faVenusMars} />
                    <div className="detail-label">Gender:</div>
                    <div className="detail-value">{gender}</div>
                </div>
                
                <div className="detail-row">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <div className="detail-label">Missing Since:</div>
                    <div className="detail-value">{date_missing}</div>
                </div>
                
                {lastSeenLocation && (
                    <div className="detail-row">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        <div className="detail-label">Last Seen:</div>
                        <div className="detail-value">{lastSeenLocation}</div>
                    </div>
                )}
                
                {height && (
                    <div className="detail-row">
                        <FontAwesomeIcon icon={faRulerVertical} />
                        <div className="detail-label">Height:</div>
                        <div className="detail-value">{height}</div>
                    </div>
                )}
                
                {identification && (
                    <div className="detail-row">
                        <FontAwesomeIcon icon={faFingerprint} />
                        <div className="detail-label">Identification:</div>
                        <div className="detail-value">{identification}</div>
                    </div>
                )}
                
                <div className="click-hint" style={{
                    marginTop: '1rem',
                    textAlign: 'center',
                    color: '#3b82f6',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                }}>
                    Click for more details
                </div>
            </div>
        </motion.div>
    );
};

export default PersonCard;
