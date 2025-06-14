import React, { useState, useEffect, useCallback, useMemo } from "react";
import { IoCheckmarkCircleSharp, IoTimeOutline, IoSparkles } from "react-icons/io5";
import { FaCoins, FaGem, FaCrown } from "react-icons/fa";
import { doc, updateDoc, increment, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useUser } from "../../context/userContext";
import { motion, AnimatePresence } from "framer-motion";
import { berryTheme } from '../../Theme';
import styled, { keyframes } from 'styled-components';

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Styled components
const TaskContainer = styled.div`
  margin-bottom: ${berryTheme.spacing.large};
  width: 100%;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  perspective: 1000px;
`;

const TaskCard = styled(motion.div)`
  background: linear-gradient(135deg, #ffffff 0%, #f9f9ff 100%);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(5px);
  transform-style: preserve-3d;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      to bottom right,
      rgba(227, 11, 92, 0.05) 0%,
      rgba(255, 255, 255, 0) 60%
    );
    z-index: 0;
  }
`;

const GlowEffect = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, 
    ${berryTheme.colors.primary} 0%, 
    ${berryTheme.colors.secondary} 50%, 
    ${berryTheme.colors.primary} 100%);
  background-size: 200% 100%;
  animation: ${shimmer} 3s linear infinite;
`;

const TaskHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
`;

const TaskTitle = styled.h3`
  margin: 0;
  font-size: 1.4rem;
  color: ${berryTheme.colors.primaryDark};
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0,0,0,0.05);
`;

const TaskDescription = styled.p`
  color: ${berryTheme.colors.textSecondary};
  margin-bottom: 24px;
  line-height: 1.6;
  font-size: 0.95rem;
  position: relative;
  z-index: 1;
`;

const RewardBadges = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
`;

const RewardBadge = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.$textColor || berryTheme.colors.textDark};
  padding: 10px 16px;
  border-radius: 12px;
  background: ${props => props.$bgColor || berryTheme.colors.grey100};
  box-shadow: 0 4px 12px ${props => props.$shadowColor || 'rgba(0,0,0,0.05)'};
  transition: all 0.3s ease;
  cursor: default;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px ${props => props.$shadowColor || 'rgba(0,0,0,0.1)'};
  }
`;

const ProgressContainer = styled.div`
  width: 100%;
  height: 8px;
  background: ${berryTheme.colors.grey100};
  border-radius: 4px;
  margin-bottom: 24px;
  overflow: hidden;
  position: relative;
  z-index: 1;
`;

const ProgressBar = styled(motion.div)`
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, 
    ${berryTheme.colors.primary} 0%, 
    ${berryTheme.colors.secondary} 100%);
  width: ${props => props.$progress}%;
`;

const TaskStats = styled.div`
  font-size: 0.9rem;
  color: ${berryTheme.colors.textMuted};
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
`;

const ErrorText = styled(motion.div)`
  font-size: 0.9rem;
  color: ${berryTheme.colors.error};
  margin-bottom: 20px;
  padding: 12px;
  background: rgba(255, 0, 0, 0.05);
  border-radius: 8px;
  border-left: 3px solid ${berryTheme.colors.error};
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  position: relative;
  z-index: 1;
`;

const ActionButton = styled(motion.button)`
  background: ${props => props.$bgColor || berryTheme.colors.primary};
  color: ${props => props.$textColor || 'white'};
  border: none;
  border-radius: 14px;
  padding: 16px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px ${props => props.$shadowColor || 'rgba(227, 11, 92, 0.2)'};
  
  &:hover:not(:disabled) {
    background: ${props => props.$hoverColor || berryTheme.colors.primaryDark};
    transform: translateY(-3px);
    box-shadow: 0 6px 20px ${props => props.$shadowColor || 'rgba(227, 11, 92, 0.3)'};
  }

  &:disabled {
    background: ${berryTheme.colors.grey200};
    color: ${berryTheme.colors.textMuted};
    cursor: not-allowed;
    box-shadow: none;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: all 0.5s ease;
  }

  &:hover:not(:disabled)::before {
    left: 100%;
  }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 3px solid currentColor;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const SparkleIcon = styled(IoSparkles)`
  color: gold;
  filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6));
  animation: ${float} 3s ease-in-out infinite;
`;

const Notification = styled(motion.div)`
  position: fixed;
  top: 1.5rem;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  z-index: 1000;
  pointer-events: none;
`;

const NotificationContent = styled(motion.div)`
  background: ${props => props.$bgColor};
  color: ${props => props.$textColor};
  border-radius: 14px;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  font-weight: 600;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const PremiumTag = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #ffd700 0%, #ffcc00 100%);
  color: #8a6d00;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  z-index: 2;
`;

// Default configuration
const defaultConfig = {
  pointsBonus: 0,
  dollarBonus: 10.001,
  dailyLimit: 50,
  premiumDailyLimit: 100,
  cooldown: 20 * 60 * 1000, // 20 minutes in milliseconds
  ads: [{
    id: "default_ad",
    scriptSrc: "//whephiwums.com/sdk.js",
    zoneId: "8693006",
    sdkVar: "show_8693006",
    active: true
  }]
};

const AdTask = () => {
  const {
    id,
    isPremium,
    adsConfig = defaultConfig,
    setBalance,
    setTaskPoints,
    setAdsBalance,
  } = useUser();

  const [adWatched, setAdWatched] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [congrats, setCongrats] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [adError, setAdError] = useState(null);
  const [showCooldownPopup, setShowCooldownPopup] = useState(false);
  const [cooldownMessage, setCooldownMessage] = useState("");
  const [localAdsConfig, setLocalAdsConfig] = useState(adsConfig);
  const [userAdData, setUserAdData] = useState({
    adsWatchedToday: 0,
    lastAdTimestamp: null,
    dailyResetDate: null,
    lastClaimDate: null
  });
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Active ad configuration
  const activeAd = useMemo(() => 
    localAdsConfig.ads.find(ad => ad.active) || localAdsConfig.ads[0],
    [localAdsConfig]
  );

  // Load user ad data from Firestore and check daily reset
  useEffect(() => {
    const loadUserAdDataAndCheckReset = async () => {
      if (!id) return;
      
      try {
        const userDoc = await getDoc(doc(db, "telegramUsers", id));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const now = new Date();
          
          // Get or initialize daily reset date (start of current day in UTC)
          let resetDate = data.dailyResetDate?.toDate() || new Date();
          resetDate.setUTCHours(0, 0, 0, 0);
          
          // Check if we need to reset the counter (if current time is after reset date)
          let adsWatchedToday = data.adsWatchedToday || 0;
          let needsReset = false;
          
          if (now > resetDate) {
            // Calculate new reset date (start of next day in UTC)
            const newResetDate = new Date(resetDate);
            newResetDate.setUTCDate(newResetDate.getUTCDate() + 1);
            
            // Update Firestore if we're resetting
            await updateDoc(doc(db, "telegramUsers", id), {
              adsWatchedToday: 0,
              dailyResetDate: newResetDate
            });
            
            resetDate = newResetDate;
            adsWatchedToday = 0;
            needsReset = true;
          }
          
          // Update local state
          setUserAdData({
            adsWatchedToday,
            lastAdTimestamp: data.lastAdTimestamp?.toDate() || null,
            dailyResetDate: resetDate,
            lastClaimDate: data.lastClaimDate?.toDate() || null
          });
          
          if (needsReset) {
            console.log("Daily ads counter reset");
          }
        }
      } catch (error) {
        console.error("Error loading user ad data:", error);
      }
    };

    loadUserAdDataAndCheckReset();
    
    // Set up interval to check for daily reset every minute
    const resetCheckInterval = setInterval(loadUserAdDataAndCheckReset, 60000);
    return () => clearInterval(resetCheckInterval);
  }, [id]);

  // Update cooldown timer
  useEffect(() => {
    const updateCooldown = () => {
      if (!userAdData.lastAdTimestamp) {
        setCooldownRemaining(0);
        return;
      }
      
      const now = new Date();
      const timePassed = now - userAdData.lastAdTimestamp;
      const remaining = Math.max(0, Math.ceil((localAdsConfig.cooldown - timePassed) / 1000));
      setCooldownRemaining(remaining);
    };

    updateCooldown();
    
    const timer = setInterval(updateCooldown, 1000);
    return () => clearInterval(timer);
  }, [userAdData.lastAdTimestamp, localAdsConfig.cooldown]);

  // Load ads configuration from Firestore if not provided by context
  useEffect(() => {
    const loadAdsConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, "adminConfig", "adsSettings"));
        setLocalAdsConfig(configDoc.exists() ? { ...defaultConfig, ...configDoc.data() } : defaultConfig);
      } catch (error) {
        console.error("Error loading ads config:", error);
        setLocalAdsConfig(defaultConfig);
      }
    };

    if (adsConfig === defaultConfig) {
      loadAdsConfig();
    } else {
      setLocalAdsConfig(adsConfig);
    }
  }, [adsConfig]);

  // Load ad script based on config
  useEffect(() => {
    if (!activeAd) return;

    const existingScript = document.querySelector(`script[data-zone="${activeAd.zoneId}"]`);
    if (existingScript) return;

    const tag = document.createElement("script");
    tag.src = activeAd.scriptSrc;
    tag.dataset.zone = activeAd.zoneId;
    tag.dataset.sdk = activeAd.sdkVar;
    tag.async = true;
    
    tag.onerror = () => {
      setAdError("Failed to load ad provider. Please refresh the page.");
      setIsAdLoading(false);
    };
    
    document.body.appendChild(tag);

    return () => {
      if (tag.parentNode) {
        document.body.removeChild(tag);
      }
    };
  }, [activeAd]);

  const showCooldownNotification = useCallback((message) => {
    setCooldownMessage(message);
    setShowCooldownPopup(true);
    setTimeout(() => setShowCooldownPopup(false), 3000);
  }, []);

  const handleAdCompletion = useCallback(async () => {
    const now = new Date();
    
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "telegramUsers", id);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error("User document doesn't exist");
        }
        
        const userData = userDoc.data();
        const currentAdsWatched = userData.adsWatchedToday || 0;
        const dailyLimit = isPremium ? localAdsConfig.premiumDailyLimit : localAdsConfig.dailyLimit;
        
        // Verify daily limit
        if (currentAdsWatched >= dailyLimit) {
          throw new Error(`Daily limit reached (${dailyLimit} ads)`);
        }
        
        // Update ad watch count and timestamp atomically
        transaction.update(userRef, {
          adsWatchedToday: increment(1),
          lastAdTimestamp: serverTimestamp(),
          lastClaimDate: serverTimestamp() // Track when reward was last claimed
        });
        
        return { success: true };
      });
      
      // Update local state optimistically
      setUserAdData(prev => ({
        ...prev,
        adsWatchedToday: prev.adsWatchedToday + 1,
        lastAdTimestamp: now,
        lastClaimDate: now
      }));
      setAdWatched(true);
      
    } catch (error) {
      console.error("Error recording ad completion:", error);
      setAdError(error.message);
    }
  }, [id, isPremium, localAdsConfig]);

  const showAd = useCallback(async () => {
    if (isAdLoading) return;
    
    setIsAdLoading(true);
    setAdError(null);
    
    try {
      const now = new Date();
      const dailyLimit = isPremium ? localAdsConfig.premiumDailyLimit : localAdsConfig.dailyLimit;
      
      // Check daily limit
      if (userAdData.adsWatchedToday >= dailyLimit) {
        showCooldownNotification(`Daily limit reached (${dailyLimit} ads). Try again tomorrow.`);
        return;
      }
      
      // Check cooldown
      if (userAdData.lastAdTimestamp) {
        const timeSinceLastAd = now - userAdData.lastAdTimestamp;
        if (timeSinceLastAd < localAdsConfig.cooldown) {
          const remainingTime = localAdsConfig.cooldown - timeSinceLastAd;
          const waitMinutes = Math.ceil(remainingTime / 60000);
          showCooldownNotification(`Please wait ${waitMinutes} minute${waitMinutes > 1 ? 's' : ''} before watching another ad.`);
          return;
        }
      }
      
      // In development, simulate ad watching
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await handleAdCompletion();
        return;
      }
      
      // In production, show actual ad
      if (!window[activeAd.sdkVar]) {
        throw new Error("Ad provider not loaded yet");
      }
      
      await window[activeAd.sdkVar]();
      await handleAdCompletion();
      
    } catch (error) {
      console.error("Error showing ad:", error);
      setAdError(error.message || "Failed to load ad. Please try again.");
    } finally {
      setIsAdLoading(false);
    }
  }, [isAdLoading, isPremium, localAdsConfig, userAdData, handleAdCompletion, showCooldownNotification, activeAd]);

  const claimReward = useCallback(async () => {
    if (!adWatched || claiming) return;
    
    setClaiming(true);
    
    try {
      const rewardData = await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "telegramUsers", id);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error("User document doesn't exist");
        }
        
        const userData = userDoc.data();
        const lastAdTime = userData.lastAdTimestamp?.toDate();
        
        // Verify the ad was actually watched recently
        if (!lastAdTime || (new Date() - lastAdTime) > localAdsConfig.cooldown * 2) {
          throw new Error("No recent ad watch recorded");
        }
        
        // Verify reward hasn't been claimed yet for this ad
        if (userData.lastClaimDate && 
            Math.abs(userData.lastClaimDate.toDate() - lastAdTime) < 1000) {
          throw new Error("Reward already claimed for this ad");
        }
        
        // Update balances and mark as claimed
        transaction.update(userRef, {
          balance: increment(localAdsConfig.pointsBonus),
          taskPoints: increment(localAdsConfig.pointsBonus),
          adsBalance: increment(localAdsConfig.dollarBonus),
          lastClaimDate: serverTimestamp()
        });
        
        return {
          points: localAdsConfig.pointsBonus,
          dollars: localAdsConfig.dollarBonus
        };
      });

      // Update local state
      setBalance(prev => prev + rewardData.points);
      setTaskPoints(prev => prev + rewardData.points);
      setAdsBalance(prev => +(prev + rewardData.dollars).toFixed(6));
      
      setAdWatched(false);
      setCongrats(true);
      setTimeout(() => setCongrats(false), 4000);
      
    } catch (error) {
      console.error("Error claiming reward:", error);
      showCooldownNotification(error.message || "Error claiming reward. Please try again.");
    } finally {
      setClaiming(false);
    }
  }, [adWatched, claiming, id, localAdsConfig, setBalance, setTaskPoints, setAdsBalance, showCooldownNotification]);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    const dailyLimit = isPremium ? localAdsConfig.premiumDailyLimit : localAdsConfig.dailyLimit;
    return Math.min(100, (userAdData.adsWatchedToday / dailyLimit) * 100);
  }, [userAdData.adsWatchedToday, localAdsConfig, isPremium]);

  return (
    <TaskContainer>
      <TaskCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlowEffect />
        
        {isPremium && (
          <PremiumTag>
            <FaCrown size={12} /> PREMIUM
          </PremiumTag>
        )}

        <TaskHeader>
          <SparkleIcon size={24} />
          <TaskTitle>Watch Ads & Earn Rewards</TaskTitle>
        </TaskHeader>
        
        <TaskDescription>
          Watch short video ads and earn NEWCATS tokens and USD rewards. 
          {isPremium ? " Enjoy unlimited ads with your Premium status!" : " Complete your daily limit for maximum earnings."}
        </TaskDescription>
        
        <RewardBadges>
          <RewardBadge
            $bgColor={berryTheme.colors.primaryLight}
            $textColor={berryTheme.colors.primaryDark}
            $shadowColor="rgba(227, 11, 92, 0.1)"
            whileHover={{ scale: 1.05 }}
          >
            <FaCoins size={16} /> +{localAdsConfig.pointsBonus} NEWCATS
          </RewardBadge>
          <RewardBadge
            $bgColor={berryTheme.colors.successLight}
            $textColor={berryTheme.colors.successDark}
            $shadowColor="rgba(46, 204, 113, 0.1)"
            whileHover={{ scale: 1.05 }}
          >
            <FaGem size={16} /> ${localAdsConfig.dollarBonus.toFixed(3)} USD
          </RewardBadge>
        </RewardBadges>
        
        <ProgressContainer>
          <ProgressBar 
            $progress={progressPercentage}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </ProgressContainer>
        
        <TaskStats>
          <span>
            <IoTimeOutline /> {userAdData.adsWatchedToday}/{isPremium ? localAdsConfig.premiumDailyLimit : localAdsConfig.dailyLimit} ads today
          </span>
          <span>
            {Math.round(progressPercentage)}% completed
          </span>
        </TaskStats>
        
        {adError && (
          <ErrorText
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <IoTimeOutline /> {adError}
          </ErrorText>
        )}

        <ActionButtons>
          <ActionButton
            onClick={showAd}
            disabled={cooldownRemaining > 0 || isAdLoading || userAdData.adsWatchedToday >= (isPremium ? localAdsConfig.premiumDailyLimit : localAdsConfig.dailyLimit)}
            $bgColor={berryTheme.colors.primary}
            $hoverColor={berryTheme.colors.primaryDark}
            $shadowColor="rgba(227, 11, 92, 0.3)"
            whileTap={{ scale: 0.95 }}
          >
            {isAdLoading ? (
              <>
                <Spinner />
                Loading
              </>
            ) : cooldownRemaining > 0 ? (
              `${cooldownRemaining}s`
            ) : (
              <>
                <IoSparkles /> Show Ad
              </>
            )}
          </ActionButton>
          
          <ActionButton
            onClick={claimReward}
            disabled={!adWatched || claiming}
            $bgColor={adWatched ? berryTheme.colors.success : berryTheme.colors.grey200}
            $textColor={adWatched ? 'white' : berryTheme.colors.textMuted}
            $hoverColor={adWatched ? berryTheme.colors.successDark : berryTheme.colors.grey200}
            $shadowColor={adWatched ? "rgba(46, 204, 113, 0.3)" : "rgba(0,0,0,0.1)"}
            whileTap={{ scale: 0.95 }}
          >
            {claiming ? (
              <>
                <Spinner />
                Claiming
              </>
            ) : (
              <>
                <FaCoins /> Claim Reward
              </>
            )}
          </ActionButton>
        </ActionButtons>
      </TaskCard>

      {/* Success Notification */}
      <AnimatePresence>
        {congrats && (
          <Notification>
            <NotificationContent
              $bgColor={berryTheme.colors.successLight}
              $textColor={berryTheme.colors.successDark}
              initial={{ opacity: 0, y: -50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <IoCheckmarkCircleSharp size={20} />
              <span>Reward claimed successfully! 🎉</span>
            </NotificationContent>
          </Notification>
        )}
      </AnimatePresence>

      {/* Cooldown Popup */}
      <AnimatePresence>
        {showCooldownPopup && (
          <Notification>
            <NotificationContent
              $bgColor={berryTheme.colors.primaryLight}
              $textColor={berryTheme.colors.primaryDark}
              initial={{ opacity: 0, y: -50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <IoTimeOutline size={20} />
              <span>{cooldownMessage}</span>
            </NotificationContent>
          </Notification>
        )}
      </AnimatePresence>
    </TaskContainer>
  );
};

export default AdTask;
