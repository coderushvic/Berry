import React, { useState, useEffect, useMemo } from "react";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { FaAd, FaCrown, FaSyncAlt } from "react-icons/fa";
import { doc, updateDoc, increment, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useUser } from "../../context/userContext";

// Move defaultConfig outside the component since it never changes
const defaultConfig = {
  bonus: 1000,
  dailyLimit: 50,
  cooldownSeconds: 5,
  ads: [
    {
      id: "default_ad",
      name: "Sponsored Content",
      scriptSrc: "//whephiwums.com/sdk.js",
      zoneId: "8693006",
      sdkVar: "show_8693006",
      active: true,
      weight: 1,
      estimatedTime: "15-30 seconds"
    }
  ]
};

const AdTask = () => {
  const {
    id,
    setBalance,
    setTaskPoints,
    completedDailyTasks,
    setCompletedDailyTasks,
    userData,
  } = useUser();

  const [adWatched, setAdWatched] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [congrats, setCongrats] = useState(false);
  const [showAdCooldown, setShowAdCooldown] = useState(0);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [adError, setAdError] = useState(null);
  const [adsConfig, setAdsConfig] = useState(null);
  const [adsWatchedToday, setAdsWatchedToday] = useState(0);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [adDetails, setAdDetails] = useState({
    name: "Advertisement",
    estimatedTime: "15-30 seconds"
  });

  // Memoize the task object since it depends on adsConfig
  const task = useMemo(() => ({
    bonus: adsConfig?.bonus || defaultConfig.bonus,
  }), [adsConfig?.bonus]);

  // Generate task ID function is stable since it doesn't depend on component scope
  const generateTaskId = useMemo(() => () => `adTask_${new Date().getTime()}`, []);
  const [taskId, setTaskId] = useState(generateTaskId());

  // Load ads configuration from Firestore
  useEffect(() => {
    const loadAdsConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, "adminConfig", "adsSettings"));
        if (configDoc.exists()) {
          setAdsConfig(configDoc.data());
        } else {
          setAdsConfig(defaultConfig);
        }
      } catch (error) {
        console.error("Error loading ads config:", error);
        setAdsConfig(defaultConfig);
      }
    };

    loadAdsConfig();
  }, []); // Empty array is safe since we moved defaultConfig outside

  // Load user's ads watched today
  useEffect(() => {
    if (!userData) return;
    
    const today = new Date().toISOString().split('T')[0];
    const adsToday = userData.dailyAdsWatched?.[today] || 0;
    setAdsWatchedToday(adsToday);
  }, [userData]); // Only depends on userData

  // Load current ad details
  useEffect(() => {
    if (!adsConfig || !adsConfig.ads || adsConfig.ads.length === 0) return;

    const activeAds = adsConfig.ads.filter(ad => ad.active);
    if (activeAds.length === 0) return;

    const selectAdByWeight = () => {
      const totalWeight = activeAds.reduce((sum, ad) => sum + (ad.weight || 1), 0);
      let random = Math.random() * totalWeight;
      let selectedIndex = 0;
      
      for (let i = 0; i < activeAds.length; i++) {
        random -= activeAds[i].weight || 1;
        if (random <= 0) {
          selectedIndex = i;
          break;
        }
      }
      
      return selectedIndex;
    };

    const adIndex = selectAdByWeight();
    setCurrentAdIndex(adIndex);
    const currentAd = activeAds[adIndex];
    
    setAdDetails({
      name: currentAd.name || "Advertisement",
      estimatedTime: currentAd.estimatedTime || "15-30 seconds"
    });
  }, [adsConfig, taskId]); // Reset when taskId changes

  // Load current ad script
  useEffect(() => {
    if (!adsConfig || !adsConfig.ads || adsConfig.ads.length === 0) return;

    const activeAds = adsConfig.ads.filter(ad => ad.active);
    if (activeAds.length === 0) return;

    const currentAd = activeAds[currentAdIndex];
    if (!currentAd) return;

    const existingScript = document.querySelector(`script[data-zone="${currentAd.zoneId}"]`);
    if (existingScript) return;

    const tag = document.createElement("script");
    tag.src = currentAd.scriptSrc;
    tag.dataset.zone = currentAd.zoneId;
    tag.dataset.sdk = currentAd.sdkVar;
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
  }, [adsConfig, currentAdIndex]); // Only depends on these values

  const showAd = async () => {
    if (showAdCooldown > 0) return;
    
    const dailyLimit = adsConfig?.dailyLimit || defaultConfig.dailyLimit;
    if (adsWatchedToday >= dailyLimit) {
      setAdError(`You've reached your daily limit of ${dailyLimit} ads. Come back tomorrow!`);
      return;
    }

    setIsAdLoading(true);
    setAdError(null);
    
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log("Showing mock ad for development");
        await new Promise(resolve => setTimeout(resolve, 2000));
        handleAdCompletion();
        return;
      }
      
      const activeAds = adsConfig?.ads?.filter(ad => ad.active) || [];
      if (activeAds.length === 0) {
        throw new Error("No active ads configured");
      }

      const currentAd = activeAds[currentAdIndex];
      const sdkVar = currentAd.sdkVar;
      
      if (!window[sdkVar]) {
        throw new Error("Ad provider not loaded yet");
      }

      await window[sdkVar]();
      handleAdCompletion();
    } catch (error) {
      console.error("Error showing ad:", error);
      setAdError("Failed to load ad. Please try again later.");
    } finally {
      setIsAdLoading(false);
    }
  };

  const handleAdCompletion = useMemo(() => () => {
    setAdWatched(true);
    const cooldown = adsConfig?.cooldownSeconds || defaultConfig.cooldownSeconds;
    setShowAdCooldown(cooldown);
    
    const countdown = setInterval(() => {
      setShowAdCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [adsConfig?.cooldownSeconds]);

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
      const today = new Date().toISOString().split('T')[0];
      const userDocRef = doc(db, "telegramUsers", id);
      
      await updateDoc(userDocRef, {
        balance: increment(task.bonus),
        dailyTasksCompleted: arrayUnion(taskId),
        taskPoints: increment(task.bonus),
        [`dailyAdsWatched.${today}`]: increment(1),
      });

      setBalance((prev) => prev + task.bonus);
      setCompletedDailyTasks((prev) => [...prev, taskId]);
      setTaskPoints((prev) => prev + task.bonus);
      setAdsWatchedToday(prev => prev + 1);

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

  const dailyLimit = adsConfig?.dailyLimit || defaultConfig.dailyLimit;
  const remainingAds = dailyLimit - adsWatchedToday;
  const progressPercentage = Math.min(100, (adsWatchedToday / dailyLimit) * 100);

  return (
    <div className="mb-6">
      {/* Task Card */}
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 shadow-lg border border-red-200">
        {/* Task Header with Crown Icon */}
        <div className="flex items-center mb-3">
          <div className="bg-red-500 p-2 rounded-lg mr-3">
            <FaAd className="text-white text-xl" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-red-900">Watch Ads & Earn</h3>
            <p className="text-red-700 text-sm">Complete simple tasks to earn rewards</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-red-800 mb-1">
            <span>Ads watched today: {adsWatchedToday}/{dailyLimit}</span>
            <span>{remainingAds} remaining</span>
          </div>
          <div className="w-full bg-red-200 rounded-full h-2.5">
            <div 
              className="bg-red-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Current Ad Info */}
        <div className="bg-white rounded-lg p-3 border border-red-100 mb-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold text-gray-800">Current Ad</h4>
              <p className="text-gray-600 text-sm">{adDetails.name}</p>
            </div>
            <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
              {adDetails.estimatedTime}
            </div>
          </div>
          
          {adsConfig?.ads?.length > 1 && (
            <button 
              onClick={() => setTaskId(generateTaskId())}
              className="text-xs text-red-600 hover:text-red-800 flex items-center mt-2"
              disabled={isAdLoading || showAdCooldown > 0}
            >
              <FaSyncAlt className="mr-1" /> Switch Ad
            </button>
          )}
        </div>

        {/* Reward Display */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-yellow-700">You'll earn</p>
            <p className="font-bold text-yellow-800">{task.bonus} NEWCATS</p>
          </div>
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            +{task.bonus} Points
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={showAd}
            disabled={showAdCooldown > 0 || isAdLoading || remainingAds <= 0}
            className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center ${
              showAdCooldown > 0 || isAdLoading || remainingAds <= 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700 shadow-md transform hover:scale-[1.02] transition-transform"
            }`}
          >
            {isAdLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading Ad...
              </span>
            ) : showAdCooldown > 0 ? (
              `Wait ${showAdCooldown}s`
            ) : remainingAds <= 0 ? (
              "Limit Reached"
            ) : (
              "Show Ad"
            )}
          </button>

          <button
            onClick={claimReward}
            disabled={!adWatched || claiming}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              claiming
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : adWatched
                ? "bg-green-600 text-white hover:bg-green-700 shadow-md transform hover:scale-[1.02] transition-transform"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {claiming ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Claiming
              </span>
            ) : (
              "Claim Reward"
            )}
          </button>
        </div>

        {/* Error Message */}
        {adError && (
          <div className="mt-3 text-xs text-red-700 bg-red-100 p-2 rounded border border-red-200 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {adError}
          </div>
        )}

        {/* Premium Upgrade Suggestion */}
        {remainingAds <= 0 && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-sm flex items-center">
            <FaCrown className="text-yellow-500 mr-2 text-lg" />
            <div>
              <p className="font-medium">Want to watch more ads?</p>
              <p>Upgrade to premium for unlimited ad watching!</p>
            </div>
          </div>
        )}

        {/* Ad Rotation Info */}
        {adsConfig?.ads?.length > 1 && (
          <div className="mt-3 text-xs text-gray-500 text-center">
            Ads rotate automatically • Current ad {currentAdIndex + 1} of {adsConfig.ads.length}
          </div>
        )}
      </div>

      {/* Success Notification */}
      {congrats && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <IoCheckmarkCircleSharp className="text-green-500 text-xl" />
            <span className="font-medium">+{task.bonus} NEWCATS earned!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdTask;