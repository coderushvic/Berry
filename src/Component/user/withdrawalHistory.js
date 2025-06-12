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

  // Fetch and format withdrawals
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
      color: 'text-[#10B981]',
      bgColor: 'bg-[#ECFDF5]',
      borderColor: 'border-[#D1FAE5]',
      icon: <FiCheckCircle className="text-[#10B981]" />
    },
    'approved': {
      color: 'text-[#10B981]',
      bgColor: 'bg-[#ECFDF5]',
      borderColor: 'border-[#D1FAE5]',
      icon: <FiCheckCircle className="text-[#10B981]" />
    },
    'pending': {
      color: 'text-[#F59E0B]',
      bgColor: 'bg-[#FFFBEB]',
      borderColor: 'border-[#FEF3C7]',
      icon: <FiClock className="text-[#F59E0B]" />
    },
    'failed': {
      color: 'text-[#EF4444]',
      bgColor: 'bg-[#FEF2F2]',
      borderColor: 'border-[#FEE2E2]',
      icon: <FiXCircle className="text-[#EF4444]" />
    },
    'rejected': {
      color: 'text-[#EF4444]',
      bgColor: 'bg-[#FEF2F2]',
      borderColor: 'border-[#FEE2E2]',
      icon: <FiXCircle className="text-[#EF4444]" />
    },
    'processing': {
      color: 'text-[#3B82F6]',
      bgColor: 'bg-[#EFF6FF]',
      borderColor: 'border-[#DBEAFE]',
      icon: <FiRefreshCw className="text-[#3B82F6] animate-spin" />
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
      <div className="bg-white rounded-[16px] shadow-md p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-[#F3F4F6] rounded-[12px]"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Withdrawal History</h1>
          <p className="text-[#6B7280] mt-1">Track all your withdrawal requests</p>
        </div>
        
        <div className="flex items-center gap-4">
          {adsBalance > 0 && (
            <div className="bg-[#EEF2FF] px-4 py-2 rounded-[12px] border border-[#E0E7FF]">
              <p className="text-sm text-[#4F46E5] font-medium">Available Balance</p>
              <p className="font-bold text-[#4338CA]">${adsBalance.toFixed(3)}</p>
            </div>
          )}
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 bg-white rounded-[12px] shadow-sm hover:bg-[#F9FAFB] transition-colors border border-[#E5E7EB]"
          >
            <FiRefreshCw className={`text-[#4B5563] ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Withdrawals List */}
      {formattedWithdrawals.length === 0 ? (
        <div className="bg-white rounded-[16px] shadow-sm p-8 text-center border border-[#F3F4F6]">
          <FiDollarSign className="mx-auto text-[#D1D5DB] text-5xl mb-4" />
          <h3 className="text-lg font-medium text-[#6B7280] mb-1">No withdrawal history yet</h3>
          <p className="text-[#9CA3AF]">Your withdrawal requests will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
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
                className="bg-white rounded-[12px] shadow-sm overflow-hidden border border-[#F3F4F6]"
              >
                <div 
                  className="p-5 cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                  onClick={() => toggleExpand(withdrawal.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-[12px] ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
                        <FiDollarSign className={`text-xl ${statusInfo.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="font-bold text-[#111827]">
                            ${withdrawal.amount?.toFixed(isAdsWithdrawal ? 3 : 2)}
                          </p>
                          {isAdsWithdrawal && (
                            <span className="ml-2 text-xs px-2 py-1 bg-[#EEF2FF] text-[#4F46E5] rounded-full font-medium">
                              ADS
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#6B7280] mt-1">
                          {withdrawal.formattedDate}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center px-4 py-2 rounded-[12px] text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor} border`}>
                      {statusInfo.icon}
                      <span className="ml-2 capitalize">{status}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="px-5 pb-5"
                  >
                    <div className="border-t border-[#E5E7EB] pt-4 space-y-4">
                      <div className="flex justify-between">
                        <span className="text-[#6B7280]">Network:</span>
                        <span className="font-medium text-[#111827]">{withdrawal.network || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B7280]">Wallet Address:</span>
                        <span className="font-medium text-[#111827] text-right max-w-xs break-all">
                          {withdrawal.walletAddress || 'N/A'}
                        </span>
                      </div>
                      {withdrawal.txId && (
                        <div className="flex justify-between items-center">
                          <span className="text-[#6B7280]">Transaction:</span>
                          <a
                            href={`https://etherscan.io/tx/${withdrawal.txId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#4F46E5] hover:text-[#4338CA] text-sm flex items-center font-medium"
                          >
                            View on Etherscan <FiExternalLink className="ml-1.5" />
                          </a>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-[#6B7280]">Fee:</span>
                        <span className="font-medium text-[#111827]">
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
