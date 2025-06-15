import React, { useMemo } from 'react';
import styled from 'styled-components';
import { berryTheme } from '../../Theme';
import { FaGem, FaGamepad, FaAd } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/userContext';

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

const TaskIcon = styled.span`
  color: ${berryTheme.colors.primary};
  font-size: 1.4rem;
`;

const TaskGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: ${berryTheme.spacing.medium};
`;

const TaskCard = styled.div`
  background: ${berryTheme.colors.cardBackground};
  border-radius: ${berryTheme.borderRadius.medium};
  padding: ${berryTheme.spacing.medium};
  box-shadow: ${berryTheme.colors.shadow};
  text-align: center;
  transition: all ${berryTheme.transitions.fast};
  position: relative;
  overflow: hidden;
  cursor: pointer;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.$accentColor || berryTheme.colors.primary};
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const TaskIconWrapper = styled.div`
  width: 50px;
  height: 50px;
  background: ${berryTheme.colors.primaryLight}20;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${berryTheme.spacing.small};
  color: ${props => props.$iconColor || berryTheme.colors.primary};
  font-size: 1.5rem;
  transition: all ${berryTheme.transitions.fast};
`;

const TaskName = styled.div`
  font-weight: 600;
  margin-bottom: ${berryTheme.spacing.small};
  color: ${berryTheme.colors.textDark};
`;

const TaskReward = styled.div`
  color: ${berryTheme.colors.secondary};
  font-size: 0.9rem;
  font-weight: 600;
  background: ${berryTheme.colors.primaryLight}15;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-block;
`;

const AdsBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: ${berryTheme.colors.primary};
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: ${berryTheme.colors.textLight};
  padding: ${berryTheme.spacing.large} 0;
`;

function TaskSection() {
  const navigate = useNavigate();
  const { 
    adsWatched, 
    userData, 
    loading, 
    adsConfig = {
      dailyLimit: 50,
      premiumDailyLimit: 100
    }, 
    isPremium 
  } = useUser();

  // Calculate remaining ads with all safeguards
  const { remainingAds, dailyLimit } = useMemo(() => {
    if (loading || !userData) return { remainingAds: null, dailyLimit: null };
    
    const today = new Date().toISOString().split('T')[0];
    const dailyWatched = userData.dailyAdsWatched?.[today] || 0;
    const limit = isPremium ? adsConfig.premiumDailyLimit : adsConfig.dailyLimit;
    const remaining = Math.max(0, limit - dailyWatched);
    
    return { 
      remainingAds: remaining, 
      dailyLimit: limit 
    };
  }, [adsWatched, userData, loading, adsConfig, isPremium]);

  // Memoize tasks configuration
  const tasks = useMemo(() => [
    { 
      icon: <FaGem />, 
      name: 'Daily Bonus', 
      reward: '$5',
      accentColor: '#FF9F43',
      iconColor: '#FF9F43',
      path: '/DailyReward'
    },
    { 
      icon: <FaGamepad />, 
      name: 'Play Games', 
      reward: '$',
      accentColor: '#7367F0',
      iconColor: '#7367F0',
      path: '/GameComponent'
    },
    { 
      icon: <FaAd />, 
      name: 'Watch Ads', 
      reward: '$1/ad',
      accentColor: '#28C76F',
      iconColor: '#28C76F',
      path: '/AdsPage',
      showBadge: true,
      badgeCount: remainingAds !== null ? remainingAds : 0,
      dailyLimit: dailyLimit !== null ? dailyLimit : (isPremium ? 100 : 50) // Fallback to default values
    },
  ], [remainingAds, dailyLimit, isPremium]);

  const handleTaskClick = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <Section>
        <Header>
          <TaskIcon>🎯</TaskIcon>
          <Title>Earn Money</Title>
        </Header>
        <LoadingMessage>Loading tasks...</LoadingMessage>
      </Section>
    );
  }

  return (
    <Section>
      <Header>
        <TaskIcon>🎯</TaskIcon>
        <Title>Earn Money</Title>
      </Header>
      <TaskGrid>
        {tasks.map((task, index) => (
          <TaskCard 
            key={`task-${index}`}
            $accentColor={task.accentColor}
            onClick={() => handleTaskClick(task.path)}
            aria-label={`${task.name} task`}
          >
            {task.showBadge && task.badgeCount > 0 && (
              <AdsBadge aria-label={`${task.badgeCount} ads remaining`}>
                {task.badgeCount}
              </AdsBadge>
            )}
            <TaskIconWrapper $iconColor={task.iconColor}>
              {task.icon}
            </TaskIconWrapper>
            <TaskName>{task.name}</TaskName>
            <TaskReward>{task.reward}</TaskReward>
          </TaskCard>
        ))}
      </TaskGrid>
    </Section>
  );
}

export default TaskSection;
