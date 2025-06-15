import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { berryTheme } from '../../Theme';
import { FaArrowRight, FaCheckCircle, FaDollarSign } from 'react-icons/fa';
import NavBar from '../Nweb/NavBar';
import { useUser } from '../../context/userContext';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const popIn = keyframes`
  0% { transform: scale(0.5); opacity: 0; }
  80% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
`;

// Styled Components
const Container = styled.div`
  font-family: ${berryTheme.fonts.main};
  background: ${berryTheme.colors.backgroundGradient};
  min-height: 100vh;
  position: relative;
  padding-bottom: 80px;
  overflow: hidden;
`;

const ConfettiOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  background: rgba(0,0,0,0.7);
  animation: ${fadeIn} 0.3s ease;
`;

const Confetti = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
`;

const RewardMessage = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
  z-index: 1001;
  background: linear-gradient(45deg, #FF8A00, #E52E71);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  padding: 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const OkButton = styled.button`
  background: white;
  color: ${berryTheme.colors.primary};
  border: none;
  border-radius: 25px;
  padding: 12px 30px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  z-index: 1001;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
  }
`;

const RewardPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease;
`;

const PopupContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  animation: ${popIn} 0.4s ease;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
`;

const PopupTitle = styled.h2`
  color: ${berryTheme.colors.primaryDark};
  margin: 15px 0 10px;
  font-size: 1.8rem;
`;

const PopupText = styled.p`
  color: ${berryTheme.colors.textSecondary};
  font-size: 1.1rem;
  margin-bottom: 25px;
  line-height: 1.6;
  padding: 0 15px;
  
  strong {
    color: ${berryTheme.colors.primary};
    font-weight: 700;
    font-size: 1.2rem;
  }
`;

const ClaimButton = styled.button`
  background: linear-gradient(45deg, #4CAF50, #2E7D32);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 auto;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  width: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(76, 175, 80, 0.4);
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
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

const Content = styled.div`
  padding: ${berryTheme.spacing.medium};
  max-width: 800px;
  margin: 0 auto;
`;

const BalanceCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  margin-bottom: 25px;
  text-align: center;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  background: rgba(255,255,255,0.9);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 60%;
    height: 100%;
    background: linear-gradient(45deg, rgba(255,138,128,0.1), rgba(227,11,92,0.05));
    z-index: 0;
  }
`;

const BalanceLabel = styled.div`
  font-size: 1rem;
  color: ${berryTheme.colors.textSecondary};
  margin-bottom: 5px;
`;

const BalanceAmount = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${berryTheme.colors.primaryDark};
  margin: 10px 0;
  position: relative;
  z-index: 1;
  background: linear-gradient(45deg, #FF8A00, #E52E71);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const RewardNotification = styled.div`
  font-size: 1rem;
  color: #28C76F;
  font-weight: 700;
  background: rgba(40, 199, 111, 0.1);
  padding: 8px 15px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;

const VideoContainer = styled.div`
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.1);
  margin-bottom: 25px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  background: rgba(255,255,255,0.9);
`;

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
`;

const YouTubeIframe = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
`;

const VideoTitle = styled.h2`
  font-size: 1.4rem;
  color: ${berryTheme.colors.textDark};
  margin-bottom: 15px;
  text-align: center;
  font-weight: 700;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${berryTheme.colors.grey200};
  border-radius: 4px;
  margin-top: 15px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  width: ${props => props.$progress}%;
  height: 100%;
  background: linear-gradient(90deg, #FF8A00, #E52E71);
  transition: width 1s linear;
  border-radius: 4px;
`;

const QualifiedMarker = styled.div`
  position: absolute;
  left: ${props => props.$position}%;
  top: 0;
  width: 4px;
  height: 100%;
  background: #4CAF50;
  transform: translateX(-2px);
  z-index: 2;

  &::after {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    width: 14px;
    height: 14px;
    background: #4CAF50;
    border-radius: 50%;
    border: 2px solid white;
  }
`;

const QualifiedTooltip = styled.div`
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: #4CAF50;
  color: white;
  padding: 5px 10px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${QualifiedMarker}:hover & {
    opacity: 1;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #4CAF50;
  }
`;

const VideoControls = styled.div`
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const TimeDisplay = styled.div`
  font-size: 1rem;
  color: ${berryTheme.colors.textSecondary};
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const QualifyText = styled.span`
  font-size: 0.9rem;
  color: ${props => props.$claimed ? '#4CAF50' : '#FF8A00'};
  font-weight: 600;
`;

const NextButton = styled.button`
  background: linear-gradient(45deg, #FF8A00, #E52E71);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 25px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(229, 46, 113, 0.3);
  margin: 0 auto;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(229, 46, 113, 0.4);
  }
`;

const Instructions = styled.div`
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  background: rgba(255,255,255,0.9);
  
  h3 {
    color: ${berryTheme.colors.primaryDark};
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 1.3rem;
  }
  
  ul {
    padding-left: 25px;
    margin: 0;
  }
  
  li {
    margin-bottom: 10px;
    color: ${berryTheme.colors.textSecondary};
    line-height: 1.6;
  }
`;

const NextVideoPrompt = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  animation: ${fadeIn} 0.3s ease;
`;

const PromptContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  animation: ${popIn} 0.4s ease;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
`;

const PromptTitle = styled.h2`
  color: ${berryTheme.colors.primaryDark};
  margin: 15px 0 10px;
  font-size: 1.8rem;
`;

const PromptText = styled.p`
  color: ${berryTheme.colors.textSecondary};
  font-size: 1.1rem;
  margin-bottom: 25px;
  line-height: 1.5;
`;

const PromptButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PromptButton = styled.button`
  background: ${({ $accept }) => $accept 
    ? 'linear-gradient(45deg, #4CAF50, #2E7D32)' 
    : 'rgba(0,0,0,0.1)'};
  color: ${({ $accept }) => $accept ? 'white' : berryTheme.colors.textDark};
  border: none;
  border-radius: 25px;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${({ $accept }) => $accept 
    ? '0 4px 15px rgba(76, 175, 80, 0.3)' 
    : 'none'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ $accept }) => $accept 
      ? '0 8px 20px rgba(76, 175, 80, 0.4)' 
      : '0 4px 15px rgba(0,0,0,0.1)'};
  }
`;

const VideoWatchPage = () => {
  const { dollarBalance2, watchVideo } = useUser();
  
  // State management
  const [currentVideo, setCurrentVideo] = useState(null);
  const [watchedTime, setWatchedTime] = useState(0);
  const [hasQualified, setHasQualified] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [rewardEarned, setRewardEarned] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [showNextPrompt, setShowNextPrompt] = useState(false);

  const timerRef = useRef(null);
  const confettiTimeoutRef = useRef(null);
  const hasQualifiedRef = useRef();
  hasQualifiedRef.current = hasQualified;

  // Memoized videos data
  const mockVideos = useMemo(() => [
    {
      id: 'vid1',
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Premium Content',
      duration: 30,
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
    },
    {
      id: 'vid2',
      youtubeId: 'JGwWNGJdvx8',
      title: 'Special Bonus',
      duration: 45,
      thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg'
    }
  ], []);

  // Load initial video
  useEffect(() => {
    if (mockVideos.length > 0) {
      setCurrentVideo(mockVideos[0]);
    }
  }, [mockVideos]);

  // Timer logic
  useEffect(() => {
    if (!currentVideo) return;

    // Reset state for new video
    setWatchedTime(0);
    setHasQualified(false);
    setHasClaimed(false);
    setVideoEnded(false);
    setShowNextPrompt(false);

    timerRef.current = setInterval(() => {
      setWatchedTime(prev => {
        const newTime = prev + 1;
        
        // Check if qualified for reward (15 seconds)
        if (newTime >= 15 && !hasQualifiedRef.current) {
          setHasQualified(true);
        }

        // Check if video ended
        if (newTime >= currentVideo.duration) {
          clearInterval(timerRef.current);
          setVideoEnded(true);
          setShowNextPrompt(true);
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentVideo]);

  // Claim reward function - fixed version
  const handleClaimReward = async (e) => {
    e.stopPropagation();
    
    if (!hasQualified || hasClaimed) return;

    try {
      const result = await watchVideo(1.00);
      
      if (result?.success) {
        setRewardEarned(1.00);
        setHasClaimed(true);
        setShowConfetti(true);
        
        confettiTimeoutRef.current = setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
      } else {
        throw new Error(result?.error || 'Failed to claim reward');
      }
    } catch (err) {
      console.error('Error claiming reward:', err);
    }
  };

  // Next video handler
  const handleNextVideo = () => {
    if (!currentVideo) return;
    
    const currentIndex = mockVideos.findIndex(v => v.id === currentVideo.id);
    const nextIndex = (currentIndex + 1) % mockVideos.length;
    
    setCurrentVideo(mockVideos[nextIndex]);
    setShowNextPrompt(false);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(confettiTimeoutRef.current);
    };
  }, []);

  if (!currentVideo) return (
    <Container>
      <Header>
        <LogoImage src='/Berry.png' alt="Berry Logo" />
        <LogoText>berry</LogoText>
      </Header>
      <Content>
        <p>Loading videos...</p>
      </Content>
      <NavBar />
    </Container>
  );

  return (
    <Container>
      {/* Confetti Celebration */}
      {showConfetti && (
        <ConfettiOverlay>
          <Confetti src="/celebrating.gif" alt="Confetti celebration" />
          <RewardMessage>
            <FaDollarSign /> +1.00 Added to Your Balance!
          </RewardMessage>
          <OkButton onClick={() => setShowConfetti(false)}>OK</OkButton>
        </ConfettiOverlay>
      )}

      {/* Reward Popup */}
      {hasQualified && !hasClaimed && (
        <RewardPopup onClick={() => setShowNextPrompt(false)}>
          <PopupContent onClick={(e) => e.stopPropagation()}>
            <FaCheckCircle size={60} color="#4CAF50" />
            <PopupTitle>Reward Available!</PopupTitle>
            <PopupText>
              You've watched <strong>15 seconds</strong> and earned <strong>$1.00</strong>!
              <br /><br />
              Click the button below to claim your reward.
            </PopupText>
            <ClaimButton 
              onClick={handleClaimReward}
              disabled={hasClaimed}
            >
              {hasClaimed ? 'Reward Claimed' : 'Claim $1.00 Reward'}
            </ClaimButton>
          </PopupContent>
        </RewardPopup>
      )}

      {/* Next Video Prompt */}
      {showNextPrompt && (
        <NextVideoPrompt>
          <PromptContent>
            <PromptTitle>Continue Watching?</PromptTitle>
            <PromptText>
              You've completed this video. Watch another to earn more rewards!
            </PromptText>
            <PromptButtons>
              <PromptButton $accept onClick={handleNextVideo}>
                Watch Next Video
              </PromptButton>
              <PromptButton onClick={() => setShowNextPrompt(false)}>
                Not Now
              </PromptButton>
            </PromptButtons>
          </PromptContent>
        </NextVideoPrompt>
      )}

      {/* Main Content */}
      <Header>
        <LogoImage src='/Berry.png' alt="Berry Logo" />
        <LogoText>berry</LogoText>
      </Header>
      
      <Content>
        <BalanceCard>
          <BalanceLabel>Video Earnings Balance</BalanceLabel>
          <BalanceAmount>${dollarBalance2?.toFixed(2) || '0.00'}</BalanceAmount>
          {rewardEarned > 0 && (
            <RewardNotification>
              <FaDollarSign /> +{rewardEarned.toFixed(2)} earned!
            </RewardNotification>
          )}
        </BalanceCard>
        
        <VideoContainer>
          <VideoTitle>{currentVideo.title}</VideoTitle>
          
          <VideoWrapper>
            <YouTubeIframe
              src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=1&controls=0`}
              allow="accelerometer; autoplay; encrypted-media; gyroscope"
              allowFullScreen
            />
          </VideoWrapper>
          
          <ProgressBar>
            <ProgressFill $progress={(watchedTime / currentVideo.duration) * 100} />
            {hasQualified && (
              <QualifiedMarker $position={(15 / currentVideo.duration) * 100}>
                <QualifiedTooltip>Earn $1.00 here!</QualifiedTooltip>
              </QualifiedMarker>
            )}
          </ProgressBar>
          
          <VideoControls>
            <TimeDisplay>
              {watchedTime}s / {currentVideo.duration}s
              <QualifyText $claimed={hasClaimed}>
                {hasClaimed ? 'Reward claimed!' : hasQualified ? 'Reward available!' : 'Watch 15s to earn $1.00'}
              </QualifyText>
            </TimeDisplay>
            
            {(videoEnded || hasClaimed) && (
              <NextButton onClick={handleNextVideo}>
                Next Video <FaArrowRight />
              </NextButton>
            )}
          </VideoControls>
        </VideoContainer>
        
        <Instructions>
          <h3>How to earn rewards:</h3>
          <ul>
            <li>Watch videos to earn money automatically</li>
            <li>Earn $1.00 after watching 15 seconds</li>
            <li>Each video reward can only be claimed once</li>
            <li>Continue watching to discover more content</li>
          </ul>
        </Instructions>
      </Content>
      
      <NavBar />
    </Container>
  );
};

export default VideoWatchPage;
