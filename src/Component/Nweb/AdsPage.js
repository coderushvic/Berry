import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { berryTheme } from '../../Theme';
import { FaCoins, FaCrown, FaTimes } from 'react-icons/fa';
import AdTask from '../Adsgram/AdTask';
import NavBar from '../../Component/Nweb/NavBar';
import { useUser } from '../../context/userContext';
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { doc, updateDoc, increment } from 'firebase/firestore';
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
  position: relative;
  overflow: hidden;

  &:hover {
    background: ${berryTheme.colors.primaryDark};
    transform: translateY(-2px);
  }

  &:disabled {
    background: ${berryTheme.colors.grey300};
    cursor: not-allowed;
    transform: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: translateX(0);
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
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
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
  position: relative;
  overflow: hidden;

  &:hover {
    background: ${berryTheme.colors.primaryDark};
  }

  &:disabled {
    background: ${berryTheme.colors.grey300};
    cursor: not-allowed;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: translateX(0);
  }
`;

const ErrorMessage = styled.div`
  color: ${berryTheme.colors.error};
  text-align: center;
  margin: 8px 0;
  font-size: 0.9rem;
  padding: 8px;
  background: ${berryTheme.colors.errorLight};
  border-radius: 8px;
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
  color: ${berryTheme.colors.primaryDark};
`;

const SuccessText = styled.p`
  margin-bottom: 24px;
  color: ${berryTheme.colors.textDark};
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

const ConnectionLoader = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const AdsPage = () => {
  const { id, isPremium, setIsPremium, dollarBalance2, setDollarBalance2 } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Ready to connect');
  const [isConnecting, setIsConnecting] = useState(false);
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  // Payment details - 0.1 TON in nanoTON
  const paymentAmount = '100000000'; // 0.1 TON
  const premiumBonus = 2000; // Bonus points

  const transaction = useCallback(() => ({
    validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes expiry
    messages: [
      {
        address: process.env.REACT_APP_TON_WALLET_ADDRESS,
        amount: paymentAmount,
        payload: "Berry Ads Premium Subscription"
      },
    ],
  }), [paymentAmount]);

  // Fast wallet connection initialization
  useEffect(() => {
    let isMounted = true;
    
    const initializeWallet = async () => {
      try {
        tonConnectUI.uiOptions = {
          manifestUrl: 'https://chic-phoenix-c00482.netlify.app/tonconnect-manifest.json',
          language: 'en',
          uiPreferences: {
            theme: 'DARK',
            colorsSet: {
              tonconnect: berryTheme.colors.primary,
              text: '#FFFFFF',
              background: '#1E1E1E'
            }
          },
          actionsConfiguration: {
            twaReturnUrl: 'https://t.me/Fuhdhdbot',
            modals: ['back', 'close']
          }
        };

        await tonConnectUI.connectionRestored;
        if (isMounted && tonConnectUI.connected) {
          setConnectionStatus(`Connected to ${tonConnectUI.wallet?.device.appName || 'wallet'}`);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Wallet initialization error:", err);
          setConnectionStatus('Connection error');
          setError('Failed to initialize wallet connection');
        }
      }
    };

    initializeWallet();
    
    return () => {
      isMounted = false;
    };
  }, [tonConnectUI]);

  // Real-time connection status updates
  useEffect(() => {
    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      if (wallet) {
        setConnectionStatus(`Connected to ${wallet.device.appName}`);
        setIsConnecting(false);
        setError(null);
      } else {
        setConnectionStatus('Ready to connect');
      }
    });
    
    return () => unsubscribe();
  }, [tonConnectUI]);

  // Improved wallet connection check
  const checkConnection = useCallback(async () => {
    try {
      if (tonConnectUI.connected) return true;
      
      setIsConnecting(true);
      setConnectionStatus('Connecting...');
      setError(null);
      
      // More reliable connection check
      const connected = await new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 30; // 3 seconds total (100ms * 30)
        const checkInterval = 100;
        
        const checkConnection = () => {
          if (tonConnectUI.connected) {
            resolve(true);
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkConnection, checkInterval);
          } else {
            resolve(false);
          }
        };
        
        checkConnection();
      });

      if (!connected) {
        setError('Connection timed out. Please try again.');
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Connection check error:", err);
      setError('Connection failed. Please try again.');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [tonConnectUI]);

  // Improved button click handler
  const handleUpgradeClick = useCallback(async () => {
    try {
      setError(null);
      setIsConnecting(true);
      
      const isConnected = await checkConnection();
      
      if (isConnected) {
        setShowModal(true);
      }
    } catch (err) {
      console.error("Upgrade click error:", err);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  }, [checkConnection]);

  const handleCloseModal = useCallback(() => {
    if (!isProcessing) {
      setShowModal(false);
      setError(null);
    }
  }, [isProcessing]);

  // More reliable payment processing
  const activatePremium = useCallback(async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      if (!tonConnectUI.connected || !wallet) {
        throw new Error('Wallet not properly connected');
      }

      // Create fresh transaction object
      const currentTransaction = transaction();
      
      // Send transaction with error handling
      const response = await tonConnectUI.sendTransaction(currentTransaction).catch(err => {
        console.error("Transaction sending error:", err);
        throw new Error('Transaction failed to send');
      });

      console.log('Transaction response:', response);
      
      // Verify transaction was successful
      if (!response || !response.boc) {
        throw new Error('Transaction not completed');
      }

      // Calculate new balance
      const newBalance = dollarBalance2 + premiumBonus;

      // Update Firestore
      const userRef = doc(db, 'telegramUsers', id.toString());
      await updateDoc(userRef, {
        isPremium: true,
        dollarBalance2: increment(premiumBonus),
        lastPremiumActivation: new Date(),
      }).catch(err => {
        console.error("Firestore update error:", err);
        throw new Error('Account update failed');
      });

      // Update local state
      setIsPremium(true);
      setDollarBalance2(newBalance);
      setShowSuccess(true);
      setShowModal(false);
      
    } catch (err) {
      console.error('Payment processing error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [tonConnectUI, wallet, transaction, id, premiumBonus, setIsPremium, dollarBalance2, setDollarBalance2]);

  const closeSuccessModal = useCallback(() => {
    setShowSuccess(false);
  }, []);

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
              {dollarBalance2.toLocaleString()}
            </StatValue>
            <StatLabel>Current Balance</StatLabel>
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
                <FaCoins color="#FFD700" /> 2x earning rate
              </PremiumBenefit>
              <PremiumBenefit>
                <FaCoins color="#FFD700" /> No waiting time
              </PremiumBenefit>
              <UpgradeButton 
                onClick={handleUpgradeClick}
                disabled={isConnecting || isProcessing}
              >
                {isConnecting ? (
                  <>
                    <ConnectionLoader /> Connecting...
                  </>
                ) : (
                  <>
                    <FaCrown /> Upgrade Now (0.1 TON)
                  </>
                )}
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
            
            <ModalTitle>Upgrade to Premium</ModalTitle>
            
            <ModalText>
              Pay 0.1 TON to activate premium features and get {premiumBonus} bonus points.
            </ModalText>
            
            <PaymentAmount>
              Payment Amount: <strong>0.1 TON</strong>
            </PaymentAmount>
            
            <ConnectionStatus connected={!!wallet}>
              {wallet ? `Connected to ${wallet.device.appName}` : connectionStatus}
            </ConnectionStatus>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            {wallet ? (
              <ConnectButton 
                onClick={activatePremium} 
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <ConnectionLoader /> Processing...
                  </>
                ) : (
                  'Confirm Payment'
                )}
              </ConnectButton>
            ) : (
              <TonConnectButton 
                className="ton-connect-button"
                style={{
                  marginTop: '16px',
                  width: '100%',
                  borderRadius: '24px',
                  padding: '12px 24px',
                  transition: 'all 0.3s ease'
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
              <SuccessTitle>Premium Activated!</SuccessTitle>
              <SuccessText>
                You received {premiumBonus} bonus points! Your new balance is {(dollarBalance2 + premiumBonus).toLocaleString()}.
              </SuccessText>
              <ConnectButton onClick={closeSuccessModal}>
                Continue
              </ConnectButton>
            </SuccessModalContent>
          </ModalContent>
        </ModalOverlay>
      )}
    </AppContainer>
  );
};

export default AdsPage;
