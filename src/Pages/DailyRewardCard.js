import React from "react";

const DailyRewardCard = () => {
  const handleStartClick = () => {
    window.location.href = "/DailyCheckIn";
  };

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-gray-800">Daily Check-In</h3>
            <p className="text-sm text-gray-600">Claim your daily reward</p>
          </div>
          
          <button
            onClick={handleStartClick}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            Claim Now
          </button>
        </div>
        
        {/* Optional: Add a progress indicator or streak counter */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Your streak: 0 days</span>
            <span className="font-medium text-blue-600">+100 NEWCATS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyRewardCard;
