import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/userContext';
import { FaGift, FaCheckCircle, FaClock } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import styled, { keyframes, css } from 'styled-components';
import { berryTheme } from '../../Theme';
import NavBar from '../Nweb/NavBar';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const confetti = keyframes`
  0% { transform: translateY(0) rotate(0); opacity: 1; }
  100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${berryTheme.colors.backgroundGradient};
  padding-bottom: 80px;
`;

const PageHeader = styled.header`
  padding: ${berryTheme.spacing.large} ${berryTheme.spacing.medium} ${berryTheme.spacing.medium};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${berryTheme.spacing.small};
  position: relative;
`;

const LogoImage = styled.img`
  height: 36px;
  width: auto;
`;

const LogoText = styled.span`
  font-size: 1.5rem;
  font-weight: ${berryTheme.fonts.bold};
  color: ${berryTheme.colors.primary};
`;

const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const RewardCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  text-align: center;
  box-shadow: ${berryTheme.shadows.large};
  border: 1px solid ${berryTheme.colors.grey200};
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
`;

const RewardIcon = styled.div`
  width: 100px;
  height: 100px;
  background: ${berryTheme.colors.primaryLight}20;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: ${props => props.$claimed ? berryTheme.colors.success : berryTheme.colors.primary};
  font-size: 3rem;
  position: relative;
  ${props => props.$pulse && css`animation: ${pulse} 2s infinite`};
`;

const RewardTitle = styled.h2`
  font-size: 1.5rem;
  color: ${berryTheme.colors.textDark};
  margin-bottom: 8px;
`;

const RewardAmount = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${berryTheme.colors.primary};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const RewardDescription = styled.p`
  color: ${berryTheme.colors.textMuted};
  margin-bottom: 24px;
  font-size: 0.9rem;
`;

const ClaimButton = styled.button`
  width: 100%;
  padding: 16px;
  background: ${props => props.disabled ? berryTheme.colors.grey300 : berryTheme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background: ${berryTheme.colors.primaryDark};
    transform: translateY(-2px);
  }
`;

const StatusMessage = styled.div`
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.9rem;
  width: 100%;

  &.claimed {
    background: ${berryTheme.colors.successLight}20;
    color: ${berryTheme.colors.success};
    border: 1px solid ${berryTheme.colors.successLight};
  }

  &.waiting {
    background: ${berryTheme.colors.warningLight}20;
    color: ${berryTheme.colors.warning};
    border: 1px solid ${berryTheme.colors.warningLight};
  }
`;

const Countdown = styled.span`
  font-weight: 700;
`;

const LastClaimed = styled.div`
  margin-top: 12px;
  font-size: 0.8rem;
  color: ${berryTheme.colors.textMuted};
`;

const Confetti = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: ${berryTheme.colors.primary};
  opacity: 0;
  top: 50%;
  left: 50%;
  ${css`animation: ${confetti} 2s ease-out forwards`};
`;

const generateConfetti = () => {
  const colors = [
    berryTheme.colors.primary,
    berryTheme.colors.secondary,
    berryTheme.colors.success,
    berryTheme.colors.warning,
    berryTheme.colors.error
  ];

  return Array(50).fill().map((_, i) => (
    <Confetti 
      key={i}
      style={{
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 0.5}s`
      }}
    />
  ));
};

const DailyReward = () => {
  const { 
    id,
    checkinRewards,
    setCheckinRewards,
    setDollarBalance2,
    claimDailyReward,
    loading
  } = useUser();

  const [canClaimToday, setCanClaimToday] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCheckingClaim, setIsCheckingClaim] = useState(true);
  const [nextClaimDate, setNextClaimDate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkRewardStatus = async () => {
      if (!id) return;
      setIsCheckingClaim(true);
      setError(null);

      try {
        const userDoc = await getDoc(doc(db, 'telegramUsers', id));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const now = new Date();
          
          if (data.checkinRewards?.lastClaim) {
            const lastClaimDate = data.checkinRewards.lastClaim.toDate();
            
            const lastClaimDay = new Date(lastClaimDate);
            lastClaimDay.setHours(0, 0, 0, 0);
            
            const currentDay = new Date(now);
            currentDay.setHours(0, 0, 0, 0);
            
            if (lastClaimDay.getTime() === currentDay.getTime()) {
              setCanClaimToday(false);
              const tomorrow = new Date(currentDay);
              tomorrow.setDate(tomorrow.getDate() + 1);
              setNextClaimDate(tomorrow);
            } else {
              setCanClaimToday(true);
              setNextClaimDate(null);
            }
          } else {
            setCanClaimToday(true);
            setNextClaimDate(null);
          }
        }
      } catch (error) {
        console.error('Error checking reward status:', error);
        setError('Failed to check reward status');
      } finally {
        setIsCheckingClaim(false);
      }
    };

    checkRewardStatus();
  }, [id, checkinRewards]);

  useEffect(() => {
    if (!nextClaimDate) return;

    const timer = setInterval(() => {
      const now = new Date();
      if (now >= nextClaimDate) {
        setCanClaimToday(true);
        setNextClaimDate(null);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextClaimDate]);

  const handleClaimReward = async () => {
    if (!canClaimToday || isClaiming) return;

    setIsClaiming(true);
    setError(null);
    
    try {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);

      const rewardAmount = 5;
      const now = new Date();
      
      // Optimistically update local state
      setDollarBalance2(prev => prev + rewardAmount);
      setCheckinRewards(prev => ({
        ...prev,
        lastClaim: now,
        totalEarned: (prev?.totalEarned || 0) + rewardAmount,
        history: [...(prev?.history || []), {
          amount: rewardAmount,
          date: now,
          type: 'daily'
        }]
      }));
      
      setCanClaimToday(false);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      setNextClaimDate(tomorrow);

      // Update backend
      const result = await claimDailyReward(rewardAmount);
      
      if (!result?.success) {
        // Revert changes if backend fails
        setDollarBalance2(prev => prev - rewardAmount);
        setCheckinRewards(prev => ({
          ...prev,
          lastClaim: prev?.lastClaim,
          totalEarned: (prev?.totalEarned || 0) - rewardAmount,
          history: prev?.history?.slice(0, -1) || []
        }));
        throw new Error(result?.error || 'Failed to claim reward');
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      setError(error.message);
    } finally {
      setIsClaiming(false);
    }
  };

  const getTimeUntilNextClaim = () => {
    if (!nextClaimDate) return '00:00:00';
    
    const now = new Date();
    const diff = nextClaimDate - now;
    
    if (diff <= 0) return '00:00:00';
    
    const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatLastClaimed = () => {
    if (!checkinRewards?.lastClaim) return 'Never claimed';
    
    const lastClaimDate = checkinRewards.lastClaim.toDate();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return lastClaimDate.toLocaleDateString(undefined, options);
  };

  const getTotalCheckinEarnings = () => {
    return checkinRewards?.totalEarned || 0;
  };

  if (isCheckingClaim) {
    return (
      <Container>
        <PageHeader>
          <LogoImage src='/Berry.png' alt="Berry Logo" />
          <LogoText>berry</LogoText>
        </PageHeader>
        <MainContent>
          <RewardCard>
            <RewardDescription>Checking reward status...</RewardDescription>
          </RewardCard>
        </MainContent>
        <NavBar />
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader>
        <LogoImage src='/Berry.png' alt="Berry Logo" />
        <LogoText>berry</LogoText>
      </PageHeader>

      <MainContent>
        <RewardCard>
          {showConfetti && generateConfetti()}
          
          <RewardIcon $claimed={!canClaimToday} $pulse={canClaimToday}>
            {canClaimToday ? <FaGift /> : <FaCheckCircle />}
          </RewardIcon>
          
          <RewardTitle>Daily Check-In Reward</RewardTitle>
          <RewardAmount>$5</RewardAmount>
          
          <RewardDescription>
            Claim your daily $5 check-in reward. Available once per calendar day.
            <br />
            Total earned from check-ins: ${getTotalCheckinEarnings()}
          </RewardDescription>
          
          <ClaimButton 
            onClick={handleClaimReward}
            disabled={!canClaimToday || isClaiming || loading}
          >
            {isClaiming ? 'Processing...' : canClaimToday ? 'Claim Your Reward' : 'Already Claimed Today'}
          </ClaimButton>
          
          {error && (
            <StatusMessage className="waiting">
              <FaClock /> {error}
            </StatusMessage>
          )}

          {!canClaimToday && nextClaimDate && (
            <StatusMessage className="waiting">
              <FaClock />
              Next reward available at midnight: <Countdown>{getTimeUntilNextClaim()}</Countdown>
            </StatusMessage>
          )}
          
          {canClaimToday && (
            <StatusMessage className="claimed">
              <FaCheckCircle />
              Daily check-in reward available!
            </StatusMessage>
          )}

          <LastClaimed>
            Last claimed: {formatLastClaimed()}
          </LastClaimed>
        </RewardCard>
      </MainContent>

      <NavBar />
    </Container>
  );
};

export default DailyReward;
