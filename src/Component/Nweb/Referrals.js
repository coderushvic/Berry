import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { berryTheme } from '../../Theme';
import { FaLink, FaCopy, FaShareAlt, FaWhatsapp, FaTelegram, FaUserFriends, FaFacebook, FaTwitter, FaTimes } from 'react-icons/fa';
import NavBar from './NavBar';
import { useUser } from "../../context/userContext";

// Animation for shimmer effect
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Main container
const AppContainer = styled.div`
  font-family: ${berryTheme.fonts.main};
  background: ${berryTheme.colors.backgroundGradient};
  min-height: 100vh;
  max-width: auto;
  margin: 0 auto;
  position: relative;
  padding-bottom: 80px;
`;

// Content wrapper
const Content = styled.div`
  padding: ${berryTheme.spacing.medium};
`;

// Header
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

// Referral link card
const ReferralLinkCard = styled(Card)`
  border-top-color: ${berryTheme.colors.primaryDark};
`;

// Earnings card
const EarningsCard = styled(Card)`
  border-top-color: ${berryTheme.colors.primary};
`;

// Referrals card
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
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
`;

const ShareTitle = styled.h3`
  margin: 0;
  color: ${berryTheme.colors.textDark};
  padding: 24px 24px 0 24px;
`;

const ShareOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 24px;
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

const ModalHeader = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${berryTheme.colors.grey200};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ReferralList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const ReferralItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid ${berryTheme.colors.grey100};
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.color || berryTheme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin-right: 12px;
`;

const ReferralInfo = styled.div`
  flex: 1;
`;

const ReferralName = styled.div`
  font-weight: 600;
  color: ${berryTheme.colors.textDark};
`;

const ReferralBonus = styled.div`
  font-weight: 600;
  color: ${berryTheme.colors.primary};
`;

const EmptyState = styled.div`
  padding: 24px;
  text-align: center;
  color: ${berryTheme.colors.grey500};
`;

function Referrals() {
  const { id, referrals = [], loading, processedReferrals = [] } = useUser();
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Calculate total referral earnings in dollars
  const totalReferralEarnings = processedReferrals.reduce((total, referral) => {
    return total + (referral.refBonus || 0) * 0.01; // Convert points to dollars (100 points = $1)
  }, 0);

  const getInitials = (fullName = "") => {
    const nameParts = fullName.split(" ");
    return nameParts[0]?.charAt(0).toUpperCase() + (nameParts[1] ? nameParts[1].charAt(0).toUpperCase() : "");
  };

  const getRandomColor = () => {
    const colors = [
      berryTheme.colors.secondary,
      berryTheme.colors.accent,
      berryTheme.colors.primaryLight,
      '#F87171', // red-400
      '#60A5FA', // blue-400
      '#34D399', // green-400
      '#FBBF24', // yellow-400
      '#A78BFA'  // purple-400
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const copyToClipboard = () => {
    const reflink = `https://t.me/Fuhdhdbot?start=r${id}\nJoin me on Berry App and earn rewards together!`;
    
    navigator.clipboard
      .writeText(reflink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch((err) => console.error("Failed to copy text: ", err));
  };

  const shareOnSocialMedia = (platform) => {
    const shareUrl = `https://t.me/Fuhdhdbot?start=r${id}`;
    const shareText = "Join me on Berry App and earn rewards together!";

    let url = "";
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        break;
      case "telegram":
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        break;
      default:
        break;
    }

    if (url) {
      window.open(url, "_blank");
      setShowShareModal(false);
    }
  };

  return (
    <AppContainer>
      <Header>
        <LogoImage src='/Berry.png' alt="Berry Logo" />
        <LogoText>berry</LogoText>
      </Header>
      <Content>
        {/* Referral Link Card */}
        <ReferralLinkCard>
          <CardTitle>Your Unique Referral Link</CardTitle>
          <LinkContainer>
            <FaLink color={berryTheme.colors.primary} style={{ marginRight: '12px' }} />
            <ReferralLink>{`https://t.me/Fuhdhdbot?start=r${id}`}</ReferralLink>
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
            <ActionButton onClick={() => setShowShareModal(true)}>
              <IconWrapper><FaShareAlt /></IconWrapper>
              Share Link
            </ActionButton>
            <ActionButton>
              <IconWrapper><FaUserFriends /></IconWrapper>
              Invite Friends
            </ActionButton>
          </ButtonGroup>
        </ReferralLinkCard>

        {/* Earnings Card */}
        <EarningsCard>
          <CardTitle>Total Earnings From Referrals</CardTitle>
          <EarningsAmount>
            <FaUserFriends />
            ${totalReferralEarnings.toFixed(2)}
          </EarningsAmount>
        </EarningsCard>

        {/* Referrals Card */}
        <ReferralsCard>
          <CardTitle>People Joined Using Your Link</CardTitle>
          <StatValue>
            <FaUserFriends />
            {referrals.length}
          </StatValue>
          
          {loading ? (
            <EmptyState>Loading friends list...</EmptyState>
          ) : referrals.length === 0 ? (
            <EmptyState>
              <div style={{ marginBottom: '8px' }}>No friends joined yet</div>
              <p style={{ fontSize: '0.9rem' }}>Invite friends to start earning</p>
            </EmptyState>
          ) : (
            <ReferralList>
              {referrals.map((user, index) => (
                <ReferralItem key={index}>
                  <Avatar color={getRandomColor()}>
                    {getInitials(user.fullName || user.username || "N/A")}
                  </Avatar>
                  <ReferralInfo>
                    <ReferralName>{user.username || "Anonymous"}</ReferralName>
                  </ReferralInfo>
                  <ReferralBonus>
                    ${((user.refBonus || 0) * 0.01).toFixed(2)}
                  </ReferralBonus>
                </ReferralItem>
              ))}
            </ReferralList>
          )}
        </ReferralsCard>
      </Content>
      
      {/* Share Modal */}
      {showShareModal && (
        <ShareModal onClick={() => setShowShareModal(false)}>
          <ShareContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ShareTitle>Share via</ShareTitle>
              <button 
                onClick={() => setShowShareModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <FaTimes size={20} color={berryTheme.colors.grey500} />
              </button>
            </ModalHeader>
            <ShareOptions>
              <ShareOption onClick={() => shareOnSocialMedia("facebook")}>
                <ShareIcon><FaFacebook /></ShareIcon>
                <ShareLabel>Facebook</ShareLabel>
              </ShareOption>
              <ShareOption onClick={() => shareOnSocialMedia("whatsapp")}>
                <ShareIcon><FaWhatsapp /></ShareIcon>
                <ShareLabel>WhatsApp</ShareLabel>
              </ShareOption>
              <ShareOption onClick={() => shareOnSocialMedia("telegram")}>
                <ShareIcon><FaTelegram /></ShareIcon>
                <ShareLabel>Telegram</ShareLabel>
              </ShareOption>
              <ShareOption onClick={() => shareOnSocialMedia("twitter")}>
                <ShareIcon><FaTwitter /></ShareIcon>
                <ShareLabel>Twitter</ShareLabel>
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