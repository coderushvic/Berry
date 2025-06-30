import React, { useState, useEffect, useCallback, useMemo } from "react";
import { IoCheckmarkCircleSharp, IoTimeOutline, IoSparkles } from "react-icons/io5";
import { FaCoins, FaGem, FaCrown } from "react-icons/fa";
import { 
  doc, 
  runTransaction, 
  serverTimestamp,
  increment,
  arrayUnion
} from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useUser } from "../../context/userContext";
import { motion, AnimatePresence } from "framer-motion";
import { berryTheme } from '../../Theme';
import styled, { keyframes } from 'styled-components';

/* ========== Animations ========== */
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

/* ========== Styled Components ========== */
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

const SignInPrompt = styled.div`
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

/* ========== Main Component ========== */
const AdTask = () => {
  const {
    id,
    isPremium,
    adsConfig,
    adsWatched,
    dailyAdsWatched,
    lastAdTimestamp,
    setBalance,
    setTaskPoints,
    setAdsBalance,
    setDollarBalance2,
    setAdsWatched,
    setDailyAdsWatched,
    setLastAdTimestamp,
    checkAndResetDailyAds
  } = useUser();

  const [adWatched, setAdWatched] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [congrats, setCongrats] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [adError, setAdError] = useState(null);
  const [showCooldownPopup, setShowCooldownPopup] = useState(false);
  const [cooldownMessage, setCooldownMessage] = useState("");
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [activeAd, setActiveAd] = useState(adsConfig.ads.find(ad => ad.active) || adsConfig.ads[0]);

  /* ========== Authentication Checks ========== */
  useEffect(() => {
    if (!id) {
      setAdError("Please sign in to access ad features");
    } else {
      setAdError(null);
    }
  }, [id]);

  /* ========== Progress Calculation ========== */
  const progressPercentage = useMemo(() => {
    const dailyLimit = isPremium ? adsConfig.premiumDailyLimit : adsConfig.dailyLimit;
    return Math.min(100, (dailyAdsWatched / dailyLimit) * 100);
  }, [dailyAdsWatched, adsConfig, isPremium]);

  /* ========== Active Ad Management ========== */
  useEffect(() => {
    setActiveAd(adsConfig.ads.find(ad => ad.active) || adsConfig.ads[0]);
  }, [adsConfig]);

  /* ========== Cooldown Timer ========== */
  useEffect(() => {
    if (!id) return;

    checkAndResetDailyAds();

    const updateCooldown = () => {
      if (!lastAdTimestamp) {
        setCooldownRemaining(0);
        return;
      }
      
      const now = new Date();
      const timePassed = now - lastAdTimestamp;
      const remaining = Math.max(0, Math.ceil((adsConfig.cooldown - timePassed) / 1000));
      setCooldownRemaining(remaining);
    };

    updateCooldown();
    const timer = setInterval(updateCooldown, 1000);
    return () => clearInterval(timer);
  }, [lastAdTimestamp, adsConfig.cooldown, checkAndResetDailyAds, id]);

  /* ========== Ad Script Loading ========== */
  useEffect(() => {
    if (!id || !activeAd) return;

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
  }, [activeAd, id]);

  /* ========== Notification Handlers ========== */
  const showCooldownNotification = useCallback((message) => {
    setCooldownMessage(message);
    setShowCooldownPopup(true);
    setTimeout(() => setShowCooldownPopup(false), 3000);
  }, []);

  /* ========== Core Ad Functions ========== */
  const recordAdWatch = useCallback(async (adData) => {
    if (!id) {
      console.error("User not authenticated - ID is missing");
      throw new Error("Please sign in to watch ads");
    }
    
    const now = new Date();
    const userRef = doc(db, 'telegramUsers', id);
    
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          console.error("User document does not exist for ID:", id);
          throw new Error("User account not found");
        }
        
        const userData = userDoc.data();
        const currentDailyCount = userData.dailyAdsWatched || 0;
        const dailyLimit = userData.isPremium ? 
          adsConfig.premiumDailyLimit : adsConfig.dailyLimit;
        
        if (currentDailyCount >= dailyLimit) {
          throw new Error(`Daily ad limit reached (${dailyLimit} ads)`);
        }
        
        const newAdEntry = {
          adId: adData.adId,
          timestamp: now,
          pointsEarned: adsConfig.pointsBonus,
          dollarsEarned: adsConfig.dollarBonus
        };
        
        transaction.update(userRef, {
          adsWatched: increment(1),
          dailyAdsWatched: increment(1),
          lastAdTimestamp: serverTimestamp(),
          adHistory: arrayUnion(newAdEntry),
          balance: increment(adsConfig.pointsBonus),
          adsBalance: increment(adsConfig.dollarBonus),
          dollarBalance2: increment(adsConfig.dollarBonus)
        });
      });
      
      setAdsWatched(prev => prev + 1);
      setDailyAdsWatched(prev => prev + 1);
      setLastAdTimestamp(now);
      setBalance(prev => prev + adsConfig.pointsBonus);
      setAdsBalance(prev => +(prev + adsConfig.dollarBonus).toFixed(6));
      setDollarBalance2(prev => +(prev + adsConfig.dollarBonus).toFixed(6));
      
      return true;
    } catch (error) {
      console.error("Error recording ad watch:", {
        error: error.message,
        userId: id,
        adData
      });
      throw error;
    }
  }, [
    id, 
    adsConfig,
    setAdsWatched,
    setDailyAdsWatched,
    setLastAdTimestamp,
    setBalance,
    setAdsBalance,
    setDollarBalance2
  ]);

  const handleAdCompletion = useCallback(async () => {
    try {
      if (!id) {
        setAdError("Please sign in to complete this ad");
        return;
      }

      const now = new Date();
      await recordAdWatch({
        adId: activeAd.id,
        pointsEarned: adsConfig.pointsBonus,
        dollarsEarned: adsConfig.dollarBonus,
        timestamp: now
      });
      setAdWatched(true);
    } catch (error) {
      console.error("Ad completion error:", {
        error: error.message,
        userId: id,
        activeAd
      });
      setAdError(error.message);
    }
  }, [recordAdWatch, activeAd, adsConfig, id]);

  /* ========== Reward Claiming ========== */
  const canClaimReward = useMemo(() => {
    if (!id || !adWatched) return false;
    
    if (!lastAdTimestamp) return true;
    
    return (new Date() - lastAdTimestamp) < 3600000;
  }, [adWatched, lastAdTimestamp, id]);

  const claimReward = useCallback(async () => {
    if (!id) {
      setAdError("Please sign in to claim rewards");
      return;
    }

    if (!adWatched || claiming) return;
    
    setClaiming(true);
    setAdError(null);
    
    try {
      const userRef = doc(db, "telegramUsers", id);
      
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error("User document doesn't exist");
        }
        
        const userData = userDoc.data();
        const lastAdTime = userData.lastAdTimestamp?.toDate();
        
        if (!lastAdTime || (new Date() - lastAdTime) > adsConfig.cooldown * 3) {
          throw new Error("No valid ad watch recorded. Please watch an ad first.");
        }
        
        transaction.update(userRef, {
          balance: increment(adsConfig.pointsBonus),
          taskPoints: increment(adsConfig.pointsBonus),
          adsBalance: increment(adsConfig.dollarBonus),
          dollarBalance2: increment(adsConfig.dollarBonus),
          lastClaimDate: serverTimestamp()
        });
      });
      
      setBalance(prev => prev + adsConfig.pointsBonus);
      setTaskPoints(prev => prev + adsConfig.pointsBonus);
      setAdsBalance(prev => +(prev + adsConfig.dollarBonus).toFixed(6));
      setDollarBalance2(prev => +(prev + adsConfig.dollarBonus).toFixed(6));
      
      setAdWatched(false);
      setCongrats(true);
      setTimeout(() => setCongrats(false), 4000);
      
    } catch (error) {
      console.error("Error claiming reward:", {
        error: error.message,
        userId: id
      });
      setAdError(error.message);
      setTimeout(() => setAdError(null), 5000);
    } finally {
      setClaiming(false);
    }
  }, [
    adWatched, 
    claiming, 
    id, 
    adsConfig, 
    setBalance, 
    setTaskPoints, 
    setAdsBalance, 
    setDollarBalance2
  ]);

  /* ========== Ad Display Handler ========== */
  const showAd = useCallback(async () => {
    if (!id) {
      setAdError("Please sign in to watch ads");
      return;
    }

    if (isAdLoading) return;
    
    setIsAdLoading(true);
    setAdError(null);
    
    try {
      const now = new Date();
      const dailyLimit = isPremium ? adsConfig.premiumDailyLimit : adsConfig.dailyLimit;
      
      if (dailyAdsWatched >= dailyLimit) {
        showCooldownNotification(`Daily limit reached (${dailyLimit} ads). Try again tomorrow.`);
        return;
      }
      
      if (lastAdTimestamp) {
        const timeSinceLastAd = now - lastAdTimestamp;
        if (timeSinceLastAd < adsConfig.cooldown) {
          const remainingTime = adsConfig.cooldown - timeSinceLastAd;
          const waitMinutes = Math.ceil(remainingTime / 60000);
          showCooldownNotification(`Please wait ${waitMinutes} minute${waitMinutes > 1 ? 's' : ''} before watching another ad.`);
          return;
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await handleAdCompletion();
        return;
      }
      
      if (!window[activeAd.sdkVar]) {
        throw new Error("Ad provider not loaded yet");
      }
      
      await window[activeAd.sdkVar]();
      await handleAdCompletion();
      
    } catch (error) {
      console.error("Error showing ad:", {
        error: error.message,
        userId: id
      });
      setAdError(error.message || "Failed to load ad. Please try again.");
    } finally {
      setIsAdLoading(false);
    }
  }, [
    isAdLoading, 
    isPremium, 
    adsConfig, 
    dailyAdsWatched, 
    lastAdTimestamp, 
    handleAdCompletion, 
    showCooldownNotification, 
    activeAd,
    id
  ]);

  /* ========== Render Logic ========== */
  if (!id) {
    return (
      <TaskContainer>
        <TaskCard>
          <GlowEffect />
          <TaskHeader>
            <SparkleIcon size={24} />
            <TaskTitle>Watch Ads & Earn Rewards</TaskTitle>
          </TaskHeader>
          <SignInPrompt>
            <TaskDescription>
              You need to sign in to access this feature
            </TaskDescription>
            <ErrorText>
              <IoTimeOutline /> Authentication required
            </ErrorText>
          </SignInPrompt>
        </TaskCard>
      </TaskContainer>
    );
  }

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
          Watch short video ads and earn Berry tokens and USD rewards. 
          {isPremium ? " Enjoy unlimited ads with your Premium status!" : " Complete your daily limit for maximum earnings."}
          <br /><br />
          <strong>Total Ads Watched:</strong> {adsWatched}
        </TaskDescription>
        
        <RewardBadges>
          <RewardBadge
            $bgColor={berryTheme.colors.primaryLight}
            $textColor={berryTheme.colors.primaryDark}
            $shadowColor="rgba(227, 11, 92, 0.1)"
            whileHover={{ scale: 1.05 }}
          >
            <FaCoins size={16} /> +{adsConfig.pointsBonus} Berry
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
            <IoTimeOutline /> {dailyAdsWatched}/{isPremium ? adsConfig.premiumDailyLimit : adsConfig.dailyLimit} ads today
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
            disabled={cooldownRemaining > 0 || isAdLoading || dailyAdsWatched >= (isPremium ? adsConfig.premiumDailyLimit : adsConfig.dailyLimit)}
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
            disabled={!canClaimReward || claiming}
            $bgColor={canClaimReward ? berryTheme.colors.success : berryTheme.colors.grey200}
            $textColor={canClaimReward ? 'white' : berryTheme.colors.textMuted}
            $hoverColor={canClaimReward ? berryTheme.colors.successDark : berryTheme.colors.grey200}
            $shadowColor={canClaimReward ? "rgba(46, 204, 113, 0.3)" : "rgba(0,0,0,0.1)"}
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
