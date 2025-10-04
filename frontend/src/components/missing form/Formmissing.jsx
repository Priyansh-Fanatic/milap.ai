import React, { useState, useEffect } from 'react';
import './formmissing.css';
import axios from 'axios';
import formimage from '../../images/form.gif';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Formmissing = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: '',
        age: '',
        gender: '',
        dateMissing: '',
        lastSeenLocation: '',
        incidentTime: '',
        description: '',
        contactNumber: '',
        address: '',
        adhaarNumber: '',
        height: '',
        weight: '',
        distinguishingMarks: ''
    });

    const [image, setImage] = useState(null);
    const [firReport, setFirReport] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedData, setSubmittedData] = useState(null);
    const [errors, setErrors] = useState({});
    const [loggedInUser, setLoggedInUser] = useState(null);

    useEffect(() => {
        // Check if user is logged in - use sessionStorage to match other components
        const token = sessionStorage.getItem('token');
        const userData = sessionStorage.getItem('user');
        
        if (!token || !userData) {
            // Redirect to login page instead of showing modal
            navigate('/login');
            return;
        }
        
        try {
            const parsedUser = JSON.parse(userData);
            setLoggedInUser(parsedUser);
        } catch (error) {
            console.error('Error parsing user data:', error);
            navigate('/login');
        }
    }, [navigate]);

    const handleInput = (e) => {
        const { name, value, files } = e.target;

        if (name === 'image') {
            const file = files[0];
            if (file && file.size > 5 * 1024 * 1024) { // Increased to 5MB for better UX
                alert("Image file size must be less than 5MB!");
                return;
            }
            setImage(file);
        } else if (name === 'firReport') {
            const file = files[0];
            if (file && file.size > 5 * 1024 * 1024) { // Increased to 5MB for better UX
                alert("FIR report file size must be less than 5MB!");
                return;
            }
            setFirReport(file);
        } else {
            setUser(prevState => ({ ...prevState, [name]: value }));
            
            // Validate specific fields
            if (name === 'adhaarNumber') {
                const adhaarRegex = /^\d{12}$/;
                if (value && !adhaarRegex.test(value)) {
                    setErrors(prev => ({ ...prev, adhaarNumber: 'Aadhaar number must be exactly 12 digits' }));
                } else {
                    setErrors(prev => ({ ...prev, adhaarNumber: null }));
                }
            }
            
            if (name === 'contactNumber') {
                const phoneRegex = /^\d{10}$/;
                if (value && !phoneRegex.test(value)) {
                    setErrors(prev => ({ ...prev, contactNumber: 'Phone number must be exactly 10 digits' }));
                } else {
                    setErrors(prev => ({ ...prev, contactNumber: null }));
                }
            }

            if (name === 'age') {
                const age = parseInt(value);
                if (value && (age < 0 || age > 120)) {
                    setErrors(prev => ({ ...prev, age: 'Please enter a valid age between 0-120' }));
                } else {
                    setErrors(prev => ({ ...prev, age: null }));
                }
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Required field validations
        if (!user.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!user.age) {
            newErrors.age = 'Age is required';
        } else {
            const age = parseInt(user.age);
            if (age < 0 || age > 120) {
                newErrors.age = 'Please enter a valid age between 0-120';
            }
        }
        
        if (!user.gender) {
            newErrors.gender = 'Gender is required';
        }
        
        if (!user.dateMissing) {
            newErrors.dateMissing = 'Date missing is required';
        }
        
        if (!user.lastSeenLocation.trim()) {
            newErrors.lastSeenLocation = 'Last seen location is required';
        }
        
        if (!user.incidentTime.trim()) {
            newErrors.incidentTime = 'Incident time is required';
        }
        
        if (!user.description.trim()) {
            newErrors.description = 'Description is required';
        }
        
        if (!user.contactNumber.trim()) {
            newErrors.contactNumber = 'Contact number is required';
        }
        
        if (!user.address.trim()) {
            newErrors.address = 'Address is required';
        }
        
        if (!user.adhaarNumber.trim()) {
            newErrors.adhaarNumber = 'Aadhaar number is required';
        }
        
        if (!image) {
            newErrors.image = 'Person\'s photo is required';
        }
        
        if (!firReport) {
            newErrors.firReport = 'FIR report is required';
        }
        
        // Validate Aadhaar number format
        const adhaarRegex = /^\d{12}$/;
        if (user.adhaarNumber && !adhaarRegex.test(user.adhaarNumber)) {
            newErrors.adhaarNumber = 'Aadhaar number must be exactly 12 digits';
        }
        
        // Validate phone number format
        const phoneRegex = /^\d{10}$/;
        if (user.contactNumber && !phoneRegex.test(user.contactNumber)) {
            newErrors.contactNumber = 'Phone number must be exactly 10 digits';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const postData = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);

        try {
            // Convert files to base64
            const imageBase64 = await convertToBase64(image);
            const firReportBase64 = await convertToBase64(firReport);

            const caseData = {
                ...user,
                reportedBy: loggedInUser._id,
                reportedByUsername: loggedInUser.name,
                image: imageBase64,
                firReport: firReportBase64
            };

            const token = sessionStorage.getItem('token');
            const res = await axios.post(
                'http://localhost:5000/api/cases/create',
                caseData,
                { 
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    } 
                }
            );

            if (res.status === 201) {
                alert(`Case registered successfully! Your case ID is: ${res.data.caseId}`);
                setSubmittedData({...user, caseId: res.data.caseId});
                setUser({
                    name: '',
                    age: '',
                    gender: '',
                    dateMissing: '',
                    lastSeenLocation: '',
                    incidentTime: '',
                    description: '',
                    contactNumber: '',
                    address: '',
                    adhaarNumber: '',
                    height: '',
                    weight: '',
                    distinguishingMarks: ''
                });
                setImage(null);
                setFirReport(null);
                setErrors({});
                
                // Redirect to profile to view the case
                setTimeout(() => {
                    navigate('/profile');
                }, 2000);
            }
        } catch (error) {
            console.error("Registration error:", error);
            let errorMessage = 'Case registration failed. Please try again.';
            
            if (error.response?.status === 413 || error.message?.includes('too large')) {
                errorMessage = 'Files are too large. Please reduce image/document sizes and try again.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                ease: "easeInOut",
                staggerChildren: 0.1,
            },
        },
        exit: { opacity: 0, y: -50, transition: { duration: 0.3 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeInOut",
            },
        },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
    };

    const buttonVariants = {
        hover: {
            scale: 1.05,
            backgroundColor: "#6366f1",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            transition: { duration: 0.3, ease: "easeInOut" },
        },
        tap: { scale: 0.95 },
        disabled: { backgroundColor: "#a5b4fc", cursor: "not-allowed" },
    };

    const fields = [
        { label: "Full Name *", type: "text", name: "name", placeholder: "Enter person's full name" },
        { label: "Age *", type: "number", name: "age", placeholder: "Enter age", min: 0, max: 120 },
        { label: "Date Missing *", type: "date", name: "dateMissing" },
        { label: "Last Seen Location *", type: "text", name: "lastSeenLocation", placeholder: "Enter last seen location" },
        { label: "Incident Time *", type: "time", name: "incidentTime" },
        { label: "Contact Number *", type: "text", name: "contactNumber", placeholder: "Enter 10-digit phone number", pattern: "\\d{10}", maxLength: 10 },
        { label: "Address *", type: "text", name: "address", placeholder: "Enter complete address" },
        { label: "Aadhaar Number *", type: "text", name: "adhaarNumber", placeholder: "Enter 12-digit Aadhaar number", pattern: "\\d{12}", maxLength: 12 },
        { label: "Height", type: "text", name: "height", placeholder: "Enter height (e.g., 5'6\")" },
        { label: "Weight", type: "text", name: "weight", placeholder: "Enter weight (e.g., 60 kg)" },
        { label: "Distinguishing Marks", type: "text", name: "distinguishingMarks", placeholder: "Any scars, tattoos, or unique features" },
        {
            label: "Description *",
            type: "textarea",
            name: "description",
            placeholder: "Provide detailed description of the person and circumstances",
            fullWidth: true
        },
        {
            label: "Gender *",
            type: "select",
            name: "gender",
            options: ["Select Gender", "Male", "Female", "Other"],
            fullWidth: true
        },
        {
            label: "Person's Photo * (Max 5MB)",
            type: "file",
            name: "image",
            accept: "image/*",
            fullWidth: true
        },
        {
            label: "FIR Report * (Max 5MB)",
            type: "file",
            name: "firReport",
            accept: "image/*,application/pdf",
            fullWidth: true
        },
    ];

    if (!loggedInUser) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '1.2rem',
                color: '#64748b'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <motion.div
            className="fullformpage"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <motion.div
                className="header-container"
                variants={itemVariants}
            >
                <motion.div className="title-container">
                    <motion.div
                        className="title smaller-title"
                        variants={itemVariants}
                    >
                        Register Missing Person Case
                    </motion.div>
                    <motion.div
                        className="user-info"
                        variants={itemVariants}
                        style={{
                            background: '#f8fafc',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            marginTop: '1rem',
                            border: '1px solid #e2e8f0'
                        }}
                    >
                        <p style={{ margin: '0', color: '#374151', fontWeight: '500' }}>
                            Reporting as: <strong>{loggedInUser.name}</strong>
                        </p>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                            {loggedInUser.email}
                        </p>
                    </motion.div>
                </motion.div>
                <motion.img
                    src={formimage}
                    alt="Form"
                    className="smaller-gif centre-align"
                    variants={itemVariants}
                />
            </motion.div>

            <motion.div
                className="formout adjusted-formout"
                variants={itemVariants}
                layout
            >
                <motion.div
                    className="containerform"
                    variants={containerVariants}
                    layout
                >
                    <motion.div className="content" variants={itemVariants}>
                        <form onSubmit={postData}>
                            <motion.div
                                className="user-details"
                                variants={containerVariants}
                            >
                                {fields.map((field, index) => (
                                    <motion.div
                                        className={`input-box ${field.fullWidth ? 'full-width' : ''}`}
                                        key={index}
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <label className="details">{field.label}</label>
                                        {field.type === 'select' ? (
                                            <>
                                                <select
                                                    name={field.name}
                                                    onChange={handleInput}
                                                    value={user[field.name]}
                                                    required={field.label.includes('*')}
                                                >
                                                    {field.options.map((option, idx) => (
                                                        <option key={idx} value={option === "Select Gender" ? "" : option}>
                                                            {option}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors[field.name] && (
                                                    <small className="error-message" style={{color: 'red'}}>{errors[field.name]}</small>
                                                )}
                                            </>
                                        ) : field.type === 'file' ? (
                                            <>
                                                <input
                                                    type="file"
                                                    name={field.name}
                                                    accept={field.accept}
                                                    onChange={handleInput}
                                                    required={field.label.includes('*')}
                                                />
                                                <small className="file-size-note" style={{color: '#64748b', fontSize: '0.8rem'}}>Max size: 5MB</small>
                                                {errors[field.name] && (
                                                    <small className="error-message" style={{color: 'red', display: 'block'}}>{errors[field.name]}</small>
                                                )}
                                            </>
                                        ) : field.type === 'textarea' ? (
                                            <>
                                                <textarea
                                                    placeholder={field.placeholder}
                                                    name={field.name}
                                                    value={user[field.name]}
                                                    onChange={handleInput}
                                                    required={field.label.includes('*')}
                                                    rows="4"
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        borderRadius: '0.5rem',
                                                        border: '1px solid #d1d5db',
                                                        fontSize: '1rem',
                                                        fontFamily: 'inherit',
                                                        resize: 'vertical'
                                                    }}
                                                />
                                                {errors[field.name] && (
                                                    <small className="error-message" style={{color: 'red'}}>{errors[field.name]}</small>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <input
                                                    type={field.type}
                                                    placeholder={field.placeholder}
                                                    name={field.name}
                                                    value={user[field.name]}
                                                    onChange={handleInput}
                                                    pattern={field.pattern}
                                                    maxLength={field.maxLength}
                                                    min={field.min}
                                                    max={field.max}
                                                    required={field.label.includes('*')}
                                                />
                                                {errors[field.name] && (
                                                    <small className="error-message" style={{color: 'red'}}>{errors[field.name]}</small>
                                                )}
                                            </>
                                        )}
                                    </motion.div>
                                ))}
                            </motion.div>

                            <motion.div className="button" variants={itemVariants}>
                                <motion.input
                                    type="submit"
                                    value={isSubmitting ? "Registering Case..." : "Register Missing Person Case"}
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    disabled={isSubmitting}
                                    style={isSubmitting ? buttonVariants.disabled : {}}
                                />
                            </motion.div>
                        </form>
                    </motion.div>
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {submittedData && (
                    <motion.div
                        className="submitted-data"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        style={{
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '0.5rem',
                            padding: '1.5rem',
                            margin: '2rem auto',
                            maxWidth: '600px',
                            textAlign: 'center'
                        }}
                    >
                        <h2 style={{ color: '#16a34a', marginBottom: '1rem' }}>Case Registered Successfully!</h2>
                        <p style={{ color: '#15803d', fontSize: '1.1rem', fontWeight: '500' }}>
                            Your Case ID: <strong>{submittedData.caseId}</strong>
                        </p>
                        <p style={{ color: '#166534', marginTop: '0.5rem' }}>
                            Your case is now pending approval. You can track its status in your profile.
                        </p>
                        <p style={{ color: '#166534', fontSize: '0.9rem', marginTop: '1rem' }}>
                            Redirecting to your profile...
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="page-spacer"></div>
        </motion.div>
    );
};

export default Formmissing;
    