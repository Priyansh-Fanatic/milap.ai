import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './Loc_page.css';
import personLocImage from './Capture.PNG'; // Import the default image

const LocCard = (props) => {
    const mapRef = useRef(null);
    
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            };
            return date.toLocaleDateString(undefined, options);
        } catch (error) {
            console.error("Error formatting date:", dateString, error);
            return 'N/A';
        }
    };

    useEffect(() => {
        // Initialize Google Maps
        const loadGoogleMaps = () => {
            if (window.google && window.google.maps && mapRef.current) {
                const { latitude, longitude } = props;
                const location = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
                
                const map = new window.google.maps.Map(mapRef.current, {
                    center: location,
                    zoom: 12,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false
                });
                
                new window.google.maps.Marker({
                    position: location,
                    map: map,
                    title: props.name
                });
            }
        };

        // Load Google Maps API if not already loaded
        if (!window.google || !window.google.maps) {
            const script = document.createElement('script');
            // You should replace YOUR_API_KEY with an actual Google Maps API key
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA0DllNQGCCHEUkzaUXkZWqI-qpvV-7cL0&callback=initMap`;
            script.async = true;
            script.defer = true;
            window.initMap = loadGoogleMaps;
            document.head.appendChild(script);
            return () => {
                document.head.removeChild(script);
            };
        } else {
            loadGoogleMaps();
        }
    }, [props.latitude, props.longitude, props.name]);

    const openDetailedMap = () => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${props.latitude},${props.longitude}`, '_blank');
    };

    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        },
        hover: {
            scale: 1.03,
            transition: { duration: 0.2, ease: "easeInOut" }
        }
    };

    return (
        <motion.div
            className="location-card"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
        >
            <div className="location-image-container" onClick={openDetailedMap}>
                <img 
                    src={personLocImage} 
                    alt={props.name || "Person Location"} 
                    className="location-profile-image"
                />
                <div className="map-overlay">
                    <div 
                        ref={mapRef}
                        className="location-map-preview"
                    ></div>
                    <div className="view-map-button">
                        <span>View on Map</span>
                    </div>
                </div>
            </div>

            <div className="location-details">
                <h3 className="location-name">{props.name}</h3>
                
                <div className="detail-row">
                    <div className="detail-label">Adhaar:</div>
                    <div className="detail-value">{props.adhaar}</div>
                </div>
                
                <div className="detail-row">
                    <div className="detail-label">Found:</div>
                    <div className="detail-value">{props.date ? formatDate(props.date) : 'N/A'}</div>
                </div>
                
                <div className="detail-row">
                    <div className="detail-label">Location:</div>
                    <div className="detail-value">{props.region || props.state || props.country || 'Unknown'}</div>
                </div>
                
                <div className="detail-row">
                    <div className="detail-label">Coordinates:</div>
                    <div className="detail-value">
                        {props.latitude && props.longitude ? 
                            `${parseFloat(props.latitude).toFixed(4)}, ${parseFloat(props.longitude).toFixed(4)}` : 
                            'N/A'
                        }
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default LocCard;
