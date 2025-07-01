import React, { useState, useEffect, useCallback, useMemo } from "react";
import { IoCheckmarkCircleSharp, IoTimeOutline, IoSparkles } from "react-icons/io5";
import { FaCoins, FaGem, FaCrown } from "react-icons/fa";
import { doc, updateDoc, increment, getDoc, runTransaction } from "firebase/firestore";
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

const AdTask = () => {
  const {
    id,
    isPremium,
    adsConfig = {
      pointsBonus: 1,
      dollarBonus: 1,
      dailyLimit: 50,
      premiumDailyLimit: 100,
      cooldown: 20 * 60 * 1000 // 20 minutes in milliseconds
    },
    recordAdWatch,
    addRewards
  } = useUser();

  const [adWatched, setAdWatched] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [congrats, setCongrats] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [adError, setAdError] = useState(null);
  const [showCooldownPopup, setShowCooldownPopup] = useState(false);
  const [cooldownMessage, setCooldownMessage] = useState("");
  const [userAdData, setUserAdData] = useState({
    adsWatchedToday: 0,
    lastAdTimestamp: null,
    dailyResetDate: null
  });
  const [cooldownRemaining, setCooldownRemaining] = useState({
    minutes: 0,
    seconds: 0
  });

  // Format cooldown time as MM:SS
  const formatCooldown = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Load user ad data from Firestore and check daily reset
  useEffect(() => {
    const loadUserAdDataAndCheckReset = async () => {
      if (!id) return;
      
      try {
        const userDoc = await getDoc(doc(db, "telegramUsers", id));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const now = new Date();
          
          let resetDate = data.dailyResetDate?.toDate() || new Date();
          resetDate.setUTCHours(0, 0, 0, 0);
          
          let adsWatchedToday = data.adsWatchedToday || 0;
          
          if (now > resetDate) {
            const newResetDate = new Date(resetDate);
            newResetDate.setUTCDate(newResetDate.getUTCDate() + 1);
            
            await updateDoc(doc(db, "telegramUsers", id), {
              adsWatchedToday: 0,
              dailyResetDate: newResetDate
            });
            
            resetDate = newResetDate;
            adsWatchedToday = 0;
          }
          
          setUserAdData({
            adsWatchedToday,
            lastAdTimestamp: data.lastAdTimestamp?.toDate() || null,
            dailyResetDate: resetDate
          });
        }
      } catch (error) {
        console.error("Error loading user ad data:", error);
      }
    };

    loadUserAdDataAndCheckReset();
    
    const resetCheckInterval = setInterval(loadUserAdDataAndCheckReset, 60000);
    return () => clearInterval(resetCheckInterval);
  }, [id]);

  // Update cooldown timer
  useEffect(() => {
    const updateCooldown = () => {
      if (!userAdData.lastAdTimestamp) {
        setCooldownRemaining({ minutes: 0, seconds: 0 });
        return;
      }
      
      const now = new Date();
      const timePassed = now - userAdData.lastAdTimestamp;
      const remainingSeconds = Math.max(0, Math.ceil((adsConfig.cooldown - timePassed) / 1000));
      
      setCooldownRemaining({
        minutes: Math.floor(remainingSeconds / 60),
        seconds: remainingSeconds % 60
      });
    };

    updateCooldown();
    
    const timer = setInterval(updateCooldown, 1000);
    return () => clearInterval(timer);
  }, [userAdData.lastAdTimestamp, adsConfig.cooldown]);

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
        const dailyLimit = isPremium ? adsConfig.premiumDailyLimit : adsConfig.dailyLimit;
        
        if (currentAdsWatched >= dailyLimit) {
          throw new Error(`Daily limit reached (${dailyLimit} ads)`);
        }
        
        transaction.update(userRef, {
          adsWatchedToday: increment(1),
          lastAdTimestamp: now // Using client timestamp instead of serverTimestamp()
        });
      });
      
      setUserAdData(prev => ({
        ...prev,
        adsWatchedToday: prev.adsWatchedToday + 1,
        lastAdTimestamp: now
      }));
      setAdWatched(true);
      setAdError(null);
      
    } catch (error) {
      console.error("Error recording ad completion:", error);
      setAdError(error.message);
      setAdWatched(false);
    }
  }, [id, isPremium, adsConfig]);

  const claimReward = useCallback(async () => {
    if (!adWatched || claiming) return;
    
    setClaiming(true);
    setAdError(null);
    
    try {
      const result = await addRewards(adsConfig.dollarBonus, 'ads', {
        preventDuplicate: true
      });
      
      if (result?.success) {
        setAdWatched(false);
        setCongrats(true);
        setTimeout(() => setCongrats(false), 4000);
      } else {
        throw new Error(result?.error || "Failed to claim reward");
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
      setAdError(error.message);
      setTimeout(() => setAdError(null), 5000);
    } finally {
      setClaiming(false);
    }
  }, [adWatched, claiming, adsConfig, addRewards]);

  const showAd = useCallback(async () => {
    if (isAdLoading) return;
    
    setIsAdLoading(true);
    setAdError(null);
    
    try {
      const now = new Date();
      const dailyLimit = isPremium ? adsConfig.premiumDailyLimit : adsConfig.dailyLimit;
      
      // Check daily limit
      if (userAdData.adsWatchedToday >= dailyLimit) {
        showCooldownNotification(`Daily limit reached (${dailyLimit} ads). Try again tomorrow.`);
        return;
      }
      
      // Check cooldown
      if (userAdData.lastAdTimestamp) {
        const timeSinceLastAd = now - userAdData.lastAdTimestamp;
        if (timeSinceLastAd < adsConfig.cooldown) {
          const remainingSeconds = Math.ceil((adsConfig.cooldown - timeSinceLastAd) / 1000);
          const minutes = Math.floor(remainingSeconds / 60);
          const seconds = remainingSeconds % 60;
          showCooldownNotification(`Please wait ${minutes}m ${seconds}s before watching another ad.`);
          return;
        }
      }
      
      // In development, simulate ad watching
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await handleAdCompletion();
        return;
      }
      
      // In production, use the actual ad watching logic from UserContext
      await recordAdWatch({ adId: "default_ad" });
      await handleAdCompletion();
      
    } catch (error) {
      console.error("Error showing ad:", error);
      setAdError(error.message || "Failed to load ad. Please try again.");
    } finally {
      setIsAdLoading(false);
    }
  }, [isAdLoading, isPremium, adsConfig, userAdData, handleAdCompletion, showCooldownNotification, recordAdWatch]);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    const dailyLimit = isPremium ? adsConfig.premiumDailyLimit : adsConfig.dailyLimit;
    return Math.min(100, (userAdData.adsWatchedToday / dailyLimit) * 100);
  }, [userAdData.adsWatchedToday, adsConfig, isPremium]);

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
          Watch short video ads and earn rewards. 
          {isPremium ? " Enjoy unlimited ads with your Premium status!" : " Complete your daily limit for maximum earnings."}
        </TaskDescription>
        
        <RewardBadges>
          <RewardBadge
            $bgColor={berryTheme.colors.primaryLight}
            $textColor={berryTheme.colors.primaryDark}
            $shadowColor="rgba(227, 11, 92, 0.1)"
            whileHover={{ scale: 1.05 }}
          >
            <FaCoins size={16} /> +{adsConfig.pointsBonus} Points
          </RewardBadge>
          <RewardBadge
            $bgColor={berryTheme.colors.successLight}
            $textColor={berryTheme.colors.successDark}
            $shadowColor="rgba(46, 204, 113, 0.1)"
            whileHover={{ scale: 1.05 }}
          >
            <FaGem size={16} /> ${adsConfig.dollarBonus.toFixed(3)} USD
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
            <IoTimeOutline /> {userAdData.adsWatchedToday}/{isPremium ? adsConfig.premiumDailyLimit : adsConfig.dailyLimit} ads today
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
            disabled={cooldownRemaining.minutes > 0 || cooldownRemaining.seconds > 0 || isAdLoading || userAdData.adsWatchedToday >= (isPremium ? adsConfig.premiumDailyLimit : adsConfig.dailyLimit)}
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
            ) : cooldownRemaining.minutes > 0 || cooldownRemaining.seconds > 0 ? (
              formatCooldown(cooldownRemaining.minutes * 60 + cooldownRemaining.seconds)
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
