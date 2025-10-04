import React from 'react';
import heroimg from "./heroimagefinal.png";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import "./Hero.css";
import DevCard from "./PersonCard";
import PriyanshImage from "./Priyansh.jpg";
import AbhijeetImage from "./Abhijeet.jpg";
import MilapAILogo from "./milapai_4.png";
import { Link } from 'react-router-dom';

const Hero = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 1,
                ease: "backInOut",
                delayChildren: 0.3,
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "backInOut",
            },
        },
    };

    const buttonVariants = {
        hover: {
            scale: 1.1,
            y: -3,
            transition: {
                duration: 0.3,
                yoyo: 3,
            },
        },
        tap: {
            scale: 0.95,
        },
    };

    const teamMembers = [
        {
            id: 1,
            name: "Priyansh",
            title: "Lead Developer",
            imageUrl: PriyanshImage,
            bio: "Passionate about leveraging AI for social good.",
            linkedin: "https://www.linkedin.com/in/priyansh-%E2%80%8E%E2%80%8E-691236291/",
            github: "https://github.com/Priyansh-Fanatic",
        },
        {
            id: 2,
            name: "Abhijeet Singh",
            title: "Developer",
            imageUrl: AbhijeetImage,
            bio: "Expert in facial recognition technology.",
            linkedin: "https://www.linkedin.com/in/abhijeetsingh0022/",
            github: "https://github.com/Abhijeetsingh0022",
        },
    ];

    const missionVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0,
                ease: "easeInOut",
            },
        },
    };

    const teamVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0,
                ease: "easeInOut",
                staggerChildren: 0.3,
            },
        },
    };

    const fadeInVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 1.2,
                ease: "easeIn",
            },
        },
    };

    const imageAnimation = useAnimation();

    useEffect(() => {
        const sequence = async () => {
            await imageAnimation.start({ x: -20, rotate: -5, duration: 10, yoyo: Infinity, ease: "easeInOut" });
            await imageAnimation.start({ x: 20, rotate: 5, duration: 10, yoyo: Infinity, ease: "easeInOut" });
        };

        sequence();
    }, [imageAnimation]);

    // Define the routes relative to the project's root
    const reportMissingRoute = "/Formmissing";
    const viewMissingRoute = "/Missingpeople";

    return (
        <motion.section
            className="hero-section"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="graphic-background"></div>
            <div className="container mx-auto relative z-10">
                <div className="lg:flex items-center">
                    <motion.div
                        className="w-full lg:w-1/2 h-full lg:pr-10 xl:pr-0 flex justify-center"
                        variants={fadeInVariants}
                    >
                        <motion.img
                            tabIndex="0"
                            role="img"
                            aria-label="people smiling"
                            className="rounded-3xl shadow-2xl"
                            src={heroimg}
                            alt="people smiling"
                            width={"450px"}
                            animate={imageAnimation}
                        />
                    </motion.div>

                    <motion.div
                        role="contentinfo"
                        className="w-full lg:w-1/2 h-full mt-12 lg:mt-0"
                        variants={itemVariants}
                    >
                        <motion.p
                            tabIndex="0"
                            className="text-indigo-700 uppercase text-3xl font-semibold mb-4 text-center lg:text-left"
                            variants={itemVariants}
                        >
                            Connecting Families Through Advanced Recognition
                        </motion.p>
                        <motion.img
                            src={MilapAILogo}
                            alt="Milap AI Logo"
                            className="mx-auto"
                            style={{ maxWidth: '100%', height: 'auto' }}
                            variants={itemVariants}
                        />
                        <motion.p
                            tabIndex="0"
                            className="text-2xl black-800 font- mb-8 leading-relaxed text-center lg:text-left top-10px"
                            variants={itemVariants}
                        >
                        Every second matters when someone goes missing. Milap AI helps communities act fast with advanced facial recognition technology. It’s not just about saving time—it’s about bringing hope, reconnecting loved ones, and reuniting families with urgency and care.
                        </motion.p>
                        <motion.div
                            className="flex space-x-4 justify-center lg:justify-start"
                            variants={itemVariants}
                        >
                            <Link to={reportMissingRoute} style={{ textDecoration: 'none' }} passHref legacyBehavior>
                                <motion.button
                                    className="bg-white text-blue-700 px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-all relative overflow-hidden border border-blue-600"
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <span className="relative z-10">Report a Missing Person</span>
                                    <motion.span
                                        className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity duration-20"
                                        style={{ borderRadius: "inherit" }}
                                    />
                                </motion.button>
                            </Link>
                            <Link to={viewMissingRoute} style={{ textDecoration: 'none' }} passHref legacyBehavior>
                                <motion.button
                                    className="bg-white text-blue-700 px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-all relative overflow-hidden border border-blue-600"
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <span className="relative z-10">View Missing Persons</span>
                                    <motion.span
                                        className="absolute inset-0 bg-blue-600 opacity-0 hover:opacity-10 transition-opacity duration-20"
                                        style={{ borderRadius: "inherit" }}
                                    />
                                </motion.button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
                <div className="flex justify-center">
                    <motion.div
                        className="mt-20 py-12 border-t border-gray-200 text-center w-full lg:w-3/4"
                        variants={missionVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <motion.h2
                            className="text-4xl font-semibold text-indigo-800 mb-6"
                            variants={itemVariants}
                        >
                            Our Mission
                        </motion.h2>
                        <motion.h2
                            className="text-2xl black-800 leading-relaxed"
                            variants={itemVariants}
                        >
                            At Milap AI, our mission extends beyond simple facial recognition. We are dedicated to
                            providing a comprehensive platform that not only identifies missing persons but also
                            offers resources and support to families during challenging times. By fostering
                            collaboration between communities, law enforcement, and NGOs, we strive to create a
                            robust network that prioritizes the swift and safe reunification of loved ones. We are
                            committed to ethical AI practices, ensuring privacy and security while maximizing our
                            impact.
                        </motion.h2>
                    </motion.div>
                </div>

                {/* Team Section */}
                <div className="flex justify-center">
                    <motion.div
                        className="mt-20 py-12 border-t border-gray-200 w-full lg:w-3/4"
                        variants={teamVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <motion.h2
                            className="text-4xl font-semibold text-indigo-800 mb-6 text-center"
                            variants={itemVariants}
                        >
                            Our Team
                        </motion.h2>
                        <div className="flex flex-wrap justify-center">
                            {teamMembers.map((member) => (
                                <DevCard key={member.id} member={member} />
                            ))}
                        </div>
                        <motion.p
                            className="text-2xl black-800 leading-relaxed mt-4 text-center"
                            variants={itemVariants}
                        >
                            This was made possible by the great cooperation and hard work by each and everyone in
                            team.
                        </motion.p>
                    </motion.div>
                </div>
            </div>
        </motion.section>
    );
};

export default Hero;
