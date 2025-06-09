import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { berryTheme } from '../../Theme';
import { FaUserFriends, FaLink, FaCopy, FaShareAlt } from 'react-icons/fa';

// Animation for shimmer effect (from Referrals)
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

// Updated Card to match Referrals style
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

// Updated InviteLink to match Referrals style
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

// Updated Button to match Referrals style
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

// Copy button
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

function ReferralSection() {
  const [copied, setCopied] = useState(false);
  const referralLink = 'berryapp.com/invite/berry-friend';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <Button>
            <IconWrapper><FaShareAlt /></IconWrapper>
            Share Link
          </Button>
        </ButtonGroup>
      </Card>
    </Section>
  );
}

export default ReferralSection;