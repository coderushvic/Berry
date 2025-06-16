import { useUser } from '../../context/userContext';
import { FiDollarSign, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './WithdrawalHistory.module.css';

export default function WithdrawalHistory() {
  const { 
    user,
    allWithdrawals = [],
    adsWithdrawals = [],
    loading,
    balance = 0,
    adsBalance = 0,
    dollarBalance2 = 0,
    checkinRewards = 0,
    refBonus = 0,
    processedReferrals = [],
    fetchWithdrawals,
    initTelegramAuth,
    telegramUser
  } = useUser();

  const [formattedWithdrawals, setFormattedWithdrawals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedTx, setExpandedTx] = useState(null);
  const [telegramInitData, setTelegramInitData] = useState(null);
  const [isTelegramApp, setIsTelegramApp] = useState(false);

  // Initialize Telegram WebApp
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setIsTelegramApp(true);
      tg.expand();
      setTelegramInitData(tg.initData || tg.initDataUnsafe);
      
      if (tg.initDataUnsafe?.user) {
        console.log('Telegram user opened withdrawal history', {
          userId: tg.initDataUnsafe.user.id,
          firstName: tg.initDataUnsafe.user.first_name,
          lastName: tg.initDataUnsafe.user.last_name
        });
      }

      if (tg.initDataUnsafe?.user && !user) {
        initTelegramAuth(tg.initDataUnsafe.user);
      }
    }
  }, [initTelegramAuth, user]);

  // Fixed referral earnings calculation
  const referralEarningsFromProcessed = processedReferrals.reduce((total, referral) => {
  return total + (parseFloat(referral.refBonus) || 0);  // Added missing closing parenthesis
}, 0);
  
  const totalReferralEarnings = (parseFloat(refBonus) || 0) + referralEarningsFromProcessed;
  
  const totalRevenue = parseFloat(balance) + parseFloat(adsBalance) + parseFloat(dollarBalance2) + 
                     parseFloat(checkinRewards) + totalReferralEarnings;

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
      if (!user && !telegramUser) return;
      setRefreshing(true);
      await fetchWithdrawals();
      setRefreshing(false);
    };
    loadData();
  }, [user, telegramUser, fetchWithdrawals]);

  useEffect(() => {
    if (!user && !telegramUser) return;

    const combined = [...allWithdrawals, ...adsWithdrawals]
      .filter(w => w && typeof w === 'object' && 
             (w.userId === user?.id || w.userId === telegramUser?.id))
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
  }, [user, telegramUser, allWithdrawals, adsWithdrawals]);

  const statusConfig = {
    'completed': {
      icon: <FiCheckCircle className={styles.completed} />
    },
    'approved': {
      icon: <FiCheckCircle className={styles.completed} />
    },
    'pending': {
      icon: <FiClock className={styles.pending} />
    },
    'failed': {
      icon: <FiXCircle className={styles.failed} />
    },
    'rejected': {
      icon: <FiXCircle className={styles.failed} />
    },
    'processing': {
      icon: <FiRefreshCw className={`${styles.processing} ${styles.skeletonPulse}`} />
    }
  };

  const toggleExpand = (id) => {
    setExpandedTx(expandedTx === id ? null : id);
  };

  const handleRefresh = async () => {
    if (!user && !telegramUser) return;
    setRefreshing(true);
    await fetchWithdrawals();
    setRefreshing(false);
  };

  if ((!user && !telegramUser) && !loading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h3 className={styles.emptyTitle}>Please sign in to view your withdrawal history</h3>
          {isTelegramApp && (
            <p className={styles.emptyDescription}>
              {telegramInitData ? 'Completing Telegram authentication...' : 'Waiting for Telegram connection...'}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (loading && !refreshing) {
    return (
      <div className={styles.container}>
        <div className={styles.skeletonPulse}>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.skeletonItem}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Withdrawal History</h1>
          <p className={styles.subtitle}>
            {isTelegramApp ? 'Your Telegram withdrawal requests' : 'Your withdrawal requests'}
          </p>
        </div>
        
        <div className={styles.amountContainer}>
          {totalRevenue > 0 && (
            <div className={styles.balanceCard}>
              <p className={styles.balanceLabel}>Available Balance</p>
              <p className={styles.balanceValue}>${totalRevenue.toFixed(3)}</p>
            </div>
          )}
          <button 
            onClick={handleRefresh}
            disabled={refreshing || (!user && !telegramUser)}
            className={styles.refreshButton}
          >
            <FiRefreshCw className={`${refreshing ? styles.skeletonPulse : ''}`} />
          </button>
        </div>
      </div>

      {formattedWithdrawals.length === 0 ? (
        <div className={styles.emptyState}>
          <FiDollarSign className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No withdrawal history yet</h3>
          <p className={styles.emptyDescription}>
            {isTelegramApp ? 
              'Your Telegram withdrawal requests will appear here' : 
              'Your withdrawal requests will appear here'}
          </p>
        </div>
      ) : (
        <div className={styles.withdrawalList}>
          {formattedWithdrawals.map((withdrawal) => {
            const status = withdrawal.status;
            const statusInfo = statusConfig[status] || statusConfig.pending;
            const isAdsWithdrawal = withdrawal.balanceType === 'ads';
            const isExpanded = expandedTx === withdrawal.id;

            return (
              <motion.div 
                key={`${withdrawal.id}-${user?.id || telegramUser?.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={styles.withdrawalCard}
              >
                <div 
                  className={styles.withdrawalHeader}
                  onClick={() => toggleExpand(withdrawal.id)}
                >
                  <div className={styles.amountContainer}>
                    <div className={`${styles.statusIcon} ${styles[status]}`}>
                      <FiDollarSign className={styles[status]} />
                    </div>
                    <div>
                      <div className={styles.amountContainer}>
                        <p className={styles.detailValue}>
                          ${withdrawal.amount?.toFixed(isAdsWithdrawal ? 3 : 2)}
                        </p>
                        {isAdsWithdrawal && (
                          <span className={styles.adsBadge}>
                            ADS
                          </span>
                        )}
                      </div>
                      <p className={styles.subtitle}>
                        {withdrawal.formattedDate}
                      </p>
                    </div>
                  </div>
                  <div className={`${styles.statusBadge} ${styles[status]}`}>
                    {statusInfo.icon}
                    <span className="ml-2 capitalize">{status}</span>
                  </div>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className={styles.detailsContainer}
                  >
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Network:</span>
                      <span className={styles.detailValue}>{withdrawal.network || 'N/A'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Wallet Address:</span>
                      <span className={styles.detailValue}>
                        {withdrawal.walletAddress || 'N/A'}
                      </span>
                    </div>
                    {withdrawal.txId && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Transaction:</span>
                        <a
                          href={`https://etherscan.io/tx/${withdrawal.txId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.externalLink}
                        >
                          View on Etherscan <FiExternalLink className="ml-1.5" />
                        </a>
                      </div>
                    )}
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Fee:</span>
                      <span className={styles.detailValue}>
                        ${withdrawal.fee?.toFixed(3) || '0.000'}
                      </span>
                    </div>
                    {isTelegramApp && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Source:</span>
                        <span className={styles.detailValue}>Telegram Mini App</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
