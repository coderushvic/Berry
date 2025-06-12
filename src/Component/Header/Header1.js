import React from 'react';
import { motion } from 'framer-motion';
import Button1 from '../Button/Button1';
import { FiPlayCircle } from 'react-icons/fi';

function Header1() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#3A59D1] shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 md:py-4">
          {/* Logo/Image with hover effect */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0"
          >
            <img 
              src="/svgheaders.svg" 
              alt="Company Logo" 
              className="h-8 md:h-10 w-auto filter brightness-0 invert"
            />
          </motion.div>

          {/* Announcement text with icon */}
          <motion.div
            className="hidden md:flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm"
            whileHover={{ scale: 1.02 }}
          >
            <FiPlayCircle className="text-white text-xl" />
            <p className="text-sm font-medium text-white">
              Watch our <span className="font-semibold">latest update</span>!
            </p>
          </motion.div>

          {/* Mobile version */}
          <div className="md:hidden flex items-center">
            <FiPlayCircle className="text-white text-xl mr-2" />
            <p className="text-xs font-medium text-white">New update!</p>
          </div>

          {/* Button with animation */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button1 />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default Header1;
