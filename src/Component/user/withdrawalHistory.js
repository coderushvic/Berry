import { useUser } from '../../context/userContext';
import { FiDollarSign, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './WithdrawalHistory.module.css';

export default function WithdrawalHistory() {
  const { 
    user, // Added user object from context
    allWithdrawals = [],
    adsWithdrawals = [],
    loading,
    balance = 0,
    adsBalance = 0,
    dollarBalance2 = 0,
    checkinRewards = 0,
    refBonus = 0,
    processedReferrals = [],
    fetchWithdrawals
  } = useUser();

  const [formattedWithdrawals, setFormattedWithdrawals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedTx, setExpandedTx] = useState(null);

  // Calculate total referral earnings
const referralEarningsFromProcessed = processedReferrals.reduce((total, referral) => {
  return total + (parseFloat(referral.refBonus) || 0);
}, 0);
  
  const totalReferralEarnings = (parseFloat(refBonus) || 0) + referralEarningsFromProcessed;
  
  // Calculate total revenue (sum of all balance types)
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
      if (!user) return; // Only load if user exists
      setRefreshing(true);
      await fetchWithdrawals();
      setRefreshing(false);
    };
    loadData();
  }, [user, fetchWithdrawals]); // Added user to dependencies

  useEffect(() => {
    if (!user) return; // Only process if user exists

    const combined = [...allWithdrawals, ...adsWithdrawals]
      .filter(w => w && typeof w === 'object' && w.userId === user.id) // Ensure withdrawal belongs to current user
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
  }, [user, allWithdrawals, adsWithdrawals]); // Added user to dependencies

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
    if (!user) return; // Only refresh if user exists
    setRefreshing(true);
    await fetchWithdrawals();
    setRefreshing(false);
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h3 className={styles.emptyTitle}>Please sign in to view your withdrawal history</h3>
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
          <p className={styles.subtitle}>Your personal withdrawal requests</p> {/* Updated subtitle */}
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
            disabled={refreshing || !user} // Disable if no user
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
          <p className={styles.emptyDescription}>When you make withdrawal requests, they will appear here</p>
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
                key={`${withdrawal.id}-${user.id}`} // Include user id in key for uniqueness
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
