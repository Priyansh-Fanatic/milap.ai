import React from 'react';
import { motion } from 'framer-motion';
import './PersonCard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';

const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: 'easeInOut',
        },
    },
    hover: {
        scale: 1.03,
        y: -3,
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
        transition: {
            duration: 0.3,
            ease: 'easeInOut',
        },
    },
};

const PersonCard = ({ member }) => {
    const imageUrl = member.imageUrl || "https://via.placeholder.com/150";

    return (
        <motion.div
            className="person-card"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
        >
            <img src={imageUrl} alt={member.name} className="person-image" />
            <div className="person-info">
                <h3 className="person-name">{member.name}</h3>
                <p className="person-title">{member.title}</p>
                <p className="person-bio">{member.bio}</p>
                <div className="social-links">
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faLinkedin} />
                    </a>
                    <a href={member.github} target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faGithub} />
                    </a>
                </div>
            </div>
        </motion.div>
    );
};

export default PersonCard;
