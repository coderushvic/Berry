import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { berryTheme } from '../../Theme';
import { 
  FaUsers, 
  FaAd, 
  FaVideo, 
  FaMoneyBillWave,
  FaCopy,
  FaShareAlt,
  FaCalendarDay
} from 'react-icons/fa';
import NavBar from './NavBar';
import { useUser } from '../../context/userContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firestore';

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

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
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

  @media (max-width: 480px) {
    flex-direction: column;
  }
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

  &:disabled {
    background: ${berryTheme.colors.grey300};
    cursor: not-allowed;
  }
`;

const IconWrapper = styled.span`
  margin-right: 8px;
  font-size: 1.1rem;
`;

const ProgressContainer = styled.div`
  width: 100%;
  height: 6px;
  background: ${berryTheme.colors.grey100};
  border-radius: 3px;
  overflow: hidden;
  margin: 8px 0;
`;

const ProgressBar = styled.div`
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, 
    ${berryTheme.colors.primary} 0%, 
    ${berryTheme.colors.secondary} 100%);
  width: ${props => props.$progress}%;
  transition: width 0.5s ease;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
`;

const ProfilePage = () => {
  const [copied, setCopied] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isTelegram, setIsTelegram] = useState(false);
  const [adsWatchedToday, setAdsWatchedToday] = useState(0);
  const [totalAdsWatched, setTotalAdsWatched] = useState(0);
  const {
    id = '',
    fullName = '',
    username = '',
    videoWatched = 0,
    processedReferrals = [],
    adsBalance = 0,
    dollarBalance2 = 0,
    checkinRewards = 0,
    refBonus = 0,
    walletAddress = '',
    isPremium,
    adsConfig
  } = useUser();

  useEffect(() => {
    // Check if running in Telegram WebApp
    if (window.Telegram?.WebApp?.initDataUnsafe) {
      setIsTelegram(true);
      const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
      if (telegramUser?.photo_url) {
        setProfileImage(`${telegramUser.photo_url}?size=large`);
      }
    }

    // Load ads watched data
    const loadAdsData = async () => {
      if (!id) return;
      
      try {
        const userDoc = await getDoc(doc(db, "telegramUsers", id));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setAdsWatchedToday(data.dailyAdsWatched || 0);
          setTotalAdsWatched(data.adsWatched || 0);
        }
      } catch (error) {
        console.error("Error loading ads data:", error);
      }
    };

    loadAdsData();
  }, [id]);

  // Calculate stats
  const referralCount = processedReferrals?.length || 0;
  
  // Calculate total balance as sum of all earnings
  const totalBalance = parseFloat(adsBalance) + 
                      parseFloat(dollarBalance2) + 
                      parseFloat(checkinRewards) + 
                      parseFloat(refBonus);

  // Calculate daily progress
  const dailyLimit = isPremium ? adsConfig?.premiumDailyLimit || 100 : adsConfig?.dailyLimit || 50;
  const dailyProgress = Math.min(100, (adsWatchedToday / dailyLimit) * 100);

  const copyUserId = () => {
    if (id) {
      navigator.clipboard.writeText(id).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy ID:', err);
      });
    }
  };

  const shareProfile = async () => {
    const shareText = `Join me on Berry! Use my referral ID: ${id}`;
    const shareUrl = `${window.location.origin}?ref=${id}`;

    try {
      if (isTelegram && window.Telegram.WebApp.share) {
        window.Telegram.WebApp.share(shareText);
      } else if (navigator.share) {
        await navigator.share({
          title: 'Berry App',
          text: shareText,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Referral link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Referral link copied to clipboard!');
      } catch (copyErr) {
        console.error('Failed to copy:', copyErr);
      }
    }
  };

  const getAvatarUrl = () => {
    if (profileImage) return profileImage;
    const name = fullName || username || 'U';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  };

  const getDisplayName = () => {
    if (fullName) return fullName;
    if (username) return username;
    return 'Berry User';
  };

  const getTruncatedWallet = () => {
    if (!walletAddress || walletAddress.length < 10) return null;
    return `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;
  };

  return (
    <AppContainer>
      <Header>
        <LogoImage src='/Berry.png' alt="Berry Logo" />
        <LogoText>berry</LogoText>
      </Header>
      
      <Content>
        <ProfileCard $borderColor={berryTheme.colors.primaryDark}>
          <AvatarImage 
            src={getAvatarUrl()} 
            alt={getDisplayName()}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName().charAt(0))}&background=random`;
            }}
          />
          <UserName>{getDisplayName()}</UserName>
          {id && <UserId>ID: {id}</UserId>}
          {walletAddress && (
            <UserId style={{ marginTop: '-8px', fontSize: '0.8rem' }}>
              Wallet: {getTruncatedWallet()}
            </UserId>
          )}
          
          <ButtonGroup>
            <ActionButton 
              onClick={copyUserId} 
              $copied={copied}
              disabled={!id}
            >
              <IconWrapper>
                {copied ? '✓' : <FaCopy />}
              </IconWrapper>
              {copied ? 'Copied' : 'Copy ID'}
            </ActionButton>
            
            <ActionButton 
              onClick={shareProfile}
              disabled={!id}
            >
              <IconWrapper>
                <FaShareAlt />
              </IconWrapper>
              Share
            </ActionButton>
          </ButtonGroup>
        </ProfileCard>

        <StatCard $borderColor="#7367F0">
          <StatValue>
            <FaMoneyBillWave />
            ${totalBalance.toFixed(2)}
          </StatValue>
          <StatLabel>Total Earnings</StatLabel>
        </StatCard>

        <StatCard $borderColor="#FF9F43">
          <StatValue>
            <FaUsers />
            {referralCount}
          </StatValue>
          <StatLabel>Referrals</StatLabel>
        </StatCard>

        <StatCard $borderColor="#EA5455">
          <StatValue>
            <FaAd />
            {totalAdsWatched}
          </StatValue>
          <StatLabel>
            <StatRow>
              <StatItem>
                <FaCalendarDay />
                <span>Today: {adsWatchedToday}/{dailyLimit}</span>
              </StatItem>
              <span>{Math.round(dailyProgress)}%</span>
            </StatRow>
            <ProgressContainer>
              <ProgressBar $progress={dailyProgress} />
            </ProgressContainer>
            <StatRow>
              <StatItem>
                <FaAd />
                <span>Total Ads</span>
              </StatItem>
              <span>{totalAdsWatched}</span>
            </StatRow>
          </StatLabel>
        </StatCard>

        <StatCard $borderColor="#00CFE8">
          <StatValue>
            <FaVideo />
            {videoWatched}
          </StatValue>
          <StatLabel>Videos Watched</StatLabel>
        </StatCard>
      </Content>
      
      <NavBar />
    </AppContainer>
  );
};

export default ProfilePage;
