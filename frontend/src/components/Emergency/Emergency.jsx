import React from 'react';
import { motion } from 'framer-motion';

const Emergency = () => {
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.5 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: "easeInOut",
            },
        },
    };

    return (
        <motion.div
            className="flex items-center justify-center h-screen text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div>
                <h2 className="text-5xl font-bold mb-4">Upcoming Feature</h2>
                <p className="text-2xl text-gray-600">
                    This emergency feature is under development and will be available soon.
                </p>
            </div>
        </motion.div>
    );
};

export default Emergency;
