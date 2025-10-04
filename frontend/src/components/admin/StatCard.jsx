import React from "react";
import { motion } from "framer-motion";

const StatCard = ({ title, value, color, icon, trend }) => {
  return (
    <motion.div
      className="stat-card bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border-l-4 cursor-pointer"
      style={{ borderColor: color }}
      tabIndex={0}
      aria-label={`${title}: ${value}, ${trend}`}
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{
        scale: 1.025,
        boxShadow: "0 8px 32px 0 rgba(99,102,241,0.11)",
        transition: { type: "spring", stiffness: 300 }
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        className="text-3xl mb-4"
        style={{ color }}
        whileHover={{ rotate: [0, 8, -8, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      >
        {icon}
      </motion.div>
      <h3 className="text-gray-500 dark:text-gray-400 font-semibold text-sm mb-1">
        {title}
      </h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{trend}</p>
    </motion.div>
  );
};

export default StatCard;
