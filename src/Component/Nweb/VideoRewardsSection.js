import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { berryTheme } from '../../Theme';
import { FaPlay, FaDollarSign } from 'react-icons/fa';

// Modern animations
const pulse = keyframes`
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
`;

const Section = styled.section`
  margin-bottom: 3rem;
  padding: 1rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  color: ${berryTheme.colors.primary};
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  background: linear-gradient(to right, #FF8A80, #E30B5C);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  color: ${berryTheme.colors.textMuted};
  font-size: 1.1rem;
  max-width: auto;
  margin: 0 auto;
`;

const VideoCard = styled.div`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  max-width: 600px;
  margin: 0 auto;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  }
`;

const VideoContainer = styled.div`
  height: 150px;
  background: linear-gradient(135deg, #FF6B8B, #E30B5C);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const PlayButton = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${berryTheme.colors.primary};
  font-size: 28px;
  transition: all 0.3s ease;
  animation: ${pulse} 2s infinite;
  
  ${VideoCard}:hover & {
    transform: scale(1.1);
    background: white;
  }
`;

const RewardTag = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  font-weight: 700;
  color: ${berryTheme.colors.primary};
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  
  svg {
    margin-right: 8px;
    color: #28C76F;
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
  text-align: center;
`;

const CardTitle = styled.h3`
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
  color: ${berryTheme.colors.textDark};
`;

const CardText = styled.p`
  color: ${berryTheme.colors.textMuted};
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const ActionButton = styled.button`
  background: linear-gradient(to right, #FF8A80, #E30B5C);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  display: block;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(227, 11, 92, 0.3);
  }
`;

function VideoRewardsSection() {
  const navigate = useNavigate();

  const handleWatchVideo = (e) => {
    e.stopPropagation();
    navigate('/VideoWatchPage');
  };

  const handleCardClick = () => {
    navigate('/VideoWatchPage');
  };

  return (
    <Section>
      <Header>
        <Title>Watch Videos, Earn Cash</Title>
        <Subtitle>
          Get rewarded instantly for watching interesting content. 
          The more you watch, the more you earn!
        </Subtitle>
      </Header>

      <VideoCard onClick={handleCardClick}>
        <VideoContainer>
          <PlayButton>
            <FaPlay />
          </PlayButton>
          <RewardTag>
            <FaDollarSign /> $1.00
          </RewardTag>
        </VideoContainer>
        
        <CardContent>
          <CardTitle>Premium Video Content</CardTitle>
          <CardText>
            Watch this 2-minute video and earn $1.00 instantly. 
            Complete 5 videos to unlock bonus rewards!
          </CardText>
          <ActionButton onClick={handleWatchVideo}>
            Start Watching Now
          </ActionButton>
        </CardContent>
      </VideoCard>
    </Section>
  );
}

export default VideoRewardsSection;
