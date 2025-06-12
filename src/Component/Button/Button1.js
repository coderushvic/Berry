import React from 'react';
import { motion } from 'framer-motion';
import { FaCat } from 'react-icons/fa';

function Button1() {
  return (
    <motion.button
      className="relative overflow-hidden rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#3A59D1] shadow-md hover:shadow-blue-400/30 transition-all duration-300 group border border-blue-200"
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 4px 15px -3px rgba(58, 89, 209, 0.2)"
      }}
      whileTap={{ 
        scale: 0.98,
        boxShadow: "0 2px 5px -1px rgba(58, 89, 209, 0.1)"
      }}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated cat icon */}
      <motion.span 
        className="absolute -left-4 opacity-0 group-hover:opacity-100 group-hover:left-2 transition-all duration-300"
        animate={{
          rotate: [0, 15, -15, 0],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatDelay: 2
        }}
      >
        <FaCat className="text-[#3A59D1]/80" />
      </motion.span>
      
      {/* Button text with transition */}
      <span className="relative z-10 flex items-center justify-center gap-2 transition-all duration-200 group-hover:translate-x-1">
        Meeoow!
        <motion.span
          animate={{
            x: [0, 3, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity
          }}
        >
          <span className="text-[#3A59D1]">🐾</span>
        </motion.span>
      </span>
      
      {/* Ripple effect background */}
      <span className="absolute inset-0 -z-0 bg-gradient-to-r from-[#3A59D1]/0 via-[#3A59D1]/10 to-[#3A59D1]/0 opacity-0 group-hover:opacity-100 group-hover:animate-[ripple_2s_linear_infinite]"></span>
    </motion.button>
  );
}

export default Button1;
