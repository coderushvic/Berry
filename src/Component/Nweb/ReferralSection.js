import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { berryTheme } from '../../Theme';
import { FaUserFriends, FaLink, FaCopy, FaShareAlt, FaFacebook, FaWhatsapp, FaTelegram, FaTwitter, FaTimes } from 'react-icons/fa';
import { useUser } from "../../context/userContext";

// Animation for shimmer effect
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const Section = styled.section`
  margin-bottom: ${berryTheme.spacing.large};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${berryTheme.spacing.medium};
`;

const Title = styled.h3`
  color: ${berryTheme.colors.primary};
  font-size: 1.2rem;
  margin: 0 0 0 ${berryTheme.spacing.small};
`;

const ReferralIcon = styled(FaUserFriends)`
  color: ${berryTheme.colors.primary};
  font-size: 1.4rem;
`;

const Card = styled.div`
  background: ${berryTheme.colors.cardBackground};
  border-radius: 16px;
  padding: 24px;
  box-shadow: ${berryTheme.shadows.small};
  border-top: 4px solid ${berryTheme.colors.primaryLight};
  position: relative;
  overflow: hidden;
`;

const Description = styled.p`
  color: ${berryTheme.colors.textDark};
  margin-bottom: ${berryTheme.spacing.large};
  line-height: 1.5;
  text-align: center;
`;

const InviteLink = styled.div`
  background: white;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 20px;
  border: 1px solid ${berryTheme.colors.grey300};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LinkText = styled.span`
  font-weight: 600;
  color: ${berryTheme.colors.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Button = styled.button`
  background: ${props => props.$copied ? '#4CAF50' : berryTheme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  width: 100%;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
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
`;

const CopyButton = styled.button`
  background: ${berryTheme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  margin-left: 12px;
  
  &:hover {
    background: ${berryTheme.colors.primaryDark};
  }
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

function ReferralSection() {
  const { id, referrals = [] } = useUser();
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const referralLink = `https://t.me/Fuhdhdbot?start=r${id}`;

  const copyToClipboard = () => {
    const shareText = "Join me on Berry App and earn rewards together!";
    const fullText = `${shareText} ${referralLink}`;
    
    navigator.clipboard.writeText(fullText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy text: ", err));
  };

  const shareOnSocialMedia = (platform) => {
    const shareText = "Join me on Berry App and earn rewards together!";
    let url = "";

    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${referralLink}`)}`;
        break;
      case "telegram":
        url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${referralLink}`)}`;
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
    <Section>
      <Header>
        <ReferralIcon />
        <Title>Refer & Earn</Title>
      </Header>
      <Card>
        <Description>
          Share your invite link & get $10 bonus when friends complete their first task.
          {referrals.length > 0 && ` ${referrals.length} friends joined so far!`}
        </Description>
        <InviteLink>
          <LinkText>
            <FaLink color={berryTheme.colors.primary} />
            {referralLink}
          </LinkText>
          <CopyButton onClick={copyToClipboard}>
            {copied ? 'Copied!' : <FaCopy size={14} />}
          </CopyButton>
        </InviteLink>
        <ButtonGroup>
          <Button onClick={copyToClipboard} $copied={copied}>
            <IconWrapper><FaCopy /></IconWrapper>
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          <Button onClick={() => setShowShareModal(true)}>
            <IconWrapper><FaShareAlt /></IconWrapper>
            Share Link
          </Button>
        </ButtonGroup>
      </Card>

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
    </Section>
  );
}

export default ReferralSection;