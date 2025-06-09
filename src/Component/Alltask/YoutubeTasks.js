import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../../firebase/firestore'; 
import { useUser } from "../../context/userContext"; 
import { IoCheckmarkCircleSharp } from 'react-icons/io5';
import { BsCheck2Circle } from 'react-icons/bs';
import { PiYoutubeLogoBold } from "react-icons/pi";
import { motion } from 'framer-motion';

const YoutubeTasks = () => {
  const { id, setBalance, setTaskPoints, completedYoutubeTasks, setCompletedYoutubeTasks, youtubeTasks, setYoutubeTasks } = useUser();
  const [countdowns, setCountdowns] = useState({});
  const [currentError, setCurrentError] = useState({});
  const [showVerifyButtons, setShowVerifyButtons] = useState({});
  const [countdownFinished, setCountdownFinished] = useState({});
  const [claiming, setClaiming] = useState({});
  const [claimedBonus, setClaimedBonus] = useState(0);
  const [congrats, setCongrats] = useState(false);

  const performTask = (taskId) => {
    const task = youtubeTasks.find(task => task.id === taskId);
    window.open(task.link, '_blank');
    setTimeout(() => {
      setShowVerifyButtons({ ...showVerifyButtons, [taskId]: true });
    }, 2000);
  };
  
  const startCountdown = (taskId) => {
    setCurrentError({});
    setCountdowns({ ...countdowns, [taskId]: 5 });
  
    const countdownInterval = setInterval(() => {
      setCountdowns(prevCountdowns => {
        const newCountdown = prevCountdowns[taskId] - 1;
        if (newCountdown <= 0) {
          clearInterval(countdownInterval);
          setCountdownFinished({ ...countdownFinished, [taskId]: true });
          setYoutubeTasks(prevTasks =>
            prevTasks.map(task => 
              task.id === taskId ? { ...task, verified: true } : task
            )
          );
          claimTask(taskId);
          return { ...prevCountdowns, [taskId]: 0 };
        }
        return { ...prevCountdowns, [taskId]: newCountdown };
      });
    }, 1000);
  };

  const claimTask = async (taskId) => {
    setClaiming({ ...claiming, [taskId]: true });
    try {
      const task = youtubeTasks.find(task => task.id === taskId);
      const userDocRef = doc(db, 'telegramUsers', id);
  
      await updateDoc(userDocRef, {
        balance: increment(task.bonus),
        taskPoints: increment(task.bonus),
        completedYoutubeTasks: arrayUnion(taskId),
      });
  
      setBalance(prev => prev + task.bonus);
      setCompletedYoutubeTasks(prev => [...prev, taskId]);
      setTaskPoints(prev => prev + task.bonus);
      setClaimedBonus(task.bonus);
      setCongrats(true);
  
      setTimeout(() => setCongrats(false), 4000);
    } catch (error) {
      console.error('Error claiming task:', error);
      setCurrentError({ [taskId]: 'Failed to claim the task. Please try again.' });
    } finally {
      setClaiming({ ...claiming, [taskId]: false });
    }
  };

  const formatNumber = (num) => {
    if (typeof num !== "number") return "Invalid number";
    return Math.round(num).toLocaleString('en').replace(/,/g, ' ');
  };

  // Filter out completed tasks from the main list
  const incompleteTasks = youtubeTasks.filter(task => !completedYoutubeTasks.includes(task.id));
  const completedTasks = youtubeTasks.filter(task => completedYoutubeTasks.includes(task.id));

  return (
    <div className="mb-4 space-y-3">
      {/* Incomplete Tasks */}
      {incompleteTasks.map(task => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex relative items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
              <PiYoutubeLogoBold className="text-red-600 text-xl" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-800 truncate">
                {task.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 px-2 py-0.5 rounded-full">
                  +{formatNumber(task.bonus)} NEWCATS
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => performTask(task.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
            >
              <PiYoutubeLogoBold size={20} />
            </motion.button>

            {showVerifyButtons[task.id] && !countdowns[task.id] && (
              <motion.button
                onClick={() => startCountdown(task.id)}
                disabled={task.verified && countdownFinished[task.id]}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full hover:from-purple-600 hover:to-indigo-700"
              >
                Verify
              </motion.button>
            )}

            {countdowns[task.id] > 0 && (
              <div className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
                {countdowns[task.id]}s
              </div>
            )}
          </div>
        </motion.div>
      ))}

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Completed Tasks
          </h3>
          <div className="space-y-3">
            {completedTasks.map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-dashed border-gray-300"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                    <PiYoutubeLogoBold className="text-red-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 line-through">
                      {task.title}
                    </h3>
                    <span className="text-sm bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 px-2 py-0.5 rounded-full">
                      +{formatNumber(task.bonus)} NEWCATS
                    </span>
                  </div>
                </div>
                <div className="p-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-600">
                  <BsCheck2Circle size={20} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Success Notification */}
      {congrats && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-3 rounded-xl flex items-center space-x-2 shadow-lg">
            <IoCheckmarkCircleSharp size={20} className="text-white" />
            <span className="text-sm font-medium">
              Meow! Task completed successfully! +{formatNumber(claimedBonus)} NEWCATS 🐈‍⬛
            </span>
          </div>
        </motion.div>
      )}

      {/* Error Notification */}
      {Object.keys(currentError).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {Object.values(currentError)[0]}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default YoutubeTasks;
