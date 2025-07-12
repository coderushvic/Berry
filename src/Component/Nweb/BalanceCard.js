import React from 'react';
import styled, { keyframes } from 'styled-components';
import { berryTheme } from '../../Theme';
import { FaUserFriends, FaPlayCircle, FaTasks } from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import { useUser } from "../../context/userContext";

// Animation for shimmer effect
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const Card = styled.div`
  background: ${berryTheme.colors.cardBackground};
  border-radius: 16px;
  padding: 24px;
  box-shadow: ${berryTheme.shadows.small};
  border-top: 4px solid ${props => props.$borderColor || berryTheme.colors.primary};
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
`;

const CardTitle = styled.h3`
  color: ${berryTheme.colors.textDark};
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 16px 0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const BalanceAmount = styled.div`
  font-size: 2.2rem;
  font-weight: 700;
  color: ${berryTheme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 16px 0;
`;

const StatusWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${berryTheme.spacing.small};
  margin-top: 20px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  backdrop-filter: blur(4px);
`;

const StatusText = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${berryTheme.colors.textDark};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RefreshIcon = styled(FiRefreshCw)`
  color: ${berryTheme.colors.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: rotate(180deg);
    color: ${berryTheme.colors.primaryDark};
  }
`;

const StatusIndicator = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${berryTheme.colors.primary};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    border: 1px solid ${berryTheme.colors.primary}80;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

const ActionButton = styled.button`
  background: ${berryTheme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-size: 1rem;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: ${berryTheme.colors.primaryDark};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(227, 11, 92, 0.3);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.3) 50%,
      rgba(255,255,255,0) 100%
    );
    transform: translateX(-100%);
  }
  
  &:hover::after {
    animation: ${shimmer} 1.5s infinite;
  }
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 20px;
`;

const ReferralIcon = styled(FaUserFriends)`
  color: ${berryTheme.colors.primaryLight};
`;

const VideoIcon = styled(FaPlayCircle)`
  color: ${berryTheme.colors.secondary};
`;

const TaskIcon = styled(FaTasks)`
  color: ${berryTheme.colors.primaryDark};
`;

const BreakdownSection = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  font-size: 0.9rem;
`;

const BreakdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
`;

const ReferralHeader = styled.h4`
  margin: 0 0 8px 0;
  color: ${berryTheme.colors.textDark};
  font-size: 0.9rem;
  font-weight: 600;
`;

function BalanceCard({ cardType = 'referral' }) {
  const { 
    adsBalance = 0,
    dollarBalance2 = 0,
    checkinRewards = 0,
    refBonus = 0,
    processedReferrals = []
  } = useUser();

  // Calculate detailed referral earnings
  const detailedReferralEarnings = processedReferrals.reduce((total, referral) => {
    return total + (referral.refBonus || 0);
  }, 0);

  // Use the more accurate refBonus if available, otherwise fallback to calculated value
  const totalReferralEarnings = refBonus || detailedReferralEarnings;
  
  // Other earnings components
  const totalVideoEarnings = dollarBalance2;
  const totalAdEarnings = adsBalance;
  const totalDailyRewards = checkinRewards;

  const getIcon = () => {
    switch(cardType) {
      case 'referral':
        return <ReferralIcon />;
      case 'video':
        return <VideoIcon />;
      case 'task':
        return <TaskIcon />;
      case 'ads':
        return <FaPlayCircle />;
      case 'daily':
        return <FaTasks />;
      default:
        return <ReferralIcon />;
    }
  };

  const getTitle = () => {
    switch(cardType) {
      case 'referral':
        return 'Referral Earnings';
      case 'video':
        return 'Video Rewards';
      case 'task':
        return 'Task Rewards';
      case 'ads':
        return 'Ad Rewards';
      case 'daily':
        return 'Daily Rewards';
      default:
        return 'Referral Earnings';
    }
  };

  const displayAmount = cardType === 'referral' ? totalReferralEarnings :
                      cardType === 'video' ? totalVideoEarnings :
                      cardType === 'ads' ? totalAdEarnings :
                      cardType === 'daily' ? totalDailyRewards :
                      0;

  return (
    <Card $borderColor={
      cardType === 'referral' ? berryTheme.colors.primaryLight :
      cardType === 'video' ? berryTheme.colors.secondary :
      cardType === 'task' ? berryTheme.colors.primaryDark :
      cardType === 'ads' ? berryTheme.colors.accent :
      cardType === 'daily' ? berryTheme.colors.secondaryLight :
      berryTheme.colors.primaryLight
    }>
      <Content>
        <CardTitle>
          {getIcon()}
          {getTitle()}
        </CardTitle>
        <BalanceAmount>${displayAmount.toFixed(2)}</BalanceAmount>
        
        {cardType === 'referral' && processedReferrals.length > 0 && (
          <BreakdownSection>
            <ReferralHeader>Your Referral History</ReferralHeader>
            {processedReferrals.map((ref, index) => (
              <BreakdownItem key={index}>
                <span>Referral {index + 1}:</span>
                <span>+${(ref.refBonus || 0).toFixed(2)}</span>
              </BreakdownItem>
            ))}
          </BreakdownSection>
        )}

        <ButtonGroup>
          <ActionButton>
            {cardType === 'referral' ? 'Invite Friends' :
             cardType === 'video' ? 'Watch Videos' : 
             cardType === 'ads' ? 'View Ads' :
             cardType === 'daily' ? 'Check In' :
             'View Tasks'}
          </ActionButton>
          <ActionButton>
            {cardType === 'referral' ? 'View Rewards' :
             cardType === 'video' ? 'Claim Rewards' : 
             cardType === 'ads' ? 'Ad History' :
             cardType === 'daily' ? 'Streak Info' :
             'Completed'}
          </ActionButton>
        </ButtonGroup>
        
        <StatusWrapper>
          <StatusIndicator />
          <StatusText>
            Live Updates
            <RefreshIcon size={16} />
          </StatusText>
        </StatusWrapper>
      </Content>
    </Card>
  );
}

export default BalanceCard;
