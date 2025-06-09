import React, { useState } from 'react';
import styled from 'styled-components';
import { berryTheme } from '../../Theme';
import { 
  FaUsers, 
  FaAd, 
  FaVideo, 
  FaMoneyBillWave,
  FaCopy,
  FaShareAlt
} from 'react-icons/fa';
import NavBar from './NavBar';

// Styled Components
const AppContainer = styled.div`
  font-family: ${berryTheme.fonts.main};
  background: ${berryTheme.colors.backgroundGradient};
  min-height: 100vh;
  position: relative;
  padding-bottom: 80px;
`;

const Content = styled.div`
  padding: ${berryTheme.spacing.medium};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
`;

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

const Card = styled.div`
  background: ${berryTheme.colors.cardBackground};
  border-radius: 16px;
  padding: 24px;
  box-shadow: ${berryTheme.shadows.small};
  border-top: 4px solid ${props => props.$borderColor || berryTheme.colors.primary};
`;

const ProfileCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  grid-column: 1 / -1;
`;

const StatCard = styled(Card)`
  text-align: center;
`;

const AvatarImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-bottom: 16px;
`;

const UserName = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 8px 0;
  color: ${berryTheme.colors.primaryDark};
`;

const UserId = styled.div`
  background: ${berryTheme.colors.primaryLight}20;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  color: ${berryTheme.colors.textDark};
  margin-bottom: 16px;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${berryTheme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${berryTheme.colors.textDark};
  margin-top: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
  margin-top: 16px;
`;

const ActionButton = styled.button`
  background: ${props => props.$copied ? '#4CAF50' : berryTheme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  
  &:hover {
    background: ${props => props.$copied ? '#4CAF50' : berryTheme.colors.primaryDark};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(227, 11, 92, 0.3);
  }
`;

const IconWrapper = styled.span`
  margin-right: 8px;
  font-size: 1.1rem;
`;

const ProfilePage = () => {
  const [copied, setCopied] = useState(false);

  // User data
  const user = {
    id: "USR-78945612",
    name: "Alex Johnson",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    stats: {
      referrals: 24,
      adsWatched: 156,
      videosWatched: 89,
      totalRevenue: "$428.50"
    }
  };

  const copyUserId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppContainer>
      <Header>
        <LogoImage src='/Berry.png' alt="Berry Logo" />
        <LogoText>berry</LogoText>
      </Header>
      
      <Content>
        {/* Profile Card - full width */}
        <ProfileCard $borderColor={berryTheme.colors.primaryDark}>
          <AvatarImage 
            src={user.image} 
            alt={user.name}
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = "https://via.placeholder.com/100";
            }}
          />
          <UserName>{user.name}</UserName>
          <UserId>ID: {user.id}</UserId>
          
          <ButtonGroup>
            <ActionButton onClick={copyUserId} $copied={copied}>
              <IconWrapper>
                {copied ? '✓' : <FaCopy />}
              </IconWrapper>
              {copied ? 'Copied' : 'Copy ID'}
            </ActionButton>
            
            <ActionButton>
              <IconWrapper>
                <FaShareAlt />
              </IconWrapper>
              Share
            </ActionButton>
          </ButtonGroup>
        </ProfileCard>

        {/* Stats Cards - in grid layout */}
        <StatCard $borderColor="#7367F0">
          <StatValue>
            <FaMoneyBillWave />
            {user.stats.totalRevenue}
          </StatValue>
          <StatLabel>Total Revenue</StatLabel>
        </StatCard>

        <StatCard $borderColor="#FF9F43">
          <StatValue>
            <FaUsers />
            {user.stats.referrals}
          </StatValue>
          <StatLabel>Referrals</StatLabel>
        </StatCard>

        <StatCard $borderColor="#EA5455">
          <StatValue>
            <FaAd />
            {user.stats.adsWatched}
          </StatValue>
          <StatLabel>Ads Watched</StatLabel>
        </StatCard>

        <StatCard $borderColor="#00CFE8">
          <StatValue>
            <FaVideo />
            {user.stats.videosWatched}
          </StatValue>
          <StatLabel>Videos Watched</StatLabel>
        </StatCard>
      </Content>
      
      <NavBar />
    </AppContainer>
  );
};

export default ProfilePage;