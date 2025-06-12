import React, { useState, useEffect, useCallback, useMemo } from "react";
import { IoCheckmarkCircleSharp, IoTimeOutline, IoSparkles } from "react-icons/io5";
import { FaCoins, FaGem, FaCrown } from "react-icons/fa";
import { doc, updateDoc, increment, arrayUnion, getDoc } from "firebase/firestore";
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
  pointsBonus: 1000,
  dollarBonus: 10.001,
  dailyLimit: 50,
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
    setBalance,
    setTaskPoints,
    completedDailyTasks,
    setCompletedDailyTasks,
    adsWatched,
    setAdsWatched,
    lastAdTime,
    setLastAdTime,
    setAdsBalance,
    isPremium
  } = useUser();

  const [adWatched, setAdWatched] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [congrats, setCongrats] = useState(false);
  const [showAdCooldown, setShowAdCooldown] = useState(0);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [adError, setAdError] = useState(null);
  const [showCooldownPopup, setShowCooldownPopup] = useState(false);
  const [cooldownMessage, setCooldownMessage] = useState("");
  const [adsConfig, setAdsConfig] = useState(null);

  // Memoized functions and values
  const generateTaskId = useCallback(() => `adTask_${new Date().getTime()}`, []);
  const [taskId, setTaskId] = useState(generateTaskId());

  // Combined config from admin settings and defaults
  const task = useMemo(() => ({
    pointsBonus: adsConfig?.pointsBonus ?? defaultConfig.pointsBonus,
    dollarBonus: adsConfig?.dollarBonus ?? defaultConfig.dollarBonus,
    dailyLimit: adsConfig?.dailyLimit ?? defaultConfig.dailyLimit,
    cooldown: adsConfig?.cooldown ?? defaultConfig.cooldown
  }), [adsConfig]);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    return Math.min(100, (adsWatched / (task.dailyLimit || 1)) * 100);
  }, [adsWatched, task.dailyLimit]);

  // Load ads configuration from Firestore
  useEffect(() => {
    const loadAdsConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, "adminConfig", "adsSettings"));
        setAdsConfig(configDoc.exists() ? configDoc.data() : defaultConfig);
      } catch (error) {
        console.error("Error loading ads config:", error);
        setAdsConfig(defaultConfig);
      }
    };

    loadAdsConfig();
  }, []);

  // Load ad script based on config
  useEffect(() => {
    if (!adsConfig?.ads) return;

    const activeAd = adsConfig.ads.find(ad => ad.active) || defaultConfig.ads[0];
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
  }, [adsConfig?.ads]);

  const showCooldownNotification = useCallback((message) => {
    setCooldownMessage(message);
    setShowCooldownPopup(true);
    setTimeout(() => setShowCooldownPopup(false), 3000);
  }, []);

  const handleAdCompletion = useCallback(() => {
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
  }, [setLastAdTime, setAdsWatched]);

  const showAd = useCallback(async () => {
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
        await new Promise(resolve => setTimeout(resolve, 2000));
        handleAdCompletion();
        return;
      }
      
      const activeAd = adsConfig?.ads?.find(ad => ad.active) || defaultConfig.ads[0];
      if (!window[activeAd.sdkVar]) {
        throw new Error("Ad provider not loaded yet");
      }
      
      await window[activeAd.sdkVar]();
      handleAdCompletion();
    } catch (error) {
      console.error("Error showing ad:", error);
      setAdError("Failed to load ad. Please try again later.");
    } finally {
      setIsAdLoading(false);
    }
  }, [adsWatched, task, lastAdTime, showAdCooldown, adsConfig?.ads, handleAdCompletion, showCooldownNotification]);

  const claimReward = useCallback(async () => {
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
  }, [adWatched, completedDailyTasks, taskId, id, task, setBalance, setTaskPoints, setAdsBalance, setCompletedDailyTasks, showCooldownNotification, generateTaskId]);

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
            <FaCoins size={16} /> +{task.pointsBonus} NEWCATS
          </RewardBadge>
          <RewardBadge
            $bgColor={berryTheme.colors.successLight}
            $textColor={berryTheme.colors.successDark}
            $shadowColor="rgba(46, 204, 113, 0.1)"
            whileHover={{ scale: 1.05 }}
          >
            <FaGem size={16} /> ${task.dollarBonus.toFixed(3)} USD
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
            <IoTimeOutline /> {adsWatched}/{task.dailyLimit} ads today
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
            disabled={showAdCooldown > 0 || isAdLoading}
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
            ) : showAdCooldown > 0 ? (
              `${showAdCooldown}s`
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