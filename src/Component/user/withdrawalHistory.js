import { useEffect, useState } from 'react';
import { useUser } from '../../context/userContext';
import { FiDollarSign, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { berryTheme } from '../../Theme';

// Animations
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${berryTheme.spacing.medium};
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${berryTheme.spacing.large};
  gap: ${berryTheme.spacing.small};

  @media (min-width: ${berryTheme.breakpoints.tablet}) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const Title = styled.h1`
  color: ${berryTheme.colors.primary};
  font-size: 1.5rem;
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${berryTheme.colors.textDark};
  margin: ${berryTheme.spacing.xsmall} 0 0;
`;

const BalanceBadge = styled.div`
  background: ${berryTheme.colors.indigo50};
  padding: ${berryTheme.spacing.small} ${berryTheme.spacing.medium};
  border-radius: 12px;
  border: 1px solid ${berryTheme.colors.indigo100};
`;

const BalanceLabel = styled.p`
  color: ${berryTheme.colors.indigo600};
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
`;

const BalanceValue = styled.p`
  color: ${berryTheme.colors.indigo700};
  font-weight: 700;
  margin: 0;
`;

const RefreshButton = styled.button`
  background: white;
  padding: ${berryTheme.spacing.small};
  border-radius: 12px;
  border: 1px solid ${berryTheme.colors.grey200};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${berryTheme.colors.grey50};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const LoadingContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: ${berryTheme.spacing.large};
  box-shadow: ${berryTheme.shadows.small};
`;

const LoadingItem = styled.div`
  height: 80px;
  background: ${berryTheme.colors.grey100};
  border-radius: 12px;
  animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

const EmptyState = styled.div`
  background: white;
  border-radius: 16px;
  padding: ${berryTheme.spacing.large};
  box-shadow: ${berryTheme.shadows.small};
  border: 1px solid ${berryTheme.colors.grey100};
  text-align: center;
`;

const EmptyIcon = styled(FiDollarSign)`
  color: ${berryTheme.colors.grey300};
  font-size: 3rem;
  margin-bottom: ${berryTheme.spacing.medium};
`;

const EmptyTitle = styled.h3`
  color: ${berryTheme.colors.grey500};
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: ${berryTheme.spacing.xsmall};
`;

const EmptyText = styled.p`
  color: ${berryTheme.colors.grey400};
  margin: 0;
`;

const WithdrawalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${berryTheme.spacing.small};
`;

const WithdrawalItem = styled(motion.div)`
  background: white;
  border-radius: 16px;
  box-shadow: ${berryTheme.shadows.small};
  border: 1px solid ${berryTheme.colors.grey100};
  overflow: hidden;
`;

const WithdrawalHeader = styled.div`
  padding: ${berryTheme.spacing.medium};
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background: ${berryTheme.colors.grey50};
  }
`;

const WithdrawalInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${berryTheme.spacing.medium};
`;

const IconContainer = styled.div`
  padding: ${berryTheme.spacing.small};
  border-radius: 12px;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AmountContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Amount = styled.span`
  font-weight: 700;
  color: ${berryTheme.colors.textDark};
  display: flex;
  align-items: center;
  gap: ${berryTheme.spacing.small};
`;

const DateText = styled.span`
  font-size: 0.875rem;
  color: ${berryTheme.colors.grey500};
  margin-top: ${berryTheme.spacing.xsmall};
`;

const AdsBadge = styled.span`
  font-size: 0.75rem;
  padding: ${berryTheme.spacing.xsmall} ${berryTheme.spacing.small};
  background: ${berryTheme.colors.indigo50};
  color: ${berryTheme.colors.indigo600};
  border-radius: 9999px;
  font-weight: 500;
`;

const StatusBadge = styled.div`
  padding: ${berryTheme.spacing.small} ${berryTheme.spacing.medium};
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: ${berryTheme.spacing.small};
  border: 1px solid;
`;

const DetailsContainer = styled(motion.div)`
  padding: 0 ${berryTheme.spacing.medium} ${berryTheme.spacing.medium};
`;

const DetailsContent = styled.div`
  border-top: 1px solid ${berryTheme.colors.grey200};
  padding-top: ${berryTheme.spacing.medium};
  display: flex;
  flex-direction: column;
  gap: ${berryTheme.spacing.medium};
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const DetailLabel = styled.span`
  color: ${berryTheme.colors.grey500};
`;

const DetailValue = styled.span`
  color: ${berryTheme.colors.textDark};
  font-weight: 500;
  max-width: 70%;
  text-align: right;
  word-break: break-all;
`;

const EtherscanLink = styled.a`
  color: ${berryTheme.colors.indigo600};
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: ${berryTheme.spacing.xsmall};
  transition: color 0.2s ease;

  &:hover {
    color: ${berryTheme.colors.indigo800};
  }
`;

export default function WithdrawalHistory() {
  const { 
    allWithdrawals = [],
    adsWithdrawals = [],
    loading,
    adsBalance,
    fetchWithdrawals
  } = useUser();

  const [formattedWithdrawals, setFormattedWithdrawals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedTx, setExpandedTx] = useState(null);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = date instanceof Date ? date : new Date(date);
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[dateObj.getMonth()];
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    const loadData = async () => {
      setRefreshing(true);
      await fetchWithdrawals();
      setRefreshing(false);
    };
    loadData();
  }, [fetchWithdrawals]);

  useEffect(() => {
    const combined = [...allWithdrawals, ...adsWithdrawals]
      .filter(w => w && typeof w === 'object')
      .map(w => {
        const txId = w.txId || w.transactionId || w.hash || null;
        const date = w.createdAt?.toDate?.() || new Date(w.createdAt || w.date || w.timestamp);
        
        return {
          ...w,
          status: w.status?.toLowerCase() || 'pending',
          createdAt: date,
          balanceType: w.balanceType || (adsWithdrawals.some(aw => aw.id === w.id) ? 'ads' : 'main'),
          txId,
          formattedDate: formatDate(date)
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);

    setFormattedWithdrawals(combined);
  }, [allWithdrawals, adsWithdrawals]);

  const statusConfig = {
    'completed': {
      color: berryTheme.colors.green500,
      bgColor: berryTheme.colors.green50,
      borderColor: berryTheme.colors.green100,
      icon: <FiCheckCircle />
    },
    'approved': {
      color: berryTheme.colors.green500,
      bgColor: berryTheme.colors.green50,
      borderColor: berryTheme.colors.green100,
      icon: <FiCheckCircle />
    },
    'pending': {
      color: berryTheme.colors.amber500,
      bgColor: berryTheme.colors.amber50,
      borderColor: berryTheme.colors.amber100,
      icon: <FiClock />
    },
    'failed': {
      color: berryTheme.colors.red500,
      bgColor: berryTheme.colors.red50,
      borderColor: berryTheme.colors.red100,
      icon: <FiXCircle />
    },
    'rejected': {
      color: berryTheme.colors.red500,
      bgColor: berryTheme.colors.red50,
      borderColor: berryTheme.colors.red100,
      icon: <FiXCircle />
    },
    'processing': {
      color: berryTheme.colors.blue500,
      bgColor: berryTheme.colors.blue50,
      borderColor: berryTheme.colors.blue100,
      icon: <FiRefreshCw className="animate-spin" />
    }
  };

  const toggleExpand = (id) => {
    setExpandedTx(expandedTx === id ? null : id);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWithdrawals();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <LoadingContainer>
        <div style={{ display: 'flex', flexDirection: 'column', gap: berryTheme.spacing.small }}>
          {[1, 2, 3].map(i => (
            <LoadingItem key={i} />
          ))}
        </div>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <Title>Withdrawal History</Title>
          <Subtitle>Track all your withdrawal requests</Subtitle>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: berryTheme.spacing.medium }}>
          {adsBalance > 0 && (
            <BalanceBadge>
              <BalanceLabel>Available Balance</BalanceLabel>
              <BalanceValue>${adsBalance.toFixed(3)}</BalanceValue>
            </BalanceBadge>
          )}
          <RefreshButton 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FiRefreshCw style={{ 
              color: berryTheme.colors.grey600,
              animation: refreshing ? 'spin 1s linear infinite' : 'none'
            }} />
          </RefreshButton>
        </div>
      </Header>

      {formattedWithdrawals.length === 0 ? (
        <EmptyState>
          <EmptyIcon />
          <EmptyTitle>No withdrawal history yet</EmptyTitle>
          <EmptyText>Your withdrawal requests will appear here</EmptyText>
        </EmptyState>
      ) : (
        <WithdrawalList>
          {formattedWithdrawals.map((withdrawal) => {
            const status = withdrawal.status;
            const statusInfo = statusConfig[status] || statusConfig.pending;
            const isAdsWithdrawal = withdrawal.balanceType === 'ads';
            const isExpanded = expandedTx === withdrawal.id;

            return (
              <WithdrawalItem 
                key={withdrawal.id || withdrawal.timestamp}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <WithdrawalHeader onClick={() => toggleExpand(withdrawal.id)}>
                  <WithdrawalInfo>
                    <IconContainer style={{
                      backgroundColor: statusInfo.bgColor,
                      borderColor: statusInfo.borderColor
                    }}>
                      <FiDollarSign style={{ color: statusInfo.color }} />
                    </IconContainer>
                    <AmountContainer>
                      <Amount>
                        ${withdrawal.amount?.toFixed(isAdsWithdrawal ? 3 : 2)}
                        {isAdsWithdrawal && <AdsBadge>ADS</AdsBadge>}
                      </Amount>
                      <DateText>{withdrawal.formattedDate}</DateText>
                    </AmountContainer>
                  </WithdrawalInfo>
                  <StatusBadge style={{
                    backgroundColor: statusInfo.bgColor,
                    borderColor: statusInfo.borderColor,
                    color: statusInfo.color
                  }}>
                    {React.cloneElement(statusInfo.icon, { style: { color: statusInfo.color } })}
                    <span style={{ textTransform: 'capitalize' }}>{status}</span>
                  </StatusBadge>
                </WithdrawalHeader>

                {isExpanded && (
                  <DetailsContainer
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DetailsContent>
                      <DetailRow>
                        <DetailLabel>Network:</DetailLabel>
                        <DetailValue>{withdrawal.network || 'N/A'}</DetailValue>
                      </DetailRow>
                      <DetailRow>
                        <DetailLabel>Wallet Address:</DetailLabel>
                        <DetailValue>{withdrawal.walletAddress || 'N/A'}</DetailValue>
                      </DetailRow>
                      {withdrawal.txId && (
                        <DetailRow>
                          <DetailLabel>Transaction:</DetailLabel>
                          <DetailValue>
                            <EtherscanLink
                              href={`https://etherscan.io/tx/${withdrawal.txId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View on Etherscan <FiExternalLink />
                            </EtherscanLink>
                          </DetailValue>
                        </DetailRow>
                      )}
                      <DetailRow>
                        <DetailLabel>Fee:</DetailLabel>
                        <DetailValue>${withdrawal.fee?.toFixed(3) || '0.000'}</DetailValue>
                      </DetailRow>
                    </DetailsContent>
                  </DetailsContainer>
                )}
              </WithdrawalItem>
            );
          })}
        </WithdrawalList>
      )}
    </Container>
  );
}
