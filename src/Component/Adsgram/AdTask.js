import React, { useState, useEffect, useCallback, useMemo } from "react";
import { IoCheckmarkCircleSharp, IoTimeOutline, IoSparkles } from "react-icons/io5";
import { FaCoins, FaGem, FaCrown } from "react-icons/fa";
import { useUser } from "../../context/userContext";
import { motion, AnimatePresence } from "framer-motion";
import { berryTheme } from '../../Theme';
import styled, { keyframes } from 'styled-components';

// Styled Components
const TaskContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(227, 11, 92, 0.5); }
  50% { box-shadow: 0 0 20px rgba(227, 11, 92, 0.8); }
  100% { box-shadow: 0 0 5px rgba(227, 11, 92, 0.5); }
`;

const TaskCard = styled(motion.div)`
  background: ${berryTheme.colors.backgroundLight};
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  border: 1px solid ${berryTheme.colors.border};
`;

const GlowEffect = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #E30B5C, #FF8A00);
  animation: ${glow} 2s infinite;
`;

const PremiumTag = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #000;
  font-size: 10px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 1;
`;

const TaskHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
`;

const SparkleIcon = styled(IoSparkles)`
  color: ${berryTheme.colors.primary};
`;

const TaskTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${berryTheme.colors.text};
`;

const TaskDescription = styled.p`
  margin: 0 0 20px 0;
  font-size: 14px;
  color: ${berryTheme.colors.textSecondary};
  line-height: 1.5;
`;

const RewardBadges = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const RewardBadge = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${props => props.$bgColor};
  color: ${props => props.$textColor};
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px ${props => props.$shadowColor};
`;

const ProgressContainer = styled.div`
  width: 100%;
  height: 8px;
  background: ${berryTheme.colors.grey100};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
`;

const ProgressBar = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #E30B5C, #FF8A00);
  border-radius: 4px;
  width: ${props => props.$progress}%;
`;

const TaskStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: ${berryTheme.colors.textSecondary};
  margin-bottom: 20px;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled(motion.button)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  background: ${props => props.$bgColor};
  color: ${props => props.$textColor || 'white'};
  box-shadow: 0 2px 10px ${props => props.$shadowColor};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => !props.disabled && props.$hoverColor};
    transform: ${props => !props.disabled && 'translateY(-2px)'};
  }
  
  &:active {
    transform: ${props => !props.disabled && 'translateY(0)'};
  }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: ${spin} 1s ease-in-out infinite;
`;

const ErrorText = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${berryTheme.colors.error};
  font-size: 12px;
  margin-bottom: 15px;
`;

const Notification = styled.div`
  position: fixed;
  top: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 1000;
`;

const NotificationContent = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${props => props.$bgColor};
  color: ${props => props.$textColor};
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  font-weight: 500;
`;

const AdTask = () => {
  const {
    isPremium,
    adsConfig = {
      pointsBonus: 1000,
      dollarBonus: 10.001,
      dailyLimit: 50,
      premiumDailyLimit: 100,
      cooldown: 20 * 60 * 1000, // 20 minutes
      ads: [{
        id: "default_ad",
        scriptSrc: "//whephiwums.com/sdk.js",
        zoneId: "8693006",
        sdkVar: "show_8693006",
        active: true
      }]
    },
    recordAdWatch,
    getAdStats,
    setBalance,
    setTaskPoints,
    setAdsBalance
  } = useUser();

  const [adWatched, setAdWatched] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [congrats, setCongrats] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [adError, setAdError] = useState(null);
  const [showCooldownPopup, setShowCooldownPopup] = useState(false);
  const [cooldownMessage, setCooldownMessage] = useState("");
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [adReady, setAdReady] = useState(false);

  // Active ad configuration
  const activeAd = useMemo(() => 
    adsConfig.ads.find(ad => ad.active) || adsConfig.ads[0],
    [adsConfig]
  );

  // Get current ad stats
  const adStats = useMemo(() => getAdStats(), [getAdStats]);

  // Update cooldown timer
  useEffect(() => {
    const updateCooldown = () => {
      if (!adStats.lastAdTime) {
        setCooldownRemaining(0);
        return;
      }
      
      const now = Date.now();
      const timePassed = now - adStats.lastAdTime.getTime();
      const remaining = Math.max(0, Math.ceil((adsConfig.cooldown - timePassed) / 1000));
      setCooldownRemaining(remaining);
    };

    const timer = setInterval(updateCooldown, 1000);
    updateCooldown(); // Initial update

    return () => clearInterval(timer);
  }, [adStats.lastAdTime, adsConfig.cooldown]);

  // Load ad script and check when ready
  useEffect(() => {
    if (!activeAd) return;

    const existingScript = document.querySelector(`script[data-zone="${activeAd.zoneId}"]`);
    if (existingScript) {
      setAdReady(true);
      return;
    }

    const tag = document.createElement("script");
    tag.src = activeAd.scriptSrc;
    tag.dataset.zone = activeAd.zoneId;
    tag.dataset.sdk = activeAd.sdkVar;
    tag.async = true;
    
    tag.onload = () => {
      setAdReady(true);
      setIsAdLoading(false);
    };
    
    tag.onerror = () => {
      setAdError("Failed to load ad provider. Please refresh the page.");
      setIsAdLoading(false);
      setAdReady(false);
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

  const showAd = useCallback(async () => {
    if (isAdLoading || !adReady) return;
    
    setIsAdLoading(true);
    setAdError(null);
    
    try {
      // Check if user can watch ad
      if (adStats.dailyAdsWatched >= adStats.dailyLimit) {
        showCooldownNotification(`Daily limit reached (${adStats.dailyLimit} ads). Try again tomorrow.`);
        return;
      }

      if (adStats.lastAdTime && (Date.now() - adStats.lastAdTime.getTime()) < adsConfig.cooldown) {
        const waitMinutes = Math.ceil((adsConfig.cooldown - (Date.now() - adStats.lastAdTime.getTime())) / 60000);
        showCooldownNotification(`Please wait ${waitMinutes} minute${waitMinutes > 1 ? 's' : ''} before watching another ad.`);
        return;
      }
      
      // In development, simulate ad watching
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await recordAdWatch({
          adId: activeAd.id,
          pointsEarned: adsConfig.pointsBonus,
          dollarsEarned: adsConfig.dollarBonus
        });
        setAdWatched(true);
        return;
      }
      
      // In production, show actual ad
      if (!window[activeAd.sdkVar]) {
        throw new Error("Ad provider not loaded yet");
      }
      
      await window[activeAd.sdkVar]();
      await recordAdWatch({
        adId: activeAd.id,
        pointsEarned: adsConfig.pointsBonus,
        dollarsEarned: adsConfig.dollarBonus
      });
      setAdWatched(true);
      
    } catch (error) {
      console.error("Error showing ad:", error);
      setAdError(error.message || "Failed to load ad. Please try again.");
    } finally {
      setIsAdLoading(false);
    }
  }, [isAdLoading, adReady, adStats, showCooldownNotification, recordAdWatch, activeAd, adsConfig]);

  const claimReward = useCallback(async () => {
    if (!adWatched || claiming) return;
    
    setClaiming(true);
    
    try {
      // Update balances in local state for immediate feedback
      setBalance(prev => prev + adsConfig.pointsBonus);
      setTaskPoints(prev => prev + adsConfig.pointsBonus);
      setAdsBalance(prev => +(prev + adsConfig.dollarBonus).toFixed(6));
      
      // Show success message
      setAdWatched(false);
      setCongrats(true);
      setTimeout(() => setCongrats(false), 4000);
      
    } catch (error) {
      console.error("Error claiming reward:", error);
      showCooldownNotification(error.message || "Error claiming reward. Please try again.");
    } finally {
      setClaiming(false);
    }
  }, [
    adWatched, 
    claiming, 
    showCooldownNotification, 
    adsConfig,
    setBalance,
    setTaskPoints,
    setAdsBalance
  ]);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    return Math.min(100, (adStats.dailyAdsWatched / adStats.dailyLimit) * 100);
  }, [adStats]);

  // Determine if watch button should be disabled
  const isWatchButtonDisabled = useMemo(() => {
    return isAdLoading || !adReady || 
           adStats.dailyAdsWatched >= adStats.dailyLimit || 
           (adStats.lastAdTime && (Date.now() - adStats.lastAdTime.getTime()) < adsConfig.cooldown);
  }, [isAdLoading, adReady, adStats, adsConfig.cooldown]);

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
            <FaCoins size={16} /> +{adsConfig.pointsBonus} NEWCATS
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
            <IoTimeOutline /> {adStats.dailyAdsWatched}/{adStats.dailyLimit} ads today
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
            disabled={isWatchButtonDisabled}
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
            ) : !adReady ? (
              "Preparing Ads..."
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
