import React from 'react';
import { motion } from 'framer-motion';
import { FaTelegram } from 'react-icons/fa';
import { FiAward } from 'react-icons/fi';

function BrowserHeader() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="py-6 bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center space-x-4">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 5
            }}
          >
            <FaTelegram className="text-white text-4xl" />
          </motion.div>
          
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-white tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="inline-block">Telegram</span>{' '}
            <span className="inline-flex items-center">
              Wall <FiAward className="mx-2" /> of Fame
            </span>
          </motion.h1>
        </div>
        
        <motion.p 
          className="mt-2 text-blue-100 text-sm md:text-base max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Celebrating our top contributors and most active community members
        </motion.p>
      </div>
    </motion.div>
  );
}

export default BrowserHeader;
