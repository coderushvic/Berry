import React, { useState, useEffect } from 'react';
import { updateDoc, doc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import axios from 'axios';
import { useUser } from "../../context/userContext";
import { IoCheckmarkCircleSharp } from 'react-icons/io5';
import { BsCheck2Circle } from "react-icons/bs";

const TaskMenu = () => {
  const { 
    id, 
    setBalance, 
    completedTasks, 
    setTaskPoints, 
    setCompletedTasks, 
    tasks, 
    setTasks 
  } = useUser();
  
  const [countdowns, setCountdowns] = useState({});
  const [currentError, setCurrentError] = useState({});
  const [showVerifyButtons, setShowVerifyButtons] = useState({});
  const [countdownFinished, setCountdownFinished] = useState({});
  const [claiming, setClaiming] = useState({});
  const [congrats, setCongrats] = useState(false);
  const [claimedBonus, setClaimedBonus] = useState(0);

  const telegramBotToken = process.env.REACT_APP_BOT_TOKEN;

  // Clear success message after timeout
  useEffect(() => {
    if (congrats) {
      const timer = setTimeout(() => setCongrats(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [congrats]);

  const cleanUrl = (url) => {
    if (!url) return '';
    // Remove democats.netlify.app prefix if present
    const cleaned = url.replace(/^(https?:\/\/)?([^/]+\.)?democats\.netlify\.app\//i, '');
    // Ensure it has https:// if not already present (except for telegram links)
    return cleaned.startsWith('http') || cleaned.startsWith('t.me') ? cleaned : `https://${cleaned}`;
  };

  const performTask = (taskId) => {
    const task = tasks.find(task => task.id === taskId);
    if (!task || !task.link) {
      setCurrentError({ [taskId]: "Task link is missing" });
      return;
    }

    const cleanedLink = cleanUrl(task.link);
    try {
      // Open in new tab with security attributes
      const newWindow = window.open(cleanedLink, '_blank', 'noopener,noreferrer');
      if (newWindow) newWindow.opener = null;
      
      setTimeout(() => {
        setShowVerifyButtons(prev => ({ ...prev, [taskId]: true }));
      }, 2000);
    } catch (error) {
      console.error('Error opening link:', error);
      setCurrentError({ [taskId]: "Could not open task link" });
    }
  };

  // ... rest of the component remains exactly the same ...
  const checkTelegramMembership = async (taskId) => {
    try {
      const task = tasks.find(task => task.id === taskId);
      const response = await axios.get(
        `https://api.telegram.org/bot${telegramBotToken}/getChatMember`,
        {
          params: {
            chat_id: task.chatId,
            user_id: id,
          }
        }
      );

      const isValidMember = ['member', 'administrator', 'creator'].includes(response.data.result?.status);
      
      if (response.data.ok && isValidMember) {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, verified: true } : t));
        claimTask(taskId);
      } else {
        showError(taskId, "Verification failed. Please join the channel completely.");
      }
    } catch (error) {
      console.error('Verification error:', error);
      showError(taskId, "Verification failed. Could not verify membership.");
    }
  };

  const showError = (taskId, message) => {
    setCurrentError({ [taskId]: message });
    setTimeout(() => setCurrentError({}), 7000);
  };

  const startCountdown = (taskId) => {
    setCurrentError({});
    setCountdowns({ ...countdowns, [taskId]: 5 });

    const countdownInterval = setInterval(() => {
      setCountdowns(prev => {
        const newCount = prev[taskId] - 1;
        if (newCount <= 0) {
          clearInterval(countdownInterval);
          setCountdownFinished(prev => ({ ...prev, [taskId]: true }));
          return { ...prev, [taskId]: 0 };
        }
        return { ...prev, [taskId]: newCount };
      });
    }, 1000);

    checkTelegramMembership(taskId);
  };

  const claimTask = async (taskId) => {
    setClaiming({ ...claiming, [taskId]: true });
    try {
      const task = tasks.find(t => t.id === taskId);
      const userDocRef = doc(db, 'telegramUsers', id);

      await updateDoc(userDocRef, {
        balance: increment(task.bonus),
        tasksCompleted: arrayUnion(taskId),
        taskPoints: increment(task.bonus),
      });

      setBalance(prev => prev + task.bonus);
      setCompletedTasks(prev => [...prev, taskId]);
      setTaskPoints(prev => prev + task.bonus);
      setClaimedBonus(task.bonus);
      setCongrats(true);
      
      // Mark task as claimed in local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, claimed: true } : task
      ));
    } catch (error) {
      console.error('Claim error:', error);
      showError(taskId, "Failed to claim reward. Please try again.");
    } finally {
      setClaiming({ ...claiming, [taskId]: false });
    }
  };

  const formatNumber = (number) => {
    if (!number && number !== 0) return '0';
    if (number >= 1e6) return (number / 1e6).toFixed(1) + 'M';
    if (number >= 1e3) return (number / 1e3).toFixed(1) + 'K';
    return number.toLocaleString();
  };

  return (
    <div className="space-y-4">
      {/* Success Notification */}
      <div className={`fixed inset-x-0 top-4 z-50 px-4 transition-all duration-300 ${
        congrats ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
      }`}>
        <div className="mx-auto max-w-md bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium flex items-center space-x-2 rounded-xl shadow-lg p-4">
          <IoCheckmarkCircleSharp size={20} className="text-white" />
          <span>Meow! Task completed successfully! +{formatNumber(claimedBonus)} NEWCATS 🐈‍⬛</span>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.map(task => {
          const isCompleted = completedTasks.includes(task.id);
          const isVerifying = countdowns[task.id] > 0;
          const showError = currentError[task.id];
          const showVerify = showVerifyButtons[task.id] && !isCompleted;

          if (isCompleted) return null;

          return (
            <div key={task.id} className="relative flex items-center justify-between gap-4 rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 p-4 hover:shadow-sm transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-1 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900 truncate">
                    {task.title}
                  </h3>
                </div>
                
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 px-2 py-1 rounded-full">
                    +{formatNumber(task.bonus)} NEWCATS
                  </span>
                  
                  {showVerify && (
                    <button
                      onClick={() => startCountdown(task.id)}
                      disabled={isVerifying}
                      className={`text-sm h-7 px-3 rounded-full font-medium transition-all ${
                        isVerifying 
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700'
                      }`}
                    >
                      {isVerifying ? `${countdowns[task.id]}s` : 'Verify'}
                    </button>
                  )}
                </div>

                {showError && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 p-1.5 rounded-lg border border-red-100 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {currentError[task.id]}
                  </div>
                )}
              </div>

              <button
                onClick={() => performTask(task.id)}
                disabled={task.verified && countdownFinished[task.id]}
                className="h-9 px-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:bg-gray-300"
              >
                Join
              </button>
            </div>
          );
        })}
      </div>

      {/* Completed Tasks Section */}
      {tasks.some(t => completedTasks.includes(t.id)) && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Completed Tasks
          </h3>
          <div className="space-y-3">
            {tasks.filter(t => completedTasks.includes(t.id)).map(task => (
              <div key={task.id} className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-gray-300 p-4 bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 line-through">
                      {task.title}
                    </h3>
                    {task.claimed && (
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                        Claimed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 px-2 py-0.5 rounded-full">
                      +{formatNumber(task.bonus)} NEWCATS
                    </span>
                  </div>
                </div>
                
                {!task.claimed ? (
                  <button
                    onClick={() => claimTask(task.id)}
                    disabled={claiming[task.id]}
                    className="h-9 px-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50"
                  >
                    {claiming[task.id] ? 'Claiming...' : 'Claim'}
                  </button>
                ) : (
                  <div className="p-2 rounded-full bg-emerald-100 text-emerald-600">
                    <BsCheck2Circle size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskMenu;
