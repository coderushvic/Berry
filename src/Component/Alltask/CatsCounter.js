import React from 'react';
import { useUser } from '../../context/userContext';
import { FaGift, FaTasks, FaUserFriends } from 'react-icons/fa';

// Utility function to abbreviate numbers
const abbreviateNumber = (value) => {
  if (value >= 1e6) {
    return (value / 1e6).toFixed(1) + 'M';
  } else if (value >= 1e3) {
    return (value / 1e3).toFixed(1) + 'k';
  } else {
    return value.toString();
  }
};

const CatsCounter = () => {
  const { balance, welcomeBonus, taskPoints, refBonus } = useUser();

  const formattedBalance = abbreviateNumber(balance);
  const formattedWelcomeBonus = abbreviateNumber(welcomeBonus);
  const formattedTaskPoints = abbreviateNumber(taskPoints);
  const formattedRefBonus = abbreviateNumber(refBonus);

  return (
    <div className="cats-counter bg-gradient-to-br from-purple-900 to-indigo-800 rounded-2xl p-6 shadow-xl max-w-md mx-auto mb-8"> {/* Added mb-8 for bottom margin */}
      <div className="total-balance mb-6 text-center">
        <h2 className="text-gray-200 text-sm font-medium mb-1">Your NEWCATS Balance</h2>
        <h1 className="text-4xl font-bold text-white tracking-tight">
          {formattedBalance} <span className="text-yellow-300">NEWCATS</span>
        </h1>
      </div>
      
      <div className="stats-grid grid grid-cols-3 gap-4">
        <StatItem 
          label="Rewards" 
          value={`+${formattedWelcomeBonus}`} 
          hasValue={true}
          icon={<FaGift className="text-yellow-300" />}
        />
        <StatItem 
          label="Tasks" 
          value={`${taskPoints > 0 ? '+' : ''}${formattedTaskPoints}`} 
          hasValue={taskPoints > 0}
          icon={<FaTasks className="text-blue-300" />}
        />
        <StatItem 
          label="Invites" 
          value={`${refBonus > 0 ? '+' : ''}${formattedRefBonus}`} 
          hasValue={refBonus > 0}
          icon={<FaUserFriends className="text-green-300" />}
        />
      </div>
    </div>
  );
};

const StatItem = ({ label, value, hasValue, icon }) => {
  return (
    <div className="stat-item bg-white bg-opacity-10 rounded-lg p-3 text-center backdrop-blur-sm hover:bg-opacity-20 transition-all">
      <p className="text-gray-300 text-xs font-medium mb-1">{label}</p>
      <div className="value-container relative inline-flex items-center">
        <span className={`text-lg font-semibold ${hasValue ? 'text-yellow-300' : 'text-gray-400'}`}>
          {value}
        </span>
        <div className="icon-container ml-2">
          {React.cloneElement(icon, {
            className: `${icon.props.className} text-xl opacity-90`
          })}
        </div>
      </div>
    </div>
  );
};

export default CatsCounter;
