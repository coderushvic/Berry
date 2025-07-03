import { useUser } from '../../context/userContext';
import { FiDollarSign, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './WithdrawalHistory.module.css';

export default function WithdrawalHistory() {
  const { 
    id, // Using id directly from user context
    allWithdrawals = [],
    adsWithdrawals = [],
    loading,
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
    
    if (id) { // Only load data if we have a user ID
      loadData();
    }
  }, [fetchWithdrawals, id]); // Added id to dependencies

  useEffect(() => {
    // Combine and format withdrawals - no need to filter by user ID anymore
    const combined = [...allWithdrawals, ...adsWithdrawals]
      .map(w => {
        const txId = w.txId || w.transactionId || w.hash || null;
        const date = w.createdAt?.toDate?.() || new Date(w.createdAt || w.date || w.timestamp);
        
        const balanceType = w.balanceType || (adsWithdrawals.some(aw => aw.id === w.id) ? 'ads' : 'main');
        
        return {
          ...w,
          status: w.status?.toLowerCase() || 'pending',
          createdAt: date,
          balanceType,
          txId,
          formattedDate: formatDate(date),
          amount: parseFloat(w.amount) || 0,
          fee: parseFloat(w.fee) || 0
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);

    setFormattedWithdrawals(combined);
  }, [allWithdrawals, adsWithdrawals]); // Removed user from dependencies

  const statusConfig = {
    'completed': {
      icon: <FiCheckCircle className={styles.completed} />,
      color: styles.completed
    },
    'approved': {
      icon: <FiCheckCircle className={styles.completed} />,
      color: styles.completed
    },
    'pending': {
      icon: <FiClock className={styles.pending} />,
      color: styles.pending
    },
    'failed': {
      icon: <FiXCircle className={styles.failed} />,
      color: styles.failed
    },
    'rejected': {
      icon: <FiXCircle className={styles.failed} />,
      color: styles.failed
    },
    'processing': {
      icon: <FiRefreshCw className={`${styles.processing} ${styles.skeletonPulse}`} />,
      color: styles.processing
    }
  };

  const toggleExpand = (id) => {
    setExpandedTx(expandedTx === id ? null : id);
  };

  const handleRefresh = async () => {
    if (!id) return; // Don't refresh if no user ID
    setRefreshing(true);
    await fetchWithdrawals();
    setRefreshing(false);
  };

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
          <p className={styles.subtitle}>Your withdrawal requests</p>
        </div>
        
        <div className={styles.amountContainer}>
          <button 
            onClick={handleRefresh}
            disabled={refreshing || !id} // Disable if no user ID
            className={styles.refreshButton}
          >
            <FiRefreshCw className={`${refreshing ? styles.skeletonPulse : ''}`} />
          </button>
        </div>
      </div>

      {formattedWithdrawals.length === 0 ? (
        <div className={styles.emptyState}>
          <FiDollarSign className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>
            {id ? 'No withdrawal history yet' : 'Please sign in to view withdrawals'}
          </h3>
          <p className={styles.emptyDescription}>
            {id ? 'Your withdrawal requests will appear here' : 'Sign in to see your transaction history'}
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
                key={withdrawal.id || withdrawal.timestamp}
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
                    <div className={`${styles.statusIcon} ${statusInfo.color}`}>
                      <FiDollarSign className={statusInfo.color} />
                    </div>
                    <div>
                      <div className={styles.amountContainer}>
                        <p className={styles.detailValue}>
                          ${withdrawal.amount.toFixed(isAdsWithdrawal ? 3 : 2)}
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
                  <div className={`${styles.statusBadge} ${statusInfo.color}`}>
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
                      <span className={styles.detailLabel}>Status:</span>
                      <span className={`${styles.detailValue} ${statusInfo.color}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
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
                        ${withdrawal.fee.toFixed(3)}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Total Deducted:</span>
                      <span className={styles.detailValue}>
                        ${(withdrawal.amount + withdrawal.fee).toFixed(3)}
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
