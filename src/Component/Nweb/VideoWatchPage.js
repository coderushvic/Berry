import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { berryTheme } from '../../Theme';
import { FaThumbsUp, FaThumbsDown, FaArrowRight, FaExpand, FaCompress, FaCheckCircle, FaDollarSign } from 'react-icons/fa';
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

// Mock videos data
const mockVideos = [
  {
    id: '1',
    youtubeId: 'dQw4w9WgXcQ',
    title: 'Premium Video Content',
    minWatchTime: 15,
    fullDuration: 30,
    rewardAmount: 1.00,
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
  },
  {
    id: '2',
    youtubeId: 'JGwWNGJdvx8',
    title: 'Special Bonus Content',
    minWatchTime: 15,
    fullDuration: 45,
    rewardAmount: 1.50,
    thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg'
  }
];

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
  line-height: 1.5;
  
  strong {
    color: ${berryTheme.colors.primary};
    font-weight: 700;
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
  position: relative;
  z-index: 1;

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
  transition: all 0.3s ease;
  
  ${props => props.$isFullscreen && `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    border-radius: 0;
    padding: 20px;
  `}
`;

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: ${props => props.$aspectRatio};
  overflow: hidden;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
`;

const VideoThumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  font-size: 0.8rem;
  color: #FF8A00;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
`;

const ViewOptions = styled.div`
  display: flex;
  gap: 10px;
`;

const AspectButton = styled.button`
  background: rgba(0,0,0,0.1);
  color: ${berryTheme.colors.textDark};
  border: none;
  border-radius: 20px;
  padding: 8px 15px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0,0,0,0.2);
  }
`;

const FullscreenButton = styled.button`
  background: rgba(0,0,0,0.1);
  color: ${berryTheme.colors.textDark};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0,0,0,0.2);
  }
`;

const FeedbackButtons = styled.div`
  display: flex;
  gap: 15px;
`;

const ButtonBase = styled.button`
  border: none;
  background: none;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  transition: all 0.2s ease;
  width: 44px;
  height: 44px;
`;

const LikeButton = styled(ButtonBase)`
  color: ${props => props.$active ? '#4CAF50' : berryTheme.colors.textSecondary};
  background: ${props => props.$active ? 'rgba(76, 175, 80, 0.1)' : 'rgba(0,0,0,0.05)'};
  
  &:hover {
    color: #4CAF50;
    background: rgba(76, 175, 80, 0.1);
  }
`;

const DislikeButton = styled(ButtonBase)`
  color: ${props => props.$active ? '#F44336' : berryTheme.colors.textSecondary};
  background: ${props => props.$active ? 'rgba(244, 67, 54, 0.1)' : 'rgba(0,0,0,0.05)'};
  
  &:hover {
    color: #F44336;
    background: rgba(244, 67, 54, 0.1);
  }
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

const NoVideosOverlay = styled.div`
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

const NoVideosContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  animation: ${popIn} 0.4s ease;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
`;

const NoVideosIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const NoVideosTitle = styled.h2`
  color: ${berryTheme.colors.primaryDark};
  margin: 15px 0 10px;
  font-size: 1.8rem;
`;

const NoVideosText = styled.p`
  color: ${berryTheme.colors.textSecondary};
  font-size: 1.1rem;
  margin-bottom: 25px;
  line-height: 1.5;
`;

const RefreshButton = styled.button`
  background: linear-gradient(45deg, #FF8A00, #E52E71);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(229, 46, 113, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(229, 46, 113, 0.4);
  }
`;

const LoadingState = () => (
  <Container>
    <Header>
      <LogoImage src='/Berry.png' alt="Berry Logo" />
      <LogoText>berry</LogoText>
    </Header>
    <LoadingMessage>
      <Spinner />
      <p>Loading video content...</p>
    </LoadingMessage>
    <NavBar />
  </Container>
);

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid ${berryTheme.colors.primary};
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 60px 40px;
  color: ${berryTheme.colors.textSecondary};
  
  p {
    margin-top: 20px;
    font-size: 1.1rem;
  }
`;

const ErrorState = ({ error }) => (
  <Container>
    <Header>
      <LogoImage src='/Berry.png' alt="Berry Logo" />
      <LogoText>berry</LogoText>
    </Header>
    <ErrorMessage>
      <ErrorIcon>⚠️</ErrorIcon>
      <h3>Oops! Something went wrong</h3>
      <p>{error}</p>
      <RetryButton onClick={() => window.location.reload()}>
        Try Again
      </RetryButton>
    </ErrorMessage>
    <NavBar />
  </Container>
);

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: ${berryTheme.colors.error};
  
  h3 {
    color: ${berryTheme.colors.error};
    margin-bottom: 15px;
    font-size: 1.5rem;
  }
  
  p {
    margin-bottom: 25px;
    font-size: 1.1rem;
    color: ${berryTheme.colors.textSecondary};
  }
`;

const RetryButton = styled.button`
  background: linear-gradient(45deg, #FF8A00, #E52E71);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(229, 46, 113, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(229, 46, 113, 0.4);
  }
`;

const NoVideosState = () => (
  <Container>
    <Header>
      <LogoImage src='/Berry.png' alt="Berry Logo" />
      <LogoText>berry</LogoText>
    </Header>
    <NoVideosMessage>
      <h3>No videos available</h3>
      <p>There are currently no videos to watch. Please check back later.</p>
    </NoVideosMessage>
    <NavBar />
  </Container>
);

const NoVideosMessage = styled.div`
  text-align: center;
  padding: 60px 40px;
  color: ${berryTheme.colors.textSecondary};
  
  h3 {
    color: ${berryTheme.colors.primary};
    margin-bottom: 15px;
    font-size: 1.5rem;
  }
  
  p {
    font-size: 1.1rem;
  }
`;

// Main Component
const VideoWatchPage = () => {
  const { 
    dollarBalance2,
    lastVideoTime,
    id,
    watchVideo
  } = useUser();
  
  const [currentVideo, setCurrentVideo] = useState(null);
  const [availableVideos, setAvailableVideos] = useState([]);
  const [watchedTime, setWatchedTime] = useState(0);
  const [hasQualified, setHasQualified] = useState(false);
  const [hasLiked, setHasLiked] = useState(null);
  const [rewardEarned, setRewardEarned] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16/9');
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [claimedReward, setClaimedReward] = useState(false);
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [videoEnded, setVideoEnded] = useState(false);
  const [showNextVideoPrompt, setShowNextVideoPrompt] = useState(false);

  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const confettiTimeoutRef = useRef(null);

  const fetchVideos = useCallback(async () => {
    if (process.env.NODE_ENV === 'development') {
      return mockVideos.filter(video => !watchedVideos.includes(video.id));
    }

    try {
      const response = await fetch('/api/videos');
      if (!response.ok) throw new Error('Failed to fetch videos');
      const videos = await response.json();
      return videos.filter(video => !watchedVideos.includes(video.id));
    } catch (err) {
      console.error('Error fetching videos:', err);
      return mockVideos.filter(video => !watchedVideos.includes(video.id));
    }
  }, [watchedVideos]);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        setIsLoading(true);
        const videos = await fetchVideos();
        setAvailableVideos(videos);
        
        if (videos.length > 0) {
          setCurrentVideo(videos[0]);
        } else {
          setError('No more videos available at this time');
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load videos');
        setIsLoading(false);
      }
    };

    loadVideos();
  }, [fetchVideos]);

  useEffect(() => {
    if (videoEnded && availableVideos.length > 0) {
      const timer = setTimeout(() => {
        setShowNextVideoPrompt(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [videoEnded, availableVideos]);

  const startTimer = () => {
    if (lastVideoTime) {
      const now = new Date();
      const lastWatchTime = new Date(lastVideoTime);
      const hoursSinceLastWatch = (now - lastWatchTime) / (1000 * 60 * 60);
      
      if (hoursSinceLastWatch < 1) {
        setError(`Please wait ${Math.ceil(60 - (hoursSinceLastWatch * 60))} minutes before watching another video`);
        return;
      }
    }

    clearInterval(timerRef.current);
    setWatchedTime(0);
    setHasQualified(false);
    setClaimedReward(false);
    setVideoEnded(false);

    timerRef.current = setInterval(() => {
      setWatchedTime(prev => {
        const newTime = prev + 1;
        const minDuration = currentVideo.fullDuration || 20;
        
        if (newTime >= 10 && !showControls) {
          setShowControls(true);
        }

        if (newTime >= currentVideo.minWatchTime && !hasQualified) {
          setHasQualified(true);
          showRewardNotification();
        }

        if (newTime >= minDuration) {
          clearInterval(timerRef.current);
          setVideoEnded(true);
        }

        return newTime;
      });
    }, 1000);
  };

  const showRewardNotification = () => {
    setShowRewardPopup(true);
  };

  const claimReward = async () => {
    if (!id || !currentVideo) {
      console.error('User ID or current video not available');
      return;
    }

    try {
      console.log('Attempting to claim reward...');
      const result = await watchVideo(currentVideo.rewardAmount);
      
      if (result?.success) {
        console.log('Reward claimed successfully:', result);
        setRewardEarned(currentVideo.rewardAmount);
        setClaimedReward(true);
        setShowRewardPopup(false);
        
        setWatchedVideos(prev => [...prev, currentVideo.id]);
        
        setShowConfetti(true);
        confettiTimeoutRef.current = setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
      } else {
        const errorMsg = result?.message || 'Failed to claim reward';
        console.error('Claim reward error:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Error in claimReward:', err);
      setError(err.message || 'Failed to claim reward');
    }
  };

  const handleConfettiClose = () => {
    setShowConfetti(false);
    clearTimeout(confettiTimeoutRef.current);
  };

  const handleLike = () => setHasLiked(true);
  const handleDislike = () => setHasLiked(false);

  const handleNextVideo = () => {
    setShowNextVideoPrompt(false);
    setWatchedTime(0);
    setHasQualified(false);
    setHasLiked(null);
    setRewardEarned(0);
    setShowControls(false);
    setShowRewardPopup(false);
    setVideoEnded(false);
    
    const remainingVideos = availableVideos.filter(v => v.id !== currentVideo.id);
    setAvailableVideos(remainingVideos);
    
    if (remainingVideos.length > 0) {
      setCurrentVideo(remainingVideos[0]);
    }
  };

  const handleDeclineNextVideo = () => {
    setShowNextVideoPrompt(false);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen?.().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleAspectRatio = () => {
    setAspectRatio(prev => prev === '16/9' ? '9/16' : '16/9');
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!currentVideo) return <NoVideosState />;

  return (
    <Container onMouseMove={handleMouseMove}>
      {showConfetti && (
        <ConfettiOverlay>
          <Confetti src="/celebrating.gif" alt="Confetti celebration" />
          <RewardMessage>
            <FaDollarSign /> +{currentVideo.rewardAmount.toFixed(2)} Added to Your Balance!
          </RewardMessage>
          <OkButton onClick={handleConfettiClose}>OK</OkButton>
        </ConfettiOverlay>
      )}

      {showRewardPopup && !claimedReward && (
        <RewardPopup onClick={() => setShowRewardPopup(false)}>
          <PopupContent onClick={(e) => e.stopPropagation()}>
            <FaCheckCircle size={60} color="#4CAF50" />
            <PopupTitle>Congratulations!</PopupTitle>
            <PopupText>
              You've earned <strong>${currentVideo.rewardAmount.toFixed(2)}</strong> for watching this video!
            </PopupText>
            <ClaimButton 
              onClick={(e) => {
                e.stopPropagation();
                claimReward();
              }}
              disabled={claimedReward}
            >
              Claim Your Reward
            </ClaimButton>
          </PopupContent>
        </RewardPopup>
      )}

      {showNextVideoPrompt && (
        <NextVideoPrompt>
          <PromptContent>
            <PromptTitle>Watch Another Video?</PromptTitle>
            <PromptText>
              You can earn ${availableVideos[0]?.rewardAmount.toFixed(2)} for watching the next video!
            </PromptText>
            <PromptButtons>
              <PromptButton $accept onClick={handleNextVideo}>
                Yes, Continue Watching
              </PromptButton>
              <PromptButton onClick={handleDeclineNextVideo}>
                No Thanks
              </PromptButton>
            </PromptButtons>
          </PromptContent>
        </NextVideoPrompt>
      )}

      {availableVideos.length === 0 && !isLoading && (
        <NoVideosOverlay>
          <NoVideosContent>
            <NoVideosIcon>📺</NoVideosIcon>
            <NoVideosTitle>No More Videos Available</NoVideosTitle>
            <NoVideosText>
              You've watched all available videos. Check back later for new content!
            </NoVideosText>
            <RefreshButton onClick={() => window.location.reload()}>
              Refresh
            </RefreshButton>
          </NoVideosContent>
        </NoVideosOverlay>
      )}

      <Header>
        <LogoImage src='/Berry.png' alt="Berry Logo" />
        <LogoText>berry</LogoText>
      </Header>
      
      <Content>
        <BalanceCard>
          <BalanceLabel>Video Earnings Balance</BalanceLabel>
          <BalanceAmount>${dollarBalance2.toFixed(2)}</BalanceAmount>
          {rewardEarned > 0 && (
            <RewardNotification>
              <FaDollarSign /> +{rewardEarned.toFixed(2)} earned!
            </RewardNotification>
          )}
        </BalanceCard>
        
        <VideoContainer $isFullscreen={isFullscreen}>
          <VideoTitle>{currentVideo.title}</VideoTitle>
          
          <VideoWrapper $aspectRatio={aspectRatio}>
            {isLoading ? (
              <VideoThumbnail src={currentVideo.thumbnail} alt="Video thumbnail" />
            ) : (
              <YouTubeIframe
                src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=1&controls=0&modestbranding=1&rel=0`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={startTimer}
                ref={videoRef}
              />
            )}
          </VideoWrapper>
          
          <ProgressBar>
            <ProgressFill $progress={(watchedTime / (currentVideo.fullDuration || 20)) * 100} />
            {hasQualified && !claimedReward && (
              <QualifiedMarker $position={(currentVideo.minWatchTime / (currentVideo.fullDuration || 20)) * 100}>
                <QualifiedTooltip>Earned ${currentVideo.rewardAmount.toFixed(2)} here!</QualifiedTooltip>
              </QualifiedMarker>
            )}
          </ProgressBar>
          
          {(showControls || videoEnded) && (
            <VideoControls>
              <TimeDisplay>
                {watchedTime}s / {currentVideo.fullDuration || 20}s
                {watchedTime >= currentVideo.minWatchTime && !claimedReward && (
                  <QualifyText>Reward available to claim!</QualifyText>
                )}
                {claimedReward && (
                  <QualifyText $claimed>Reward claimed!</QualifyText>
                )}
              </TimeDisplay>
              
              <ActionButtons>
                <ViewOptions>
                  <AspectButton onClick={toggleAspectRatio}>
                    {aspectRatio === '16/9' ? 'Portrait' : 'Landscape'}
                  </AspectButton>
                  <FullscreenButton onClick={toggleFullscreen}>
                    {isFullscreen ? <FaCompress /> : <FaExpand />}
                  </FullscreenButton>
                </ViewOptions>
                
                {watchedTime >= 10 && (
                  <FeedbackButtons>
                    <LikeButton onClick={handleLike} $active={hasLiked === true}>
                      <FaThumbsUp />
                    </LikeButton>
                    <DislikeButton onClick={handleDislike} $active={hasLiked === false}>
                      <FaThumbsDown />
                    </DislikeButton>
                  </FeedbackButtons>
                )}
                
                {videoEnded && (
                  <NextButton onClick={handleNextVideo}>
                    Next Video <FaArrowRight />
                  </NextButton>
                )}
              </ActionButtons>
            </VideoControls>
          )}
        </VideoContainer>
        
        <Instructions>
          <h3>How it works:</h3>
          <ul>
            <li>Watch videos to earn money</li>
            <li>Must watch at least {currentVideo.minWatchTime} seconds to earn ${currentVideo.rewardAmount.toFixed(2)}</li>
            <li>Reward must be claimed before moving to next video</li>
            <li>Each video can only be rewarded once</li>
          </ul>
        </Instructions>
      </Content>
      
      <NavBar />
    </Container>
  );
};

export default VideoWatchPage;