import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { berryTheme } from '../../Theme';
import { FaLink, FaCopy, FaShareAlt, FaWhatsapp, FaTelegram, FaEnvelope, FaUserFriends } from 'react-icons/fa';
import NavBar from './NavBar';

// Animation for shimmer effect
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Main container - updated to match Home1
const AppContainer = styled.div`
  font-family: ${berryTheme.fonts.main};
  background: ${berryTheme.colors.backgroundGradient};
  min-height: 100vh;
  max-width: auto;
  margin: 0 auto;
  position: relative;
  padding-bottom: 80px; // Space for nav
`;

// Content wrapper - updated padding to match Home1
const Content = styled.div`
  padding: ${berryTheme.spacing.medium};
`;

// Header - added from Home1
const Header = styled.header`
  padding: ${berryTheme.spacing.large} ${berryTheme.spacing.medium} ${berryTheme.spacing.medium};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${berryTheme.spacing.small};
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

// Base card styling
const Card = styled.div`
  background: ${berryTheme.colors.cardBackground};
  border-radius: 16px;
  padding: 24px;
  box-shadow: ${berryTheme.shadows.small};
  border-top: 4px solid ${props => props.$borderColor || berryTheme.colors.primary};
  margin-bottom: 16px;
`;

// Referral link card (now first)
const ReferralLinkCard = styled(Card)`
  border-top-color: ${berryTheme.colors.primaryDark};
`;

// Earnings card (now second)
const EarningsCard = styled(Card)`
  border-top-color: ${berryTheme.colors.primary};
`;

// Referrals card (now third)
const ReferralsCard = styled(Card)`
  border-top-color: ${berryTheme.colors.primaryLight};
`;

const CardTitle = styled.h3`
  color: ${berryTheme.colors.textDark};
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 16px 0;
  text-align: center;
`;

const EarningsAmount = styled.div`
  font-size: 2.2rem;
  font-weight: 700;
  color: ${berryTheme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const StatValue = styled.div`
  font-size: 2.2rem;
  font-weight: 700;
  color: ${berryTheme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const LinkContainer = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 20px;
  border: 1px solid ${berryTheme.colors.grey300};
`;

const ReferralLink = styled.div`
  flex-grow: 1;
  font-weight: 600;
  color: ${berryTheme.colors.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.95rem;
`;

// Action buttons
const ActionButton = styled.button`
  background: ${props => props.$copied ? '#4CAF50' : berryTheme.colors.primary};
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
    background: ${props => props.$copied ? '#4CAF50' : berryTheme.colors.primaryDark};
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
`;

const IconWrapper = styled.span`
  margin-right: 8px;
  font-size: 1.1rem;
`;

// Share modal styling
const ShareModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const ShareContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
`;

const ShareTitle = styled.h3`
  margin: 0 0 20px 0;
  color: ${berryTheme.colors.textDark};
`;

const ShareOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

const ShareOption = styled.button`
  background: ${berryTheme.colors.cardBackground};
  border: none;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${berryTheme.colors.grey200};
    transform: translateY(-3px);
  }
`;

const ShareIcon = styled.div`
  font-size: 1.8rem;
  margin-bottom: 8px;
  color: ${berryTheme.colors.primary};
`;

const ShareLabel = styled.div`
  font-size: 0.8rem;
  color: ${berryTheme.colors.textDark};
`;

function Referrals() {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralStats = {
    totalReferrals: 24,
    earnedAmount: 86.50,
    referralLink: 'berryapp.com/invite/yourusername123'
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralStats.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    setShowShareModal(true);
  };

  const closeModal = () => {
    setShowShareModal(false);
  };

  return (
    <AppContainer>
      <Header>
        <LogoImage src='/Berry.png' alt="Berry Logo" />
        <LogoText>berry</LogoText>
      </Header>
      <Content>
        {/* Referral Link Card - Now first */}
        <ReferralLinkCard>
          <CardTitle>Your Unique Referral Link</CardTitle>
          <LinkContainer>
            <FaLink color={berryTheme.colors.primary} style={{ marginRight: '12px' }} />
            <ReferralLink>{referralStats.referralLink}</ReferralLink>
            <ActionButton 
              onClick={copyToClipboard} 
              $copied={copied}
              style={{ 
                marginLeft: '12px', 
                width: 'auto', 
                padding: '10px 14px'
              }}
            >
              {copied ? 'Copied!' : <FaCopy />}
            </ActionButton>
          </LinkContainer>
          <ButtonGroup>
            <ActionButton onClick={shareLink}>
              <IconWrapper><FaShareAlt /></IconWrapper>
              Share Link
            </ActionButton>
            <ActionButton>
              <IconWrapper><FaUserFriends /></IconWrapper>
              Invite Friends
            </ActionButton>
          </ButtonGroup>
        </ReferralLinkCard>

        {/* Earnings Card - Now second */}
        <EarningsCard>
          <CardTitle>Total Earnings From Referrals</CardTitle>
          <EarningsAmount>
            <FaUserFriends />
            ${referralStats.earnedAmount.toFixed(2)}
          </EarningsAmount>
        </EarningsCard>

        {/* Referrals Card - Now third */}
        <ReferralsCard>
          <CardTitle>People Joined Using Your Link</CardTitle>
          <StatValue>
            <FaUserFriends />
            {referralStats.totalReferrals}
          </StatValue>
        </ReferralsCard>
      </Content>
      
      {/* Share Modal */}
      {showShareModal && (
        <ShareModal onClick={closeModal}>
          <ShareContent onClick={e => e.stopPropagation()}>
            <ShareTitle>Share via</ShareTitle>
            <ShareOptions>
              <ShareOption>
                <ShareIcon><FaWhatsapp /></ShareIcon>
                <ShareLabel>WhatsApp</ShareLabel>
              </ShareOption>
              <ShareOption>
                <ShareIcon><FaTelegram /></ShareIcon>
                <ShareLabel>Telegram</ShareLabel>
              </ShareOption>
              <ShareOption>
                <ShareIcon><FaEnvelope /></ShareIcon>
                <ShareLabel>Email</ShareLabel>
              </ShareOption>
            </ShareOptions>
          </ShareContent>
        </ShareModal>
      )}
      
      <NavBar />
    </AppContainer>
  );
}

export default Referrals;