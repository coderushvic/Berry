import React, { useState, useEffect } from "react";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { doc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useUser } from "../../context/userContext";

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
    adsBalance,
    setAdsBalance
  } = useUser();

  const [adWatched, setAdWatched] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [congrats, setCongrats] = useState(false);
  const [showAdCooldown, setShowAdCooldown] = useState(0);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [adError, setAdError] = useState(null);
  const [interstitialLoading, setInterstitialLoading] = useState(false);

  const task = {
    pointsBonus: 1000, // Newcats Points reward
    dollarBonus: 10.001, // Virtual Dollars reward
  };

  const generateTaskId = () => `adTask_${new Date().getTime()}`;
  const [taskId, setTaskId] = useState(generateTaskId());

  useEffect(() => {
    // Load Popads script
    const existingScript = document.querySelector('script[src="//zidreersatsy.com/sdk.js"]');
    if (existingScript) return;

    const tag = document.createElement("script");
    tag.src = "//zidreersatsy.com/sdk.js";
    tag.dataset.zone = "9000356";
    tag.dataset.sdk = "show_9000356";
    tag.async = true;
    tag.onerror = () => {
      console.error("Failed to load ad script");
      setAdError("Failed to load ad provider. Please refresh the page.");
      setIsAdLoading(false);
      setInterstitialLoading(false);
    };
    document.body.appendChild(tag);

    return () => {
      if (tag.parentNode) {
        document.body.removeChild(tag);
      }
    };
  }, []);

  // Rewarded Ad (Type 1)
  const showRewardedAd = async () => {
    const now = Date.now();
    const twentyMinutes = 20 * 60 * 1000;

    if (adsWatched >= 100) {
      alert("You have reached the daily ad limit of 100. Try again tomorrow.");
      return;
    }

    if (lastAdTime && now - lastAdTime < twentyMinutes) {
      const waitMinutes = Math.ceil((twentyMinutes - (now - lastAdTime)) / 60000);
      alert(`Please wait ${waitMinutes} minute(s) before watching another ad.`);
      return;
    }

    if (showAdCooldown > 0) return;
    setIsAdLoading(true);
    setAdError(null);

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log("Showing mock rewarded ad for development");
        await new Promise(resolve => setTimeout(resolve, 2000));
        handleAdCompletion();
        return;
      }

      if (!window.show_9000356) {
        throw new Error("Ad provider not loaded yet");
      }

      await window.show_9000356('pop')
        .then(() => {
          handleAdCompletion();
        })
        .catch(error => {
          console.error("Rewarded ad error:", error);
          setAdError("Ad was not completed. Please try again.");
        });

    } catch (error) {
      console.error("Error showing rewarded ad:", error);
      setAdError("Failed to load ad. Please try again later.");
    } finally {
      setIsAdLoading(false);
    }
  };

  // Interstitial Ad (Type 2)
  const showInterstitialAd = async () => {
    setInterstitialLoading(true);
    setAdError(null);

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log("Showing mock interstitial ad for development");
        await new Promise(resolve => setTimeout(resolve, 2000));
        return;
      }

      if (!window.show_9000356) {
        throw new Error("Ad provider not loaded yet");
      }

      await window.show_9000356({ 
        type: 'inApp', 
        inAppSettings: { 
          frequency: 2, 
          capping: 0.1, 
          interval: 30, 
          timeout: 5, 
          everyPage: false 
        } 
      });

    } catch (error) {
      console.error("Error showing interstitial ad:", error);
      setAdError("Failed to show interstitial ad");
    } finally {
      setInterstitialLoading(false);
    }
  };

  // Standard Popup Ad (Type 3)
  const showPopupAd = async () => {
    setIsAdLoading(true);
    setAdError(null);

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log("Showing mock popup ad for development");
        await new Promise(resolve => setTimeout(resolve, 2000));
        return;
      }

      if (!window.show_9000356) {
        throw new Error("Ad provider not loaded yet");
      }

      await window.show_9000356('pop');

    } catch (error) {
      console.error("Error showing popup ad:", error);
      setAdError("Failed to show popup ad");
    } finally {
      setIsAdLoading(false);
    }
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
      alert("You have already claimed this reward.");
      return;
    }
    if (!adWatched) {
      alert("You need to watch an ad before claiming the reward.");
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
      alert("An error occurred while claiming your reward. Please try again.");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="mb-4 grid gap-3">
      {/* Rewarded Ad Section */}
      <div className="relative flex items-center justify-between gap-4 rounded-lg border p-3">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-medium leading-tight text-black">
            Watch Rewarded Ad
          </h1>
          <span className="text-sm font-medium text-black">
            +{task.pointsBonus} NEWCATS (${task.dollarBonus.toFixed(3)} USD)
          </span>
          <span className="text-sm text-gray-600">
            Your Ads Balance: ${adsBalance.toFixed(3)} USD
          </span>
          {adError && (
            <span className="text-xs text-red-500">{adError}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={showRewardedAd}
            disabled={showAdCooldown > 0 || isAdLoading}
            className={`inline-flex items-center justify-center font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 w-24 rounded-full px-4 py-1 text-sm ${
              showAdCooldown > 0 || isAdLoading
                ? "bg-gray-300 text-gray-700"
                : "bg-[#000000] text-white hover:bg-slate-800"
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
              `Wait ${showAdCooldown}s`
            ) : (
              "Show Ad"
            )}
          </button>
          <button
            onClick={claimReward}
            disabled={!adWatched || claiming}
            className={`inline-flex items-center justify-center font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 w-24 rounded-full px-4 py-1 text-sm ${
              claiming
                ? "bg-gray-200 text-[#888]"
                : adWatched
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-200 text-gray-500"
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

      {/* Interstitial Ad Section */}
      <div className="relative flex items-center justify-between gap-4 rounded-lg border p-3 bg-blue-50">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-medium leading-tight text-black">
            View Interstitial Ad
          </h1>
          <span className="text-sm text-gray-600">
            Full-screen ad (2 ads every 6 minutes)
          </span>
        </div>
        <button
          onClick={showInterstitialAd}
          disabled={interstitialLoading}
          className={`inline-flex items-center justify-center font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 w-24 rounded-full px-4 py-1 text-sm ${
            interstitialLoading
              ? "bg-gray-300 text-gray-700"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {interstitialLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading
            </span>
          ) : (
            "Show Ad"
          )}
        </button>
      </div>

      {/* Popup Ad Section */}
      <div className="relative flex items-center justify-between gap-4 rounded-lg border p-3 bg-purple-50">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-medium leading-tight text-black">
            View Popup Ad
          </h1>
          <span className="text-sm text-gray-600">
            Standard popup ad (no reward)
          </span>
        </div>
        <button
          onClick={showPopupAd}
          disabled={isAdLoading}
          className={`inline-flex items-center justify-center font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 w-24 rounded-full px-4 py-1 text-sm ${
            isAdLoading
              ? "bg-gray-300 text-gray-700"
              : "bg-purple-500 text-white hover:bg-purple-600"
          }`}
        >
          {isAdLoading ? "Loading..." : "Show Ad"}
        </button>
      </div>

      {congrats && (
        <div className="fixed top-4 left-0 right-0 flex items-center justify-center px-4 z-[60]">
          <span className="text-accent text-[13px] w-full bg-[#e1f2e8] shadow-[#cacaca] font-medium text-[#227b3f] flex items-center space-x-1 shadow-md rounded-[8px] py-4 px-4">
            <IoCheckmarkCircleSharp size={20} className="text-[#0c883a]" />
            <span>Meow! Task is Completed 🐈‍⬛ </span>
          </span>
        </div>
      )}
    </div>
  );
};

export default AdTask;
