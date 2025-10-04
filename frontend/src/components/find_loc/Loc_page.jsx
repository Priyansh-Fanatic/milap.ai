import React, { useEffect, useState } from 'react';
import LocCard from './Loc_card';
import "./Loc_page.css";
import "./Searchcss.css";
import notfound from "./nodata.gif";
import locationimg from "./Locationnew.png";
import { motion, AnimatePresence } from 'framer-motion';

const Loc_page = () => {
    const [locations, setLocations] = useState({});
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch("http://localhost:5000/api/foundlocation/getalllocations");
                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
                }

                let data = await response.json();
                console.log("API Response:", data);

                // Process data to keep only the latest location for each adhaar_number
                const latestLocations = {};
                data.forEach(location => {
                    if (!latestLocations[location.adhaar_number] ||
                        new Date(location.date) > new Date(latestLocations[location.adhaar_number].date)) {
                        latestLocations[location.adhaar_number] = location;
                    }
                });

                setLocations(latestLocations);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, []);

    useEffect(() => {
        // Function to get current position
        const getCurrentPosition = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setUserLocation({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        });
                        console.log("User location:", position.coords.latitude, position.coords.longitude);
                    },
                    (error) => {
                        setError(`Geolocation error: ${error.message}`);
                        console.error("Geolocation error:", error);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            } else {
                setError("Geolocation is not supported by this browser.");
            }
        };

        getCurrentPosition();
    }, []);

    const handleSearchInputChange = (e) => {
        setSearchText(e.target.value);
    };

    const filteredLocations = Object.values(locations).filter((element) =>
        searchText ? element.adhaar_number.toString().includes(searchText) : true
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div
            className="bg-gray-100 min-h-screen p-20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div
                className="flex items-center justify-between bg-white shadow-md p-4 rounded-lg"
                variants={itemVariants}
            >
                <h1 className="text-3xl font-semibold text-gray-800">Tracked Locations</h1>
                <motion.img
                    src={locationimg}
                    alt="Tracked Locations"
                    width="50px"
                    className="rounded-md"
                    whileHover={{ scale: 1.1 }}
                />
            </motion.div>

            {/* Search Bar */}
            <motion.div
                className="flex justify-center mt-4"
                variants={itemVariants}
            >
                <div className="relative w-full max-w-md">
                    <input
                        type="search"
                        placeholder="Search location by Aadhaar"
                        className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        onChange={handleSearchInputChange}
                        value={searchText}
                    />
                </div>
            </motion.div>

            {/* Content */}
            <div className="mt-6">
                {loading ? (
                    <motion.p
                        className="text-center text-lg font-semibold text-gray-600"
                        variants={itemVariants}
                    >
                        Loading...
                    </motion.p>
                ) : error ? (
                    <motion.p
                        className="text-center text-red-500 text-lg font-semibold"
                        variants={itemVariants}
                    >
                        Error: {error}
                    </motion.p>
                ) : filteredLocations.length > 0 ? (
                    <motion.div
                        className="card-container"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <AnimatePresence>
                            {filteredLocations.map((element) => (
                                <motion.div
                                    key={`${element.adhaar_number}_${element.date}`}
                                    variants={itemVariants}
                                    exit={{ opacity: 0, y: -50, transition: { duration: 0.3 } }}
                                >
                                    <LocCard
                                        name={element.name}
                                        adhaar={element.adhaar_number}
                                        date={element.date}
                                        region={element.region}
                                        latitude={element.latitude}
                                        longitude={element.longitude}
                                        country={element.country}
                                        state={element.city}
                                        continent_code={element.continent_code}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <motion.div
                        className="flex flex-col items-center mt-10"
                        variants={itemVariants}
                    >
                        <motion.img
                            src={notfound}
                            alt="No Data"
                            className="w-48 h-48 opacity-80"
                            variants={itemVariants}
                            whileHover={{ scale: 1.1 }}
                        />
                        <p className="text-gray-600 text-lg mt-4">No matching records found.</p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default Loc_page;
