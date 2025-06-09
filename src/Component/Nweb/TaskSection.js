import React from 'react';
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

function TaskSection() {
  const navigate = useNavigate();
  const { userData } = useUser();

  // Calculate remaining ads from user data (same logic as AdTask)
  const dailyLimit = 50; // Default from your AdTask component
  const adsWatchedToday = userData?.dailyAdsWatched?.[new Date().toISOString().split('T')[0]] || 0;
  const remainingAds = dailyLimit - adsWatchedToday;

  const tasks = [
    { 
      icon: <FaGem />, 
      name: 'Daily Bonus', 
      reward: '$5',
      accentColor: '#FF9F43',
      iconColor: '#FF9F43',
      path: '/daily-bonus'
    },
    { 
      icon: <FaGamepad />, 
      name: 'Play Games', 
      reward: '$2/hr',
      accentColor: '#7367F0',
      iconColor: '#7367F0',
      path: '/play-games'
    },
    { 
      icon: <FaAd />, 
      name: 'Watch Ads', 
      reward: '$1/ad',
      accentColor: '#28C76F',
      iconColor: '#28C76F',
      path: '/ads',
      showBadge: true,
      badgeCount: remainingAds
    },
  ];

  const handleTaskClick = (path) => {
    navigate(path);
  };
  
  return (
    <Section>
      <Header>
        <TaskIcon>🎯</TaskIcon>
        <Title>Earn Money</Title>
      </Header>
      <TaskGrid>
        {tasks.map((task, index) => (
          <TaskCard 
            key={index} 
            $accentColor={task.accentColor}
            onClick={() => handleTaskClick(task.path)}
          >
            {task.showBadge && task.badgeCount > 0 && (
              <AdsBadge>
                {task.badgeCount > 9 ? '9+' : task.badgeCount}
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