import React from "react";
import { useNavigate } from "react-router-dom";
import { BarChart2, DollarSign } from "react-feather";

const Userdashcard = () => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate("/userdash");
  };

  return (
    <div className="mb-6 grid gap-4">
      <div 
        onClick={handleCardClick}
        className="relative flex items-center justify-between gap-5 rounded-xl p-4 cursor-pointer transition-all bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl active:scale-[98%]"
      >
        <div className="flex items-center gap-4">
          {/* Large icon container with pulse animation */}
          <div className="p-3 rounded-xl bg-green-700 text-white animate-pulse">
            <BarChart2 size={28} strokeWidth={2.5} />
          </div>
          
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold leading-tight text-white flex items-center gap-3">
              ADS REVENUE DASHBOARD
              <DollarSign size={20} strokeWidth={2.5} className="text-white" />
            </h1>
            <span className="text-base font-semibold text-green-100">
              CLICK TO VIEW YOUR EARNINGS & PERFORMANCE
            </span>
          </div>
        </div>
        
        {/* Large chevron icon */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="text-white"
        >
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </div>
    </div>
  );
};

export default Userdashcard;
