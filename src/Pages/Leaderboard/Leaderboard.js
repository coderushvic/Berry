import React, { useEffect, useRef, useCallback } from 'react';
import BrowserHeader from '../../Component/Header/BrowserHeader';
import Footer from '../../Component/Footer/Footer';
import UserRanking from '../../Component/Ranking/Ranking';
import { useUser } from '../../context/userContext';
import { IoClose } from 'react-icons/io5';
import { IoIosWarning } from "react-icons/io";

function Leaderboard() {
  const { openInfoThree, setOpenInfoThree } = useUser();
  const infoRefThree = useRef(null);

  // Wrap the handler in useCallback to memoize it
  const handleClickOutside = useCallback((event) => {
    if (infoRefThree.current && !infoRefThree.current.contains(event.target)) {
      setOpenInfoThree(false);
    }
  }, [setOpenInfoThree]);

  useEffect(() => {
    if (openInfoThree) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [openInfoThree, handleClickOutside]); // Now includes all dependencies

  return (
    <>
      <div className="bg-white min-h-screen flex flex-col">
        <BrowserHeader />
        
        <main className="flex-1">
          <UserRanking />
        </main>
        
        <Footer />
      </div>

      {/* Modal Overlay */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          openInfoThree 
            ? "opacity-100 visible backdrop-blur-sm" 
            : "opacity-0 invisible"
        } bg-black/50 flex items-center justify-center p-4`}
      >
        <div
          ref={infoRefThree}
          className={`bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 ${
            openInfoThree ? "scale-100" : "scale-95"
          }`}
        >
          {/* Modal Header */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setOpenInfoThree(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <IoClose size={24} />
            </button>
          </div>
          
          {/* Modal Content */}
          <div className="px-6 pb-8 pt-2">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-xl bg-amber-100 flex items-center justify-center">
                <IoIosWarning size={48} className="text-amber-500" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Hey there! 😎</h3>
                <p className="text-gray-600">
                  My name is Victor and I developed this bot app. If you need
                  to purchase the source code for this project or you want to
                  create similar projects like this, you can message me
                  directly on Telegram via{" "}
                  <a
                    href="https://t.me/coderushdev"
                    className="text-amber-600 hover:text-amber-700 underline transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    t.me/coderushdev
                  </a>
                </p>
              </div>
              
              <button
                onClick={() => setOpenInfoThree(false)}
                className="w-full py-3 px-6 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                Got it, continue 🤙
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Leaderboard;
