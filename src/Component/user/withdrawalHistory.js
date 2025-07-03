import { useUser } from '../../context/userContext';
import { FiDollarSign, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function WithdrawalHistory() {
  const { 
    user, // Added user object from context
    allWithdrawals = [],
    adsWithdrawals = [],
    loading,
    adsBalance,
    fetchWithdrawals
  } = useUser();

  const [formattedWithdrawals, setFormattedWithdrawals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedTx, setExpandedTx] = useState(null);

  // Format date without external dependencies
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
    hours = hours ? hours : 12; // Convert 0 to 12
    
    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
  };

  // Fetch and format withdrawals only if user is logged in
  useEffect(() => {
    const loadData = async () => {
      if (!user) return; // Only load if user exists
      setRefreshing(true);
      await fetchWithdrawals();
      setRefreshing(false);
    };
    loadData();
  }, [user, fetchWithdrawals]);

  useEffect(() => {
    if (!user) return; // Only process if user exists

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
  }, [user, allWithdrawals, adsWithdrawals]);

  const statusConfig = {
    'completed': {
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: <FiCheckCircle className="text-green-500" />
    },
    'approved': {
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: <FiCheckCircle className="text-green-500" />
    },
    'pending': {
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      icon: <FiClock className="text-amber-500" />
    },
    'failed': {
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: <FiXCircle className="text-red-500" />
    },
    'rejected': {
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: <FiXCircle className="text-red-500" />
    },
    'processing': {
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: <FiRefreshCw className="text-blue-500 animate-spin" />
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

  // Show sign in prompt if no user
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <FiDollarSign className="mx-auto text-gray-300 text-4xl mb-3" />
          <h3 className="text-lg font-medium text-gray-500">Please sign in to view your withdrawal history</h3>
          <p className="text-gray-400">Sign in to track all your withdrawal requests</p>
        </div>
      </div>
    );
  }

  if (loading && !refreshing) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Withdrawal History</h1>
          <p className="text-gray-500">Track all your withdrawal requests</p>
        </div>
        
        <div className="flex items-center gap-4">
          {adsBalance > 0 && (
            <div className="bg-indigo-50 px-4 py-2 rounded-lg">
              <p className="text-sm text-indigo-600">Available Balance</p>
              <p className="font-semibold">${adsBalance.toFixed(3)}</p>
            </div>
          )}
          <button 
            onClick={handleRefresh}
            disabled={refreshing || !user} // Disable if no user
            className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <FiRefreshCw className={`text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Withdrawals List */}
      {formattedWithdrawals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <FiDollarSign className="mx-auto text-gray-300 text-4xl mb-3" />
          <h3 className="text-lg font-medium text-gray-500">No withdrawal history yet</h3>
          <p className="text-gray-400">Your withdrawal requests will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
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
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => toggleExpand(withdrawal.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${statusInfo.bgColor}`}>
                        <FiDollarSign className={`text-lg ${statusInfo.color}`} />
                      </div>
                      <div>
                        <p className="font-semibold">
                          ${withdrawal.amount?.toFixed(isAdsWithdrawal ? 3 : 2)}
                          {isAdsWithdrawal && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                              ADS
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {withdrawal.formattedDate}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center px-3 py-1 rounded-full text-sm ${statusInfo.bgColor} ${statusInfo.color}`}>
                      {statusInfo.icon}
                      <span className="ml-1 capitalize">{status}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="px-4 pb-4"
                  >
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Network:</span>
                        <span className="font-medium">{withdrawal.network || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Wallet Address:</span>
                        <span className="font-medium text-right max-w-xs break-all">
                          {withdrawal.walletAddress || 'N/A'}
                        </span>
                      </div>
                      {withdrawal.txId && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Transaction:</span>
                          <a
                            href={`https://etherscan.io/tx/${withdrawal.txId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                          >
                            View on Etherscan <FiExternalLink className="ml-1" />
                          </a>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Fee:</span>
                        <span className="font-medium">
                          ${withdrawal.fee?.toFixed(3) || '0.000'}
                        </span>
                      </div>
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
