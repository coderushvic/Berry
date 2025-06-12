import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import { useUser } from "../../context/userContext";
import { IoCheckmarkCircleSharp } from 'react-icons/io5';
import { BsCheck2Circle } from 'react-icons/bs';
import { motion, AnimatePresence } from 'framer-motion';

const ManualTasks = () => {
  const { 
    id, 
    setBalance, 
    setTaskPoints, 
    userManualTasks,
    manualTasks,
    setUserManualTasks,
  } = useUser();
  
  const [startedTasks, setStartedTasks] = useState({});
  const [claiming, setClaiming] = useState({});
  const [claimError, setClaimError] = useState(null);
  const [claimedBonus, setClaimedBonus] = useState(null);
  const [congrats, setCongrats] = useState(false);

  const cleanUrl = (url) => {
    if (!url) return '';
      
      // Remove any existing protocol and domain
      const cleaned = url
        .replace(/^(https?:\/\/)?([^/]+\.)?democats\.netlify\.app\//i, '')
        .replace(/^(https?:\/\/)?/i, '');
        
      return cleaned.startsWith('http') ? cleaned : `https://${cleaned}`;
    };
  const startTask = (taskId) => {
    const task = manualTasks.find(task => task.id === taskId);
    if (!task || !task.link) {
      setClaimError('Task link is missing');
      return;
    }

    const cleanedLink = cleanUrl(task.link);
    
    try {
      // Open in new tab with noopener for security
      const newWindow = window.open(cleanedLink, '_blank', 'noopener,noreferrer');
      if (newWindow) newWindow.opener = null;
      
      setStartedTasks(prev => ({ ...prev, [taskId]: true }));
    } catch (error) {
      console.error('Error opening link:', error);
      setClaimError('Could not open task link');
    }
  };

  const claimTask = async (taskId) => {
    setClaiming({ ...claiming, [taskId]: true });
    setClaimError(null);
    
    try {
      const task = manualTasks.find(task => task.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      const userDocRef = doc(db, 'telegramUsers', id);

      await updateDoc(userDocRef, {
        balance: increment(task.bonus),
        manualTasks: arrayUnion(taskId),
        taskPoints: increment(task.bonus),
      });

      setBalance(prev => prev + task.bonus);
      setUserManualTasks(prev => [...prev, taskId]);
      setTaskPoints(prev => prev + task.bonus);
      setClaimedBonus(task.bonus);
      setCongrats(true);

      setTimeout(() => setCongrats(false), 4000);
    } catch (error) {
      console.error('Error claiming task:', error);
      setClaimError('Failed to claim the task. Please try again.');
    } finally {
      setClaiming({ ...claiming, [taskId]: false });
    }
  };

  const formatNumber = (num) => {
    if (typeof num !== "number") return "0";
    return Math.round(num).toLocaleString('en').replace(/,/g, ' ');
  };  

  return (
    <div className="w-full pb-4">
      <div className="max-w-md mx-auto px-4 space-y-3">
        {manualTasks.map(task => {
          const isCompleted = userManualTasks.includes(task.id);
          const isStarted = startedTasks[task.id];
          
          return (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`relative flex items-center justify-between gap-4 p-4 rounded-xl ${
                isCompleted 
                  ? 'bg-gray-50 border border-gray-200' 
                  : 'bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                  <img 
                    src={task.icon || '/default-task-icon.svg'} 
                    alt={task.title}
                    className="w-6 h-6"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = '/default-task-icon.svg';
                    }}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 px-2 py-0.5 rounded-full">
                      +{formatNumber(task.bonus)} NEWCATS
                    </span>
                    {isCompleted && (
                      <span className="text-xs bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Claimed!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!isCompleted ? (
                <div className="flex items-center gap-2">
                  {!isStarted ? (
                    <motion.button
                      onClick={() => startTask(task.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition-colors"
                    >
                      Start Task
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => claimTask(task.id)}
                      disabled={claiming[task.id]}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full hover:from-purple-600 hover:to-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {claiming[task.id] ? 'Claiming...' : 'Claim'}
                    </motion.button>
                  )}
                </div>
              ) : (
                <div className="p-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full">
                  <BsCheck2Circle size={18} className="text-emerald-600"/>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {congrats && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-0 right-0 mx-auto z-50 w-full max-w-md px-4 flex justify-center"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 shadow-lg">
              <IoCheckmarkCircleSharp className="text-white" size={20} />
              <span className="text-sm font-medium">
                Meow! Task Completed (+{formatNumber(claimedBonus)} NEWCATS) 🐈‍⬛
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {claimError && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-0 right-0 mx-auto z-50 w-full max-w-md px-4 flex justify-center"
          >
            <div className="bg-red-100 border border-red-200 text-red-800 px-6 py-3 rounded-xl flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {claimError}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default ManualTasks;
