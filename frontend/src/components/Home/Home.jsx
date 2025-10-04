import React, { useEffect, useState } from 'react';
import "./Home.css";
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 1,
                delayChildren: 0.3,
                staggerChildren: 0.2,
            },
        },
    };

    const textVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: "easeInOut",
            },
        },
    };

    return (
        <div className="fullherosection">
            <div className='herofullsection'>
                <AnimatePresence>
                    {isMounted && (
                        <motion.div
                            className="herotext"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, transition: { duration: 0.5 } }}
                        >
                            <motion.h1 variants={textVariants}>
                                Let's stand together and find your close ones with our recognition systems
                            </motion.h1>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Home;
