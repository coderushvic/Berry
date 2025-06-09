import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../context/userContext';
import { doc, Timestamp, updateDoc } from '@firebase/firestore';
import { db } from '../../firebase/firestore';
import styled from 'styled-components';
import { berryTheme } from '../../Theme';

const VerificationContainer = styled.div`
  background: ${berryTheme.colors.backgroundGradient};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const BerryHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const BerryLogo = styled.img`
  height: 5rem;
  margin-bottom: 1.5rem;
`;

const VerificationTitle = styled.h1`
  font-size: 2.2rem;
  color: ${berryTheme.colors.primary};
  margin-bottom: 1rem;
  font-weight: 700;
`;

const VerificationSubtitle = styled.p`
  font-size: 1.1rem;
  color: ${berryTheme.colors.textDark};
  max-width: 500px;
  line-height: 1.6;
`;

const VerificationGrid = styled.div`
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
`;

const VerificationItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid ${berryTheme.colors.grey200};
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const VerificationIcon = styled.div`
  width: 3rem;
  height: 3rem;
  background: ${props => props.$complete ? berryTheme.colors.primaryLight : '#f5f5f5'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.5rem;
  transition: all 0.3s ease;
`;

const VerificationContent = styled.div`
  flex: 1;
`;

const VerificationLabel = styled.h3`
  font-size: 1rem;
  color: ${berryTheme.colors.primaryDark};
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const VerificationDescription = styled.p`
  font-size: 0.9rem;
  color: ${berryTheme.colors.textSecondary};
  line-height: 1.5;
`;

const VerificationProgress = styled.div`
  height: 6px;
  background: ${berryTheme.colors.grey200};
  border-radius: 3px;
  margin-top: 0.5rem;
  overflow: hidden;
`;

const VerificationProgressFill = styled.div`
  height: 100%;
  background: ${berryTheme.colors.primary};
  border-radius: 3px;
  transition: width 0.5s ease;
`;

const AccountCheck = () => {
  const {id, setLastCheckIn, setBalance, setWelcomeBonus} = useUser();
  const [progress, setProgress] = useState({
    accountAge: 0,
    activityLevel: 0,
    telegramPremium: 0,
    ogStatus: 0,
  });

  const verificationSteps = [
    {
      key: 'accountAge',
      title: 'Account History',
      description: 'Checking your Telegram legacy and activity history'
    },
    {
      key: 'activityLevel',
      title: 'Community Participation',
      description: 'Analyzing your engagement in Berry communities'
    },
    {
      key: 'telegramPremium',
      title: 'Premium Status',
      description: 'Checking for Telegram Premium benefits'
    },
    {
      key: 'ogStatus',
      title: 'Early Adopter',
      description: 'Verifying your OG status in Berry ecosystem'
    }
  ];

  const awardPointsNotPrem = useCallback(async () => {
    const firstDigit = parseInt(id.toString()[0]);
    const pointsToAward = firstDigit * 1000;
    const newBalance = pointsToAward;
  
    try {
      const now = new Date();
      const userRef = doc(db, 'telegramUsers', id.toString());
      await updateDoc(userRef, {
        balance: newBalance,
        welcomeBonus: pointsToAward,
        lastCheckIn: Timestamp.fromDate(now),
      });
      
      setTimeout(() => {
        setBalance(newBalance);
      }, 3800);

      setLastCheckIn(now);
      setWelcomeBonus(pointsToAward);
    } catch (error) {
      console.error('Error updating user points:', error);
    }
  }, [id, setBalance, setLastCheckIn, setWelcomeBonus]);

  useEffect(() => {
    if (id) {
      awardPointsNotPrem();
    }
  }, [id, awardPointsNotPrem]);

  useEffect(() => {
    const intervals = {
      accountAge: setInterval(() => updateProgress('accountAge'), 140),
      activityLevel: setInterval(() => updateProgress('activityLevel'), 100),
      telegramPremium: setInterval(() => updateProgress('telegramPremium'), 120),
      ogStatus: setInterval(() => updateProgress('ogStatus'), 160),
    };

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, []);

  const updateProgress = (key) => {
    setProgress((prev) => {
      if (prev[key] >= 100) {
        return prev;
      }
      return { ...prev, [key]: prev[key] + 5 };
    });
  };

  return (
    <VerificationContainer>
      <BerryHeader>
        <BerryLogo src="/Berry.png" alt="Berry Rewards" />
        <VerificationTitle>Unlocking Your Berry Rewards</VerificationTitle>
        <VerificationSubtitle>
          We're verifying your eligibility for special rewards in the Berry ecosystem.
          Earn tokens for being an active Telegram user!
        </VerificationSubtitle>
      </BerryHeader>
      
      <VerificationGrid>
        {verificationSteps.map((step) => (
          <VerificationItem key={step.key}>
            <VerificationIcon $complete={progress[step.key] === 100}>
              {progress[step.key] === 100 ? (
                <span style={{ color: berryTheme.colors.primary }}>✓</span>
              ) : (
                <span style={{ color: '#999' }}>○</span>
              )}
            </VerificationIcon>
            <VerificationContent>
              <VerificationLabel>{step.title}</VerificationLabel>
              <VerificationDescription>{step.description}</VerificationDescription>
              <VerificationProgress>
                <VerificationProgressFill style={{ width: `${progress[step.key]}%` }} />
              </VerificationProgress>
            </VerificationContent>
          </VerificationItem>
        ))}
      </VerificationGrid>
    </VerificationContainer>
  );
};

export default AccountCheck;