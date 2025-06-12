import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/userContext';
import { FaGift, FaCheckCircle, FaClock } from 'react-icons/fa';
import { doc, updateDoc, getDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import styled, { keyframes, css } from 'styled-components';
import { berryTheme } from '../../Theme';
import NavBar from '../Nweb/NavBar';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const confetti = keyframes`
  0% { transform: translateY(0) rotate(0); opacity: 1; }
  100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
`;

// Styled Components
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
  const { id, userData, setBalance, loading } = useUser();
  const [lastClaimed, setLastClaimed] = useState(null);
  const [nextClaim, setNextClaim] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Check reward eligibility on load
  useEffect(() => {
    const checkRewardStatus = async () => {
      if (!id) return;

      const userDoc = await getDoc(doc(db, 'telegramUsers', id));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.lastDailyReward) {
          setLastClaimed(data.lastDailyReward.toDate());
          
          // Calculate next claim time (24 hours after last claim)
          const nextAvailable = new Date(data.lastDailyReward.toDate());
          nextAvailable.setHours(nextAvailable.getHours() + 24);
          setNextClaim(nextAvailable);
        }
      }
    };

    checkRewardStatus();
  }, [id, userData]);

  // Countdown timer
  useEffect(() => {
    if (!nextClaim) return;

    const timer = setInterval(() => {
      const now = new Date();
      if (now >= nextClaim) {
        setNextClaim(null);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextClaim]);

  const canClaim = !lastClaimed || (nextClaim && new Date() >= nextClaim);

  const handleClaimReward = async () => {
    if (!canClaim || isClaiming) return;

    setIsClaiming(true);
    try {
      // Show confetti effect
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);

      // Update Firestore
      const userRef = doc(db, 'telegramUsers', id);
      await updateDoc(userRef, {
        balance: increment(5),
        lastDailyReward: serverTimestamp()
      });

      // Update local state
      setBalance(prev => prev + 5);
      setLastClaimed(new Date());
      
      // Set next claim time
      const nextClaimTime = new Date();
      nextClaimTime.setHours(nextClaimTime.getHours() + 24);
      setNextClaim(nextClaimTime);
    } catch (error) {
      console.error('Error claiming reward:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  const getTimeRemaining = () => {
    if (!nextClaim) return '00:00:00';
    
    const now = new Date();
    const diff = nextClaim - now;
    
    if (diff <= 0) return '00:00:00';
    
    const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <Container>
      <PageHeader>
        <LogoImage src='/Berry.png' alt="Berry Logo" />
        <LogoText>berry</LogoText>
      </PageHeader>

      <MainContent>
        <RewardCard>
          {showConfetti && generateConfetti()}
          
          <RewardIcon $claimed={!canClaim} $pulse={canClaim}>
            {canClaim ? <FaGift /> : <FaCheckCircle />}
          </RewardIcon>
          
          <RewardTitle>Daily Reward</RewardTitle>
          <RewardAmount>$5</RewardAmount>
          
          <RewardDescription>
            Claim your daily $5 reward. Come back every 24 hours to claim again!
          </RewardDescription>
          
          <ClaimButton 
            onClick={handleClaimReward}
            disabled={!canClaim || isClaiming || loading}
          >
            {isClaiming ? (
              <>
                Processing...
              </>
            ) : canClaim ? (
              'Claim Your Reward'
            ) : (
              'Already Claimed'
            )}
          </ClaimButton>
          
          {!canClaim && nextClaim && (
            <StatusMessage className="waiting">
              <FaClock />
              Next reward in: <Countdown>{getTimeRemaining()}</Countdown>
            </StatusMessage>
          )}
          
          {lastClaimed && canClaim && (
            <StatusMessage className="claimed">
              <FaCheckCircle />
              Reward available!
            </StatusMessage>
          )}
        </RewardCard>
      </MainContent>

      <NavBar />
    </Container>
  );
};

export default DailyReward;