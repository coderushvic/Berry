import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/userContext';
import { FaGift, FaCheckCircle, FaClock, FaCoins } from 'react-icons/fa';
import styled, { keyframes, css } from 'styled-components';
import { berryTheme } from '../../Theme';
import NavBar from '../Nweb/NavBar';

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const confetti = keyframes`
  0% { transform: translateY(0) rotate(0); opacity: 1; }
  100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
`;

// Styled components
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

const TotalRewards = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 0.9rem;
  color: ${berryTheme.colors.success};
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
    initialized,
    loading,
    claimDailyReward,
    lastDailyReward,
    streak,
    checkinRewards,
    canClaimDailyReward,
    nextDailyRewardTime,
    error: contextError
  } = useUser();
  
  const [isClaiming, setIsClaiming] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (contextError) {
      setLocalError(contextError);
    }
  }, [contextError]);

  const handleClaimReward = async () => {
    if (!canClaimDailyReward || isClaiming) return;

    setIsClaiming(true);
    setLocalError(null);
    
    try {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);

      const result = await claimDailyReward();
      
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to claim reward');
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      setLocalError(error.message);
    } finally {
      setIsClaiming(false);
    }
  };

  const getTimeUntilNextClaim = () => {
    if (!nextDailyRewardTime) return '00:00:00';
    
    const now = new Date();
    const diff = nextDailyRewardTime - now;
    
    if (diff <= 0) return '00:00:00';
    
    const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatLastClaimed = () => {
    if (!lastDailyReward) return 'Never claimed';
    
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return lastDailyReward.toLocaleDateString(undefined, options);
  };

  if (!initialized || loading) {
    return (
      <Container>
        <PageHeader>
          <LogoImage src='/Berry.png' alt="Berry Logo" />
          <LogoText>berry</LogoText>
        </PageHeader>
        <MainContent>
          <RewardCard>
            <RewardDescription>Loading reward information...</RewardDescription>
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
          
          <RewardIcon $claimed={!canClaimDailyReward} $pulse={canClaimDailyReward}>
            {canClaimDailyReward ? <FaGift /> : <FaCheckCircle />}
          </RewardIcon>
          
          <RewardTitle>Daily Reward</RewardTitle>
          <RewardAmount>$5</RewardAmount>
          
          <RewardDescription>
            Claim your daily $5 reward. Current streak: {streak} days
          </RewardDescription>
          
          <ClaimButton 
            onClick={handleClaimReward}
            disabled={!canClaimDailyReward || isClaiming || loading}
          >
            {isClaiming ? 'Processing...' : canClaimDailyReward ? 'Claim Your Reward' : 'Already Claimed Today'}
          </ClaimButton>
          
          {localError && (
            <StatusMessage className="waiting">
              <FaClock /> {localError}
            </StatusMessage>
          )}

          {!canClaimDailyReward && nextDailyRewardTime && (
            <StatusMessage className="waiting">
              <FaClock />
              Next reward available in: <Countdown>{getTimeUntilNextClaim()}</Countdown>
            </StatusMessage>
          )}
          
          {canClaimDailyReward && (
            <StatusMessage className="claimed">
              <FaCheckCircle />
              Daily reward available!
            </StatusMessage>
          )}

          <LastClaimed>
            Last claimed: {formatLastClaimed()}
          </LastClaimed>

          <TotalRewards>
            <FaCoins /> Total claimed: ${checkinRewards.toFixed(2)}
          </TotalRewards>
        </RewardCard>
      </MainContent>

      <NavBar />
    </Container>
  );
};

export default DailyReward;
