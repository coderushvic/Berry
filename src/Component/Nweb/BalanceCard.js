import React from 'react';
import styled, { keyframes } from 'styled-components';
import { berryTheme } from '../../Theme';
import { FaWallet, FaUserFriends, FaPlayCircle, FaTasks } from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';

// Animation for shimmer effect (from Referrals)
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Base card styling (from Referrals)
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

// Content wrapper
const Content = styled.div`
  position: relative;
  z-index: 1;
`;

// Card title styling (from Referrals)
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

// Balance amount (adapted from Referrals' StatValue)
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

// Status wrapper (kept from original but adjusted)
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

// Status text (adjusted)
const StatusText = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${berryTheme.colors.textDark};
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Refresh icon (kept from original)
const RefreshIcon = styled(FiRefreshCw)`
  color: ${berryTheme.colors.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: rotate(180deg);
    color: ${berryTheme.colors.primaryDark};
  }
`;

// Status indicator (kept from original)
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

// Action buttons (from Referrals)
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

// Icon components for different card types
const ReferralIcon = styled(FaUserFriends)`
  color: ${berryTheme.colors.primaryLight};
`;

const VideoIcon = styled(FaPlayCircle)`
  color: ${berryTheme.colors.secondary};
`;

const TaskIcon = styled(FaTasks)`
  color: ${berryTheme.colors.primaryDark};
`;

function BalanceCard({ balance, cardType = 'balance' }) {
  const getIcon = () => {
    switch(cardType) {
      case 'referral':
        return <ReferralIcon />;
      case 'video':
        return <VideoIcon />;
      case 'task':
        return <TaskIcon />;
      default:
        return <FaWallet />;
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
      default:
        return 'Available Balance';
    }
  };

  return (
    <Card $borderColor={
      cardType === 'referral' ? berryTheme.colors.primaryLight :
      cardType === 'video' ? berryTheme.colors.secondary :
      cardType === 'task' ? berryTheme.colors.primaryDark :
      berryTheme.colors.primary
    }>
      <Content>
        <CardTitle>
          {getIcon()}
          {getTitle()}
        </CardTitle>
        <BalanceAmount>${balance.toFixed(2)}</BalanceAmount>
        
        <ButtonGroup>
          <ActionButton>
            {cardType === 'balance' ? 'Withdraw' : 
             cardType === 'referral' ? 'Invite Friends' :
             cardType === 'video' ? 'Watch Videos' : 'View Tasks'}
          </ActionButton>
          <ActionButton>
            {cardType === 'balance' ? 'Deposit' : 
             cardType === 'referral' ? 'View Rewards' :
             cardType === 'video' ? 'Claim Rewards' : 'Completed'}
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