import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { berryTheme } from '../../Theme';
import { FaCoins, FaCrown, FaTimes } from 'react-icons/fa';
import AdTask from '../Adsgram/AdTask';
import NavBar from '../../Component/Nweb/NavBar';
import { useUser } from '../../context/userContext';
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import { IoCheckmarkCircleSharp } from 'react-icons/io5';

// Styled Components
const AppContainer = styled.div`
  font-family: ${berryTheme.fonts.main};
  background: ${berryTheme.colors.backgroundGradient};
  min-height: 100vh;
  margin: 0 auto;
  position: relative;
  padding-bottom: 80px;
`;

const Content = styled.div`
  padding: ${berryTheme.spacing.medium};
  max-width: 600px;
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

const StatsCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: ${berryTheme.shadows.small};
  margin-bottom: 20px;
  border: 1px solid ${berryTheme.colors.grey200};
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${berryTheme.colors.primaryDark};
  margin: 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${berryTheme.colors.textSecondary};
`;

const PremiumCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: ${berryTheme.shadows.small};
  margin-bottom: 20px;
  border: 1px solid ${berryTheme.colors.grey200};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      rgba(255, 215, 0, 0.15) 0%,
      rgba(255, 215, 0, 0.1) 50%,
      transparent 70%
    );
    z-index: 0;
    pointer-events: none;
  }
`;

const PremiumContent = styled.div`
  position: relative;
  z-index: 1;
`;

const PremiumHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
`;

const PremiumTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: ${berryTheme.colors.primaryDark};
`;

const PremiumBenefit = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0;
  font-size: 0.95rem;
  color: ${berryTheme.colors.textDark};
`;

const UpgradeButton = styled.button`
  background: ${berryTheme.colors.primary};
  color: white;
  border: none;
  border-radius: 24px;
  padding: 12px 24px;
  font-weight: 600;
  margin-top: 16px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${berryTheme.colors.primaryDark};
    transform: translateY(-2px);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: ${berryTheme.shadows.large};
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: ${berryTheme.colors.textSecondary};
`;

const ModalTitle = styled.h2`
  margin-top: 0;
  color: ${berryTheme.colors.primaryDark};
  text-align: center;
`;

const ModalText = styled.p`
  color: ${berryTheme.colors.textDark};
  text-align: center;
  margin-bottom: 24px;
`;

const PaymentAmount = styled.div`
  background: ${berryTheme.colors.grey100};
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  margin: 16px 0;
  font-weight: bold;
  color: ${berryTheme.colors.primaryDark};
`;

const ConnectButton = styled.button`
  background: ${berryTheme.colors.primary};
  color: white;
  border: none;
  border-radius: 24px;
  padding: 12px 24px;
  font-weight: 600;
  margin-top: 16px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${berryTheme.colors.primaryDark};
  }

  &:disabled {
    background: ${berryTheme.colors.grey300};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${berryTheme.colors.error};
  text-align: center;
  margin: 8px 0;
  font-size: 0.9rem;
`;

const SuccessModalContent = styled.div`
  text-align: center;
  padding: 20px;
`;

const SuccessIcon = styled(IoCheckmarkCircleSharp)`
  color: ${berryTheme.colors.success};
  font-size: 48px;
  margin: 0 auto 16px;
  display: block;
`;

const SuccessTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 16px;
`;

const SuccessText = styled.p`
  margin-bottom: 24px;
`;

const ConnectionStatus = styled.div`
  padding: 8px;
  border-radius: 8px;
  margin: 8px 0;
  text-align: center;
  font-size: 0.9rem;
  background: ${({ connected }) => 
    connected ? berryTheme.colors.successLight : berryTheme.colors.errorLight
  };
  color: ${({ connected }) => 
    connected ? berryTheme.colors.success : berryTheme.colors.error
  };
`;

const AdsPage = () => {
  const { id, isPremium, setIsPremium } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  // Payment details - 1 TON for unlimited access
  const paymentAmount = '1000000000'; // 1 TON in nanoTON

  // Initialize TonConnect with Berry Ads configuration
  useEffect(() => {
    const initializeTonConnect = async () => {
      try {
        tonConnectUI.uiOptions = {
          manifestUrl: 'https://chic-phoenix-c00482.netlify.app/tonconnect-manifest.json',
          language: 'en',
          uiPreferences: {
            theme: 'DARK',
            colorsSet: {
              tonconnect: '#4A00E0', // Berry brand color
              text: '#FFFFFF',
              background: '#1E1E1E'
            }
          },
          actionsConfiguration: {
            twaReturnUrl: 'https://t.me/Fuhdhdbot', // Your Telegram bot
            modals: ['back', 'close']
          }
        };

        setConnectionStatus(wallet ? 
          `Connected with ${wallet.device.appName}` : 
          'Connect your wallet to continue'
        );
      } catch (err) {
        console.error('TON Connect initialization error:', err);
        setConnectionStatus('Connection failed');
        setError('Failed to initialize wallet connection. Please refresh the page.');
      }
    };

    initializeTonConnect();
  }, [tonConnectUI, wallet]);

  const transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes expiry
    messages: [
      {
        address: process.env.REACT_APP_TON_WALLET_ADDRESS,
        amount: paymentAmount,
        payload: "Berry Ads Premium Subscription"
      },
    ],
  };

  const handleUpgradeClick = () => {
    setShowModal(true);
    setError(null);
  };

  const handleCloseModal = () => {
    if (!isProcessing) {
      setShowModal(false);
    }
  };

  const activatePremium = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // Send transaction through TonConnect
      const response = await tonConnectUI.sendTransaction(transaction);
      console.log('TON transaction successful:', response);

      // Update user in Firestore - only premium status
      const userRef = doc(db, 'telegramUsers', id.toString());
      await updateDoc(userRef, {
        isPremium: true,
        lastPremiumActivation: new Date(),
      });

      // Update local state
      setIsPremium(true);
      setShowSuccess(true);
      setShowModal(false);
      
    } catch (err) {
      console.error('TON transaction error:', err);
      setError(err.message || 'Transaction failed or was cancelled. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccess(false);
  };

  return (
    <AppContainer>
      <Header>
        <LogoImage src='/Berry.png' alt="Berry Logo" />
        <LogoText>Berry Ads</LogoText>
      </Header>
      
      <Content>
        <StatsCard>
          <StatItem>
            <StatValue>{isPremium ? '∞' : '50'}</StatValue>
            <StatLabel>Daily Ads</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>
              <FaCoins color="#FFD700" />
              {isPremium ? 'Unlimited' : 'Limited'}
            </StatValue>
            <StatLabel>Access</StatLabel>
          </StatItem>
        </StatsCard>
        
        <AdTask />
        
        {!isPremium && (
          <PremiumCard>
            <PremiumContent>
              <PremiumHeader>
                <FaCrown color="#FFD700" />
                <PremiumTitle>Go Premium</PremiumTitle>
              </PremiumHeader>
              <PremiumBenefit>
                <FaCoins color="#FFD700" /> Unlimited daily ads
              </PremiumBenefit>
              <PremiumBenefit>
                <FaCoins color="#FFD700" /> No watching limits
              </PremiumBenefit>
              <PremiumBenefit>
                <FaCoins color="#FFD700" /> Priority support
              </PremiumBenefit>
              <UpgradeButton onClick={handleUpgradeClick}>
                <FaCrown /> Upgrade Now (1 TON)
              </UpgradeButton>
            </PremiumContent>
          </PremiumCard>
        )}
      </Content>
      
      <NavBar />

      {/* Payment Modal */}
      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={handleCloseModal} disabled={isProcessing}>
              <FaTimes />
            </CloseButton>
            
            <ModalTitle>Unlock Premium Access</ModalTitle>
            
            <ModalText>
              Pay 1 TON to activate unlimited ad watching with no daily restrictions.
            </ModalText>
            
            <PaymentAmount>
              Payment Amount: <strong>1 TON</strong>
            </PaymentAmount>
            
            <ConnectionStatus connected={!!wallet}>
              {wallet ? `Connected with ${wallet.device.appName}` : connectionStatus}
            </ConnectionStatus>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            {wallet ? (
              <ConnectButton 
                onClick={activatePremium} 
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing Payment...' : 'Confirm Payment (1 TON)'}
              </ConnectButton>
            ) : (
              <TonConnectButton 
                className="ton-connect-button"
                style={{
                  marginTop: '16px',
                  width: '100%',
                  borderRadius: '24px',
                  padding: '12px 24px'
                }}
              />
            )}
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <ModalOverlay>
          <ModalContent>
            <SuccessModalContent>
              <SuccessIcon />
              <SuccessTitle>Premium Access Activated!</SuccessTitle>
              <SuccessText>
                You now have unlimited access to watch ads with no daily limits.
              </SuccessText>
              <ConnectButton onClick={closeSuccessModal}>
                Start Watching Ads
              </ConnectButton>
            </SuccessModalContent>
          </ModalContent>
        </ModalOverlay>
      )}
    </AppContainer>
  );
};

export default AdsPage;
