import React, { useState, useEffect } from "react";
import { IoCheckmarkCircleSharp, IoTimeOutline } from "react-icons/io5";
import { doc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useUser } from "../../context/userContext";
import { motion, AnimatePresence } from "framer-motion";

const AdTask = () => {
  const {
    id,
    setBalance,
    setTaskPoints,
    completedDailyTasks,
    setCompletedDailyTasks,
    adsWatched,
    setAdsWatched,
    lastAdTime,
    setLastAdTime,
    setAdsBalance
  } = useUser();

  const [adWatched, setAdWatched] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [congrats, setCongrats] = useState(false);
  const [showAdCooldown, setShowAdCooldown] = useState(0);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [adError, setAdError] = useState(null);
  const [showCooldownPopup, setShowCooldownPopup] = useState(false);
  const [cooldownMessage, setCooldownMessage] = useState("");

  const task = {
    pointsBonus: 1000,
    dollarBonus: 10.001,
    dailyLimit: 100,
    cooldown: 20 * 60 * 1000 // 20 minutes in milliseconds
  };

  const generateTaskId = () => `adTask_${new Date().getTime()}`;
  const [taskId, setTaskId] = useState(generateTaskId());

  useEffect(() => {
    if (window.show_9123134) return;
    const existingScript = document.querySelector('script[data-zone="8693006"]');
    if (existingScript) return;

    const tag = document.createElement("script");
    tag.src = "//whephiwums.com/sdk.js";
    tag.dataset.zone = "8693006";
    tag.dataset.sdk = "show_8693006";
    tag.async = true;
    tag.onerror = () => {
      console.error("Failed to load ad script");
      setAdError("Failed to load ad provider. Please refresh the page.");
      setIsAdLoading(false);
    };
    document.body.appendChild(tag);

    return () => {
      if (tag.parentNode) {
        document.body.removeChild(tag);
      }
    };
  }, []);

  const showAd = async () => {
    const now = Date.now();

    // Check daily limit
    if (adsWatched >= task.dailyLimit) {
      showCooldownNotification(`Daily limit reached (${task.dailyLimit} ads). Try again tomorrow.`);
      return;
    }

    // Check cooldown
    if (lastAdTime && now - lastAdTime < task.cooldown) {
      const remainingTime = task.cooldown - (now - lastAdTime);
      const waitMinutes = Math.ceil(remainingTime / 60000);
      showCooldownNotification(`Please wait ${waitMinutes} minute${waitMinutes > 1 ? 's' : ''} before watching another ad.`);
      return;
    }

    if (showAdCooldown > 0) return;
    
    setIsAdLoading(true);
    setAdError(null);

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log("Showing mock ad for development");
        await new Promise(resolve => setTimeout(resolve, 2000));
        handleAdCompletion();
        return;
      }
      
      if (!window.show_8693006) {
        throw new Error("Ad provider not loaded yet");
      }
      
      await window.show_8693006();
      handleAdCompletion();
    } catch (error) {
      console.error("Error showing ad:", error);
      setAdError("Failed to load ad. Please try again later.");
    } finally {
      setIsAdLoading(false);
    }
  };

  const showCooldownNotification = (message) => {
    setCooldownMessage(message);
    setShowCooldownPopup(true);
    setTimeout(() => setShowCooldownPopup(false), 3000);
  };

  const handleAdCompletion = () => {
    setAdWatched(true);
    setLastAdTime(Date.now());
    setAdsWatched(prev => prev + 1);
    setShowAdCooldown(5);
    
    const countdown = setInterval(() => {
      setShowAdCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const claimReward = async () => {
    if (completedDailyTasks.includes(taskId)) {
      showCooldownNotification("You've already claimed this reward!");
      return;
    }
    
    if (!adWatched) {
      showCooldownNotification("Please watch an ad first to claim rewards!");
      return;
    }

    setClaiming(true);
    
    try {
      const userDocRef = doc(db, "telegramUsers", id);
      await updateDoc(userDocRef, {
        balance: increment(task.pointsBonus),
        dailyTasksCompleted: arrayUnion(taskId),
        taskPoints: increment(task.pointsBonus),
        adsBalance: increment(task.dollarBonus),
      });

      setBalance(prev => prev + task.pointsBonus);
      setTaskPoints(prev => prev + task.pointsBonus);
      setAdsBalance(prev => +(prev + task.dollarBonus).toFixed(6));
      setCompletedDailyTasks(prev => [...prev, taskId]);

      setAdWatched(false);
      setCongrats(true);
      setTimeout(() => setCongrats(false), 4000);
      setTaskId(generateTaskId());
    } catch (error) {
      console.error("Error claiming reward:", error);
      showCooldownNotification("Error claiming reward. Please try again.");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="mb-4 grid gap-3 relative w-full max-w-md mx-auto">
      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
        <div className="flex flex-col gap-1.5 w-full sm:w-auto">
          <h1 className="font-medium leading-tight text-gray-900">
            Watch an Ad to Earn
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded">
              +{task.pointsBonus} NEWCATS
            </span>
            <span className="text-sm font-medium bg-green-50 text-green-600 px-2 py-1 rounded">
              ${task.dollarBonus.toFixed(3)} USD
            </span>
          </div>
          {adError && (
            <span className="text-xs text-red-500 mt-1">{adError}</span>
          )}
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={showAd}
            disabled={showAdCooldown > 0 || isAdLoading}
            className={`inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none disabled:pointer-events-none h-9 w-full sm:w-24 rounded-lg px-4 py-2 text-sm ${
              showAdCooldown > 0 || isAdLoading
                ? "bg-gray-100 text-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
            }`}
          >
            {isAdLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading
              </span>
            ) : showAdCooldown > 0 ? (
              `${showAdCooldown}s`
            ) : (
              "Show Ad"
            )}
          </button>
          
          <button
            onClick={claimReward}
            disabled={!adWatched || claiming}
            className={`inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none disabled:pointer-events-none h-9 w-full sm:w-24 rounded-lg px-4 py-2 text-sm ${
              claiming
                ? "bg-gray-100 text-gray-400"
                : adWatched
                ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {claiming ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Claiming
              </span>
            ) : (
              "Claim"
            )}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {congrats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-0 right-0 flex items-center justify-center px-4 z-[60]"
          >
            <div className="w-full max-w-md bg-green-50 border border-green-200 text-green-700 font-medium rounded-lg py-3 px-4 flex items-center gap-2 shadow-lg">
              <IoCheckmarkCircleSharp size={20} className="text-green-500" />
              <span>Reward claimed successfully! 🎉</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cooldown Popup */}
      <AnimatePresence>
        {showCooldownPopup && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-0 right-0 flex items-center justify-center px-4 z-[60]"
          >
            <div className="w-full max-w-md bg-blue-50 border border-blue-200 text-blue-700 font-medium rounded-lg py-3 px-4 flex items-center gap-2 shadow-lg">
              <IoTimeOutline size={20} className="text-blue-500" />
              <span>{cooldownMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdTask;
