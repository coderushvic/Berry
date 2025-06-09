import React, { useState, useEffect } from 'react';
import './Airdrop.css'; // Custom CSS for slot machine effect
import Footer from '../../Component/Footer/Footer';
import Exchanges from '../../Component/Exchanges';
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { useUser } from '../../context/userContext';
import { BsCurrencyExchange } from "react-icons/bs";
import { Address } from '../../Component/Address';


function Airdrop() {
  const [randomNumber, setRandomNumber] = useState('16396'); // Initial random number
  const [showExchange, setShowExchange] = useState(false);
  const {selectedExchange} = useUser();


  const openExchange = () => {
    setShowExchange(true);
}

  // Effect to simulate continuous spinning
  useEffect(() => {
    const spinInterval = setInterval(() => {
      const randomDigits = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)); // Generate 5 random digits
      setRandomNumber(randomDigits.join('')); // Convert array to string and update the number
    }, 100); // Faster updates for smoother spin

    return () => clearInterval(spinInterval); // Cleanup the interval on unmount
  }, []);

  return (
    <>
    
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      {/* Main Container */}
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {/* Title */}
        <h1 className="text-3xl font-semibold mb-4">Your final drop</h1>

        {/* Dynamic Spinning Numbers */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="text-blue-600 text-5xl font-bold slot-machine">
            {randomNumber}
          </span>
          <span className="text-blue-600 text-5xl font-bold w-[50px] h-[50px] bg-blue-500 rounded-full p-1 flex justify-center items-center">
            <img src='/cat-icon.png' alt='caticons' className='invert w-[40px]'/>
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-blue-500 text-lg mb-6">Your rewards are calculating, continue farming!</p>

        {/* Options */}
        <div className="space-y-4 w-full">
          {/* Exchanges Option */}

          
          <div onClick={openExchange} className="flex items-center justify-between px-3 py-[10px] border-2 rounded-[14px] cursor-pointer transition border-blue-400">
            <div className="flex items-center space-x-2">



              <span className="bg-[#e9e9e9] h-[35px] w-[35px] rounded-full flex items-center justify-center">

<BsCurrencyExchange size={18} className='text-blue-400'/>

              </span>

                                
              {selectedExchange.id === 'selectex' ? (
                        <>
                   <span className="text-[14px] font-medium text-blue-500">Exchanges</span>
                        </>
                      ) : (
                        <>
                            <span className="text-[14px] font-medium mr-2">
                              
                            {selectedExchange.name}

                            </span>

                       
                        </>
                      )}

            
            </div>
           
            {selectedExchange.id === 'selectex' ? (
                                              <span className="flex items-center justify-center mt-[1px]">
                                                 <MdOutlineKeyboardArrowRight size={24} className={`text-blue-400`} />
                                            </span>



                        ) : (
                            <span className="flex items-center justify-center mt-[1px]">
                            <img src={selectedExchange.icon} alt={selectedExchange.title} className={`w-[24px] rounded-full`} />
                          </span>
                        )}
          </div>

          {/* Non-custodial Wallet Option (Disabled) */}
                        <Address/>
        </div>

        {/* Continue Button */}
        {/* <button
          className="mt-8 py-3 rounded-lg text-white font-semibold transition w-full bg-gray-400 cursor-not-allowed"
          disabled
        >
          Continue
        </button> */}
      </div>
      <Footer/>
    </div>

    <Exchanges showExchange={showExchange} setShowExchange={setShowExchange} />


    </>
  );
}

export default Airdrop;