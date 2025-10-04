import React, { useEffect, useState } from 'react';
import applogo from "./milapai_3.png";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = ({ user, setUser }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();

    // Scroll detection for header shadow
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Animation variants for mobile menu
    const menuVariants = {
        open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        closed: { x: '100%', transition: { type: 'spring', stiffness: 300, damping: 30 } }
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Face Recognition', url: 'http://localhost:5001/' },
        { name: 'Register Missing Person', path: '/Formmissing' },
        { name: 'Missing People', path: '/Missingpeople' },
    ];

    const linkVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeInOut",
            },
        },
    };

    // Logout handler
    const handleLogout = () => {
        sessionStorage.removeItem("user");
        setUser(null);
        navigate("/login");
    };

    return (
        <motion.header
            className={`fixed w-full top-0 z-50 transition-all duration-300`}
            style={{
                backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(100px)',
                boxShadow: isScrolled ? '0px 3px 10px rgba(0, 0, 0, 0.1)' : 'none',
            }}
        >
            {/* Desktop Nav */}
            <nav className="hidden lg:flex max-w-7xl mx-auto px-2 py-2 items-center justify-between">
                {/* Logo */}
                <motion.div
                    className="flex items-center space-x-2"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <img src={applogo} alt="logo" className="w-60 h-10" />
                </motion.div>

                {/* Central Navigation Links */}
                <motion.div
                    className="flex space-x-5 items-center bg-gray-40 rounded-full shadow-md px-20 py-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                >
                    {navLinks.map((link, index) => (
                        <motion.div
                            key={index}
                            variants={linkVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0 + index * 0 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative group rounded-full overflow-hidden"
                        >
                            {link.path ? (
                                <Link
                                    to={link.path}
                                    className="px-3 py-1 text-gray-700 hover:text-blue-600 transition-colors font-medium block"
                                >
                                    {link.name}
                                    <motion.span
                                        className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"
                                        layoutId={`underline-${link.name}`}
                                    />
                                </Link>
                            ) : (
                                <a
                                    href={link.url}
                                    className="px-3 py-1 text-gray-700 hover:text-blue-600 transition-colors font-medium block"
                                >
                                    {link.name}
                                    <motion.span
                                        className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"
                                        layoutId={`underline-${link.name}`}
                                    />
                                </a>
                            )}
                        </motion.div>
                    ))}
                </motion.div>

                {/* Right Side: Profile or Sign In */}
                <div className="flex items-center space-x-1 relative">
                    {user ? (
                    // MODIFIED: Added flex, items-center, and space-x-3 to this div
                    <div className="relative group flex items-center space-x-3"> 
                        {/* Profile Icon/Link */}
                        <Link to="/profile" className="flex-shrink-0"> {/* flex-shrink-0 is good practice for avatars */}
                        {user.picture ? (
                            <img
                            src={user.picture}
                            alt="Profile"
                            // Consistent sizing, object-cover for aspect ratio
                            className="w-10 h-10 rounded-full border-2 border-blue-600 cursor-pointer object-cover hover:opacity-90 transition-opacity"
                            />
                        ) : (
                            <span
                            // Consistent sizing with image, flex for centering initial
                            className="inline-flex items-center justify-center w-10 h-10 bg-gray-500 dark:bg-gray-600 rounded-full text-white font-bold cursor-pointer text-lg hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors"
                            >
                            {user.name ? user.name[0].toUpperCase() : "U"}
                            </span>
                        )}
                        </Link>

                        {/* Logout Button */}
                        <button
                        onClick={handleLogout}
                        // Removed ml-2 (spacing handled by parent's space-x-3)
                        // Adjusted padding for better visual balance with avatar, added focus rings
                        className="bg-red-500 px-2 py-2 rounded-full text-sm text-white font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-150 ease-in-out"
                        >
                        Logout
                        </button>
                    </div>
                    ) : (
                    <motion.button
                        onClick={() => navigate("/login")}
                        whileHover={{ scale: 1.03, boxShadow: '0px 3px 10px rgba(37, 99, 235, 0.2)' }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full font-semibold shadow-md hover:shadow-blue-200 transition-all"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0, duration: 0.3, ease: "easeOut" }}
                    >
                        Sign In
                    </motion.button>
                    )}
                </div>
            </nav>

            {/* Mobile Nav (unchanged except for profile/logout) */}
            <nav className="lg:hidden flex items-center justify-between px-3 py-2">
                <motion.div
                    className="flex items-center space-x-1"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <img src={applogo} alt="logo" className="w-60 h-8" />
                </motion.div>
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    {menuOpen ? (
                        <FaTimes className="w-5 h-5 text-blue-700" />
                    ) : (
                        <FaBars className="w-5 h-5 text-blue-700" />
                    )}
                </button>
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={menuVariants}
                            className="fixed inset-y-0 right-0 w-56 bg-white shadow-xl p-4"
                        >
                            <div className="flex flex-col space-y-3 mt-6">
                                {navLinks.map((link, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ x: 30, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        {link.path ? (
                                            <Link
                                                to={link.path}
                                                onClick={() => setMenuOpen(false)}
                                                className="block px-3 py-1.5 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                {link.name}
                                            </Link>
                                        ) : (
                                            <a
                                                href={link.url}
                                                onClick={() => setMenuOpen(false)}
                                                className="block px-3 py-1.5 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                {link.name}
                                            </a>
                                        )}
                                    </motion.div>
                                ))}
                                {/* Profile/Logout or Sign In */}
                                <div className="mt-4 flex items-center space-x-3">
                                    {user ? (
                                        <>
                                            <Link to="/profile" onClick={() => setMenuOpen(false)}>
                                                {user.picture ? (
                                                    <img src={user.picture} alt="Profile" className="w-9 h-9 rounded-full border-2 border-blue-600" />
                                                ) : (
                                                    <span className="inline-block w-9 h-9 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold">
                                                        {user.name ? user.name[0].toUpperCase() : "U"}
                                                    </span>
                                                )}
                                            </Link>
                                            <button
                                                onClick={() => { handleLogout(); setMenuOpen(false); }}
                                                className="bg-red-500 px-3 py-1 rounded-full text-white font-semibold hover:bg-red-600 transition"
                                            >
                                                Logout
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => { navigate("/login"); setMenuOpen(false); }}
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full font-semibold shadow-md hover:shadow-blue-200 transition-all"
                                        >
                                            Sign In
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </motion.header>
    );
};

export default Navbar;
