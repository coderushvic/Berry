import React, { useState, useEffect, useMemo } from "react";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { FaAd, FaCrown, FaSyncAlt } from "react-icons/fa";
import { doc, updateDoc, increment, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useUser } from "../../context/userContext";
import "./AdTask.css";

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

  const task = useMemo(() => ({
    bonus: adsConfig?.bonus || defaultConfig.bonus,
  }), [adsConfig?.bonus]);

  const generateTaskId = useMemo(() => () => `adTask_${new Date().getTime()}`, []);
  const [taskId, setTaskId] = useState(generateTaskId());

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
  }, []);

  useEffect(() => {
    if (!userData) return;
    
    const today = new Date().toISOString().split('T')[0];
    const adsToday = userData.dailyAdsWatched?.[today] || 0;
    setAdsWatchedToday(adsToday);
  }, [userData]);

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
  }, [adsConfig, taskId]);

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
  }, [adsConfig, currentAdIndex]);

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
    <div className="ad-task-container">
      <div className="task-card">
        <div className="task-header">
          <div className="task-icon">
            <FaAd />
          </div>
          <div className="task-title">
            <h3>Watch Ads & Earn</h3>
            <p>Complete simple tasks to earn rewards</p>
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-info">
            <span>Ads watched today: {adsWatchedToday}/{dailyLimit}</span>
            <span>{remainingAds} remaining</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="ad-info">
          <div className="ad-info-header">
            <div>
              <h4>Current Ad</h4>
              <p>{adDetails.name}</p>
            </div>
            <div className="ad-time">
              {adDetails.estimatedTime}
            </div>
          </div>
          
          {adsConfig?.ads?.length > 1 && (
            <button 
              onClick={() => setTaskId(generateTaskId())}
              className="switch-ad-btn"
              disabled={isAdLoading || showAdCooldown > 0}
            >
              <FaSyncAlt /> Switch Ad
            </button>
          )}
        </div>

        <div className="reward-display">
          <div>
            <p className="reward-label">You'll earn</p>
            <p className="reward-amount">{task.bonus} NEWCATS</p>
          </div>
          <div className="reward-badge">
            +{task.bonus} Points
          </div>
        </div>

        <div className="action-buttons">
          <button
            onClick={showAd}
            disabled={showAdCooldown > 0 || isAdLoading || remainingAds <= 0}
            className={`show-ad-btn ${showAdCooldown > 0 || isAdLoading || remainingAds <= 0 ? 'disabled' : ''}`}
          >
            {isAdLoading ? (
              <span className="loading-spinner">
                <svg className="spinner" viewBox="0 0 24 24">
                  <circle className="spinner-bg" cx="12" cy="12" r="10"></circle>
                  <path className="spinner-fg" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
            className={`claim-btn ${claiming ? 'claiming' : adWatched ? 'active' : 'disabled'}`}
          >
            {claiming ? (
              <span className="loading-spinner">
                <svg className="spinner" viewBox="0 0 24 24">
                  <circle className="spinner-bg" cx="12" cy="12" r="10"></circle>
                  <path className="spinner-fg" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Claiming
              </span>
            ) : (
              "Claim Reward"
            )}
          </button>
        </div>

        {adError && (
          <div className="error-message">
            <svg className="error-icon" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {adError}
          </div>
        )}

        {remainingAds <= 0 && (
          <div className="premium-upsell">
            <FaCrown className="premium-icon" />
            <div>
              <p className="premium-title">Want to watch more ads?</p>
              <p>Upgrade to premium for unlimited ad watching!</p>
            </div>
          </div>
        )}

        {adsConfig?.ads?.length > 1 && (
          <div className="ad-rotation-info">
            Ads rotate automatically • Current ad {currentAdIndex + 1} of {adsConfig.ads.length}
          </div>
        )}
      </div>

      {congrats && (
        <div className="congrats-notification">
          <div className="congrats-content">
            <IoCheckmarkCircleSharp className="congrats-icon" />
            <span className="congrats-text">+{task.bonus} NEWCATS earned!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdTask;