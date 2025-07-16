import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { berryTheme } from '../../Theme';
import { FaCoins, FaCrown, FaTimes, FaCheck, FaSpinner } from 'react-icons/fa';
import AdTask from '../Adsgram/AdTask';
import NavBar from '../../Component/Nweb/NavBar';
import { useUser } from '../../context/userContext';

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

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: ${berryTheme.colors.success};
  margin: 16px 0;
  font-weight: 600;
`;

const ErrorMessage = styled.div`
  color: ${berryTheme.colors.error};
  text-align: center;
  margin: 8px 0;
  font-size: 0.9rem;
`;

const VerificationStatus = styled.div`
  margin: 16px 0;
  padding: 12px;
  border-radius: 8px;
  background: ${berryTheme.colors.grey100};
  text-align: center;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const Spinner = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const AdsPage = () => {
  const { isPremium, setIsPremium } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [isTelegram, setIsTelegram] = useState(false);

  // Check if running in Telegram Mini App
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      setIsTelegram(true);
      window.Telegram.WebApp.expand(); // Expand the web app to full view
    }
  }, []);

  const handleUpgradeClick = () => {
    setShowModal(true);
    setError(null);
    setIsSuccess(false);
    setVerificationMessage('');
  };

  const handleCloseModal = () => {
    if (!isProcessing) {
      setShowModal(false);
    }
  };

  const handleTelegramPayment = async () => {
    try {
      setIsProcessing(true);
      setVerificationMessage('Opening Telegram Wallet...');
      
      const paymentDetails = {
        to: 'UQDSouCLJk33nCQgW6ugTxIMNLvsuKka1FIAEW8N5TjshjCs',
        value: '1000000000', // 1 TON in nanoTON
        text: 'Premium activation payment'
      };

      // Create Telegram payment URL
      const paymentUrl = `ton://transfer/${paymentDetails.to}?amount=${paymentDetails.value}&text=${encodeURIComponent(paymentDetails.text)}`;
      
      // Open Telegram payment interface
      window.Telegram.WebApp.openInvoice(paymentUrl, (status) => {
        if (status === 'paid') {
          setIsSuccess(true);
          setIsPremium(true);
          setVerificationMessage('Payment successful!');
          
          setTimeout(() => {
            setShowModal(false);
            setIsProcessing(false);
          }, 3000);
        } else {
          setError('Payment was cancelled');
          setIsProcessing(false);
        }
      });

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
      setIsProcessing(false);
    }
  };

  const handleTonWalletPayment = async () => {
    try {
      setIsProcessing(true);
      setVerificationMessage('Connecting to TON Wallet...');
      
      // Check if TonProvider is available
      if (!window.ton) {
        throw new Error('TON Wallet extension not detected');
      }

      // Request account access
      const accounts = await window.ton.send('ton_requestAccounts');
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Prepare payment
      const paymentDetails = {
        to: 'UQDSouCLJk33nCQgW6ugTxIMNLvsuKka1FIAEW8N5TjshjCs',
        value: '1000000000', // 1 TON in nanoTON
        data: 'Premium activation payment'
      };

      setVerificationMessage('Confirm in your wallet...');
      const txHash = await window.ton.send('ton_sendTransaction', [paymentDetails]);
      
      if (!txHash) {
        throw new Error('Transaction failed');
      }

      setIsSuccess(true);
      setIsPremium(true);
      setVerificationMessage('Payment successful!');
      
      setTimeout(() => {
        setShowModal(false);
        setIsProcessing(false);
      }, 3000);

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
      setIsProcessing(false);
    }
  };

  const handleConnectWallet = async () => {
    if (isTelegram) {
      await handleTelegramPayment();
    } else {
      await handleTonWalletPayment();
    }
  };

  return (
    <AppContainer>
      <Header>
        <LogoImage src='/Berry.png' alt="Berry Logo" />
        <LogoText>berry</LogoText>
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
              +{isPremium ? '2000' : '1000'}
            </StatValue>
            <StatLabel>Per Ad</StatLabel>
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
            
            <ModalTitle>Upgrade to Premium</ModalTitle>
            
            {isSuccess ? (
              <SuccessMessage>
                <FaCheck /> Payment successful! Premium activated.
              </SuccessMessage>
            ) : (
              <>
                <ModalText>
                  Pay 1 TON to activate premium features.
                </ModalText>
                
                <PaymentAmount>
                  Payment Amount: <strong>1 TON</strong>
                </PaymentAmount>
                
                {error && <ErrorMessage>{error}</ErrorMessage>}
                
                {verificationMessage && (
                  <VerificationStatus>
                    {isProcessing && <Spinner />}
                    {verificationMessage}
                  </VerificationStatus>
                )}
                
                <ConnectButton 
                  onClick={handleConnectWallet} 
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : isTelegram ? 'Pay with Telegram Wallet' : 'Connect TON Wallet'}
                </ConnectButton>
              </>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
    </AppContainer>
  );
};

export default AdsPage;
