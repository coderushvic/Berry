import { useUser } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import { FiDollarSign, FiArrowUpRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { PulseLoader } from 'react-spinners';
import CountUp from 'react-countup';
import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { berryTheme } from '../../Theme';

// Animation for shimmer effect
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const BalanceCardContainer = styled.div`
  background: ${berryTheme.colors.cardBackground};
  border-radius: 20px;
  padding: 24px;
  box-shadow: ${berryTheme.shadows.medium};
  border-top: 4px solid ${berryTheme.colors.primary};
  position: relative;
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const CardTitle = styled.h2`
  color: ${berryTheme.colors.textDark};
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PremiumBadge = styled.span`
  background: ${berryTheme.colors.secondary};
  color: white;
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
`;

const BalanceDisplay = styled(motion.div)`
  margin-bottom: 24px;
  text-align: center;
`;

const BalanceAmount = styled.p`
  color: ${berryTheme.colors.primary};
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 4px;
`;

const BalanceLabel = styled.p`
  color: ${berryTheme.colors.textMuted};
  font-size: 0.9rem;
`;

const ProgressContainer = styled.div`
  margin-bottom: 24px;
`;

const ProgressLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.8rem;
  color: ${berryTheme.colors.textMuted};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${berryTheme.colors.grey200};
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${berryTheme.colors.primary};
  border-radius: 3px;
  transition: width 0.5s ease;
  position: relative;
`;

const ProgressTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  background: ${berryTheme.colors.textDark};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  margin-bottom: 8px;
  white-space: nowrap;
`;

const QuickWithdrawGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`;

const QuickWithdrawButton = styled(motion.button)`
  background: white;
  color: ${berryTheme.colors.primary};
  border: 1px solid ${berryTheme.colors.grey300};
  border-radius: 12px;
  padding: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${berryTheme.colors.primaryLight}20;
    border-color: ${berryTheme.colors.primaryLight};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const WithdrawButton = styled(motion.button)`
  background: ${berryTheme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: ${berryTheme.colors.primaryDark};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(227, 11, 92, 0.3);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.3) 50%,
      rgba(255,255,255,0) 100%
    );
    transform: translateX(-100%);
  }
  
  &:hover::after {
    animation: ${shimmer} 1.5s infinite;
  }
  
  &:disabled {
    background: ${berryTheme.colors.grey400};
    cursor: not-allowed;
  }
`;

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
`;

export default function BalanceCard() {
  const { 
    adsBalance, 
    loading,
    user,
    withdrawalHistory = []
  } = useUser();
  
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (withdrawalHistory.length > 0) {
      const limitUsed = Math.min(65, 100);
      setProgress(limitUsed);
    }
  }, [withdrawalHistory]);

  const quickWithdrawAmounts = [10, 25, 50, 100];

  return (
    <BalanceCardContainer>
      <CardHeader>
        <CardTitle>
          <FiDollarSign />
          Ads Balance
        </CardTitle>
        {user?.premium && <PremiumBadge>PRO</PremiumBadge>}
      </CardHeader>

      {loading ? (
        <LoaderContainer>
          <PulseLoader color={berryTheme.colors.primary} size={10} />
          <span style={{ color: berryTheme.colors.textMuted, fontSize: '0.8rem', marginTop: '8px' }}>
            Loading balance...
          </span>
        </LoaderContainer>
      ) : (
        <>
          <BalanceDisplay
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <BalanceAmount>
              <CountUp
                end={adsBalance || 0}
                decimals={adsBalance < 1 ? 3 : 2}
                prefix="$"
                duration={0.8}
                separator=","
              />
            </BalanceAmount>
            <BalanceLabel>Available for withdrawal</BalanceLabel>
          </BalanceDisplay>

          {progress > 0 && (
            <ProgressContainer>
              <ProgressLabels>
                <span>Withdrawal limit</span>
                <span>{progress}% used</span>
              </ProgressLabels>
              <ProgressBar>
                <ProgressFill 
                  style={{ width: `${progress}%` }}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  {showTooltip && (
                    <ProgressTooltip>
                      ${(progress * 100).toLocaleString()} of $10,000 limit
                    </ProgressTooltip>
                  )}
                </ProgressFill>
              </ProgressBar>
            </ProgressContainer>
          )}

          <QuickWithdrawGrid>
            {quickWithdrawAmounts.map(amount => (
              <QuickWithdrawButton
                key={amount}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/withdrawx?amount=${amount}`)}
                disabled={loading || (adsBalance < amount)}
              >
                ${amount}
              </QuickWithdrawButton>
            ))}
          </QuickWithdrawGrid>

          <WithdrawButton
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/withdrawx')}
            disabled={loading}
          >
            Withdraw Funds
            <FiArrowUpRight style={{ marginLeft: '8px' }} />
          </WithdrawButton>
        </>
      )}
    </BalanceCardContainer>
  );
}