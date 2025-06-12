import { useUser } from '../../context/userContext';
import { FiDollarSign, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

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
      color: 'text-green-600',
      icon: <FiCheckCircle className="text-green-600" />
    },
    'approved': {
      color: 'text-green-600',
      icon: <FiCheckCircle className="text-green-600" />
    },
    'pending': {
      color: 'text-yellow-500',
      icon: <FiClock className="text-yellow-500" />
    },
    'failed': {
      color: 'text-red-500',
      icon: <FiXCircle className="text-red-500" />
    },
    'rejected': {
      color: 'text-red-500',
      icon: <FiXCircle className="text-red-500" />
    },
    'processing': {
      color: 'text-blue-500',
      icon: <FiRefreshCw className="text-blue-500 animate-spin" />
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
      <div className="p-6">
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Withdrawal History</h1>
          <p className="text-gray-500">Track all your withdrawal requests</p>
        </div>
        
        <div className="flex items-center gap-3">
          {adsBalance > 0 && (
            <div className="bg-blue-50 px-3 py-1.5 rounded-lg">
              <p className="text-sm text-blue-600">Available Balance</p>
              <p className="font-medium text-blue-700">${adsBalance.toFixed(3)}</p>
            </div>
          )}
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiRefreshCw className={`text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {formattedWithdrawals.length === 0 ? (
        <div className="text-center py-12">
          <FiDollarSign className="mx-auto text-gray-300 text-4xl mb-3" />
          <h3 className="text-lg text-gray-500 mb-1">No withdrawal history yet</h3>
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
                className="bg-white rounded-lg overflow-hidden border border-gray-100"
              >
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(withdrawal.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-50">
                        <FiDollarSign className={`text-lg ${statusInfo.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium text-gray-800">
                            ${withdrawal.amount?.toFixed(isAdsWithdrawal ? 3 : 2)}
                          </p>
                          {isAdsWithdrawal && (
                            <span className="ml-2 text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                              ADS
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {withdrawal.formattedDate}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center px-3 py-1.5 rounded-lg text-sm ${statusInfo.color}`}>
                      {statusInfo.icon}
                      <span className="ml-1.5 capitalize">{status}</span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="px-4 pb-4"
                  >
                    <div className="border-t pt-3 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Network:</span>
                        <span className="text-gray-800">{withdrawal.network || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Wallet Address:</span>
                        <span className="text-gray-800 text-right max-w-xs break-all">
                          {withdrawal.walletAddress || 'N/A'}
                        </span>
                      </div>
                      {withdrawal.txId && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Transaction:</span>
                          <a
                            href={`https://etherscan.io/tx/${withdrawal.txId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            View on Etherscan <FiExternalLink className="ml-1" />
                          </a>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Fee:</span>
                        <span className="text-gray-800">
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
