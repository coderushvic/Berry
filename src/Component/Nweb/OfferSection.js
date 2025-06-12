import React from 'react';
import styled, { keyframes } from 'styled-components';
import { berryTheme } from '../../Theme';
import { FaDownload, FaCoins } from 'react-icons/fa';

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

const OfferIcon = styled(FaCoins)`
  color: ${berryTheme.colors.primary};
  font-size: 1.4rem;
`;

const Subtitle = styled.p`
  color: ${berryTheme.colors.textDark};
  font-weight: 500;
  margin-bottom: ${berryTheme.spacing.medium};
  padding-left: ${berryTheme.spacing.xlarge};
`;

const OfferList = styled.div``;

// Updated OfferCard to match Referrals card style
const OfferCard = styled.div`
  background: ${berryTheme.colors.cardBackground};
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: ${berryTheme.shadows.small};
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  border-top: 4px solid ${berryTheme.colors.secondary};
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${berryTheme.shadows.medium};
  }
`;

const OfferLogo = styled.div`
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const OfferContent = styled.div`
  flex: 1;
`;

const OfferName = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  color: ${berryTheme.colors.textDark};
`;

const OfferDescription = styled.div`
  color: ${berryTheme.colors.textMuted};
  font-size: 0.9rem;
`;

// Updated InstallButton to match Referrals button style
const InstallButton = styled.button`
  background: ${berryTheme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-width: 100px;
  justify-content: center;
  
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

const DownloadIcon = styled(FaDownload)`
  margin-right: 8px;
  font-size: 0.9rem;
`;

function OfferSection() {
  const offers = [
    { name: 'Binance', reward: '$20', logo: '🅱️' },
    { name: 'Octafax', reward: '$15', logo: '🅾️' },
    { name: 'Toonkeeper', reward: '$10', logo: '✏️' },
  ];
  
  return (
    <Section>
      <Header>
        <OfferIcon />
        <Title>Today's Top Offers</Title>
      </Header>
      <Subtitle>Install apps & earn cash rewards</Subtitle>
      <OfferList>
        {offers.map((offer, index) => (
          <OfferCard key={index}>
            <OfferLogo>{offer.logo}</OfferLogo>
            <OfferContent>
              <OfferName>{offer.name}</OfferName>
              <OfferDescription>Get {offer.reward} reward</OfferDescription>
            </OfferContent>
            <InstallButton>
              <DownloadIcon />
              Install
            </InstallButton>
          </OfferCard>
        ))}
      </OfferList>
    </Section>
  );
}

export default OfferSection;