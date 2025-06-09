import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../context/userContext';
import { FiCheck, FiX, FiClock, FiDollarSign, FiUser, FiCreditCard, FiGlobe, FiSearch, FiDownload } from 'react-icons/fi';
import { db } from '../../firebase/firestore';
import { collection, query, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import * as XLSX from 'xlsx';

export default function AdminWithdrawals() {
  const { loading = false } = useUser() || {};
  const [allWithdrawals, setAllWithdrawals] = useState([]);
  const [adsWithdrawals, setAdsWithdrawals] = useState([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [isProcessing, setIsProcessing] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [withdrawalType, setWithdrawalType] = useState('all');

  const applyFilters = useCallback((withdrawals, statusFilter, searchTerm, typeFilter) => {
    let result = [...withdrawals];

    if (statusFilter !== 'all') {
      result = result.filter(w => w.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      result = result.filter(w => w.balanceType === typeFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(w => 
        w.userId?.toLowerCase().includes(term) || 
        w.username?.toLowerCase().includes(term) ||
        w.fullName?.toLowerCase().includes(term) ||
        w.walletAddress?.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => b.createdAt - a.createdAt);
    setFilteredWithdrawals(result);
  }, []);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const [withdrawalsSnapshot, adsWithdrawalsSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'withdrawalRequests'), orderBy('createdAt', 'desc'))),
          getDocs(query(collection(db, 'adsWithdrawalRequests'), orderBy('createdAt', 'desc')))
        ]);

        const processSnapshot = (snapshot, type) => snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          balanceType: type,
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        }));

        const withdrawalsData = processSnapshot(withdrawalsSnapshot, 'main');
        const adsWithdrawalsData = processSnapshot(adsWithdrawalsSnapshot, 'ads');

        setAllWithdrawals(withdrawalsData);
        setAdsWithdrawals(adsWithdrawalsData);
        applyFilters([...withdrawalsData, ...adsWithdrawalsData], filter, searchTerm, withdrawalType);
      } catch (error) {
        console.error('Error fetching withdrawals:', error);
      }
    };

    fetchWithdrawals();
  }, [applyFilters, filter, searchTerm, withdrawalType]);

  useEffect(() => {
    const combinedWithdrawals = [...allWithdrawals, ...adsWithdrawals];
    applyFilters(combinedWithdrawals, filter, searchTerm, withdrawalType);
  }, [filter, searchTerm, withdrawalType, allWithdrawals, adsWithdrawals, applyFilters]);

  const updateStatus = async (id, status, isAdsWithdrawal = false) => {
    setIsProcessing(prev => ({ ...prev, [id]: true }));
    try {
      const collectionName = isAdsWithdrawal ? 'adsWithdrawalRequests' : 'withdrawalRequests';
      await updateDoc(doc(db, collectionName, id), {
        status,
        updatedAt: new Date()
      });
      
      const updateState = isAdsWithdrawal ? setAdsWithdrawals : setAllWithdrawals;
      updateState(prev => prev.map(w => 
        w.id === id ? { ...w, status, updatedAt: new Date() } : w
      ));
    } catch (error) {
      console.error('Error updating withdrawal:', error);
    } finally {
      setIsProcessing(prev => ({ ...prev, [id]: false }));
    }
  };

  const exportApprovedWithdrawals = () => {
    const approvedWithdrawals = [...allWithdrawals, ...adsWithdrawals]
      .filter(w => w.status === 'approved')
      .map(w => ({
        'User ID': w.userId,
        'Username': w.username,
        'Full Name': w.fullName,
        'Wallet Address': w.walletAddress,
        'Amount (USD)': w.amount?.toFixed(3) || '0.000',
        'Fee (USD)': w.fee?.toFixed(3) || '0.000',
        'Total (USD)': w.totalDeducted?.toFixed(3) || '0.000',
        'Network': w.network,
        'Exchange': w.exchange,
        'Balance Type': w.balanceType === 'ads' ? 'ADS' : 'MAIN',
        'Created At': w.createdAt ? new Date(w.createdAt).toLocaleString() : 'N/A',
        'Updated At': w.updatedAt ? new Date(w.updatedAt).toLocaleString() : 'N/A',
        'Status': w.status
      }));

    if (approvedWithdrawals.length === 0) {
      alert('No approved withdrawals to export');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(approvedWithdrawals);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Approved Withdrawals');
    
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `approved_withdrawals_${dateStr}.xlsx`);
  };

  const statusConfig = {
    pending: { color: 'text-yellow-600 bg-yellow-100', icon: <FiClock /> },
    approved: { color: 'text-green-600 bg-green-100', icon: <FiCheck /> },
    rejected: { color: 'text-red-600 bg-red-100', icon: <FiX /> },
    processing: { color: 'text-blue-600 bg-blue-100', icon: <FiClock /> }
  };

  const getStatusStyle = (status) => statusConfig[status] || statusConfig.pending;

  const formatDate = (date) => date ? new Date(date).toLocaleString() : 'N/A';

  const getBalanceTypeBadge = (balanceType) => balanceType ? (
    <span style={styles.balanceTypeBadge}>
      {balanceType === 'ads' ? 'ADS' : 'MAIN'}
    </span>
  ) : null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Withdrawal Requests</h3>
        <div style={styles.controls}>
          <div style={styles.searchContainer}>
            <FiSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by user ID, name, or wallet"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.filterGroup}>
            <select 
              value={withdrawalType}
              onChange={(e) => setWithdrawalType(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Types</option>
              <option value="main">Main Balance</option>
              <option value="ads">Ads Balance</option>
            </select>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Statuses</option>
            </select>
            <button 
              onClick={exportApprovedWithdrawals}
              style={styles.exportButton}
            >
              <FiDownload style={styles.icon} />
              Export Approved
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          Loading withdrawals...
        </div>
      ) : filteredWithdrawals.length === 0 ? (
        <div style={styles.emptyState}>
          No {filter === 'all' ? '' : filter} withdrawals found
        </div>
      ) : (
        <div style={styles.withdrawalsList}>
          {filteredWithdrawals.map((w) => {
            const statusStyle = getStatusStyle(w.status);
            const isAdsWithdrawal = w.balanceType === 'ads';
            
            return (
              <div key={w.id} style={styles.withdrawalCard}>
                <div style={styles.withdrawalHeader}>
                  <div style={styles.userInfo}>
                    <div style={styles.userId}>
                      <FiUser style={styles.icon} />
                      {w.fullName || w.username || w.userId || 'Unknown User'}
                      {getBalanceTypeBadge(w.balanceType)}
                    </div>
                    <div style={styles.walletInfo}>
                      <FiCreditCard style={styles.icon} />
                      {w.walletAddress || 'No wallet address'}
                    </div>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    ...styles[statusStyle.color]
                  }}>
                    {statusStyle.icon}
                    {w.status || 'pending'}
                  </span>
                </div>

                <div style={styles.withdrawalDetails}>
                  <div style={styles.detailRow}>
                    <FiDollarSign style={styles.icon} />
                    <span style={styles.detailLabel}>Amount:</span>
                    <span style={styles.detailValue}>${w.amount?.toFixed(3) || '0.000'}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <FiDollarSign style={{...styles.icon, opacity: 0}} />
                    <span style={styles.detailLabel}>Fee:</span>
                    <span style={styles.detailValue}>${w.fee?.toFixed(3) || '0.000'}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <FiDollarSign style={{...styles.icon, opacity: 0}} />
                    <span style={styles.detailLabel}>Total:</span>
                    <span style={styles.detailValue}>${w.totalDeducted?.toFixed(3) || '0.000'}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <FiGlobe style={styles.icon} />
                    <span style={styles.detailLabel}>Payment Method:</span>
                    <span style={styles.detailValue}>{w.network || 'N/A'}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <FiCreditCard style={styles.icon} />
                    <span style={styles.detailLabel}>Exchange:</span>
                    <span style={styles.detailValue}>{w.exchange || 'N/A'}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <FiClock style={styles.icon} />
                    <span style={styles.detailLabel}>Created:</span>
                    <span style={styles.detailValue}>{formatDate(w.createdAt)}</span>
                  </div>
                  {w.updatedAt && (
                    <div style={styles.detailRow}>
                      <FiClock style={styles.icon} />
                      <span style={styles.detailLabel}>Updated:</span>
                      <span style={styles.detailValue}>{formatDate(w.updatedAt)}</span>
                    </div>
                  )}
                </div>

                {(w.status === 'pending' || w.status === 'processing') && (
                  <div style={styles.actionButtons}>
                    {w.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(w.id, 'processing', isAdsWithdrawal)}
                        disabled={isProcessing[w.id]}
                        style={{
                          ...styles.button,
                          ...styles.processButton,
                          ...(isProcessing[w.id] ? styles.buttonDisabled : {})
                        }}
                      >
                        {isProcessing[w.id] ? 'Processing...' : 'Mark as Processing'}
                      </button>
                    )}
                    <button
                      onClick={() => updateStatus(w.id, 'approved', isAdsWithdrawal)}
                      disabled={isProcessing[w.id]}
                      style={{
                        ...styles.button,
                        ...styles.approveButton,
                        ...(isProcessing[w.id] ? styles.buttonDisabled : {})
                      }}
                    >
                      {isProcessing[w.id] ? 'Processing...' : w.status === 'processing' ? 'Mark as Completed' : 'Approve'}
                    </button>
                    <button
                      onClick={() => updateStatus(w.id, 'rejected', isAdsWithdrawal)}
                      disabled={isProcessing[w.id]}
                      style={{
                        ...styles.button,
                        ...styles.rejectButton,
                        ...(isProcessing[w.id] ? styles.buttonDisabled : {})
                      }}
                    >
                      {isProcessing[w.id] ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '20px'
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827'
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px'
  },
  searchContainer: {
    flex: 1,
    minWidth: '250px',
    position: 'relative'
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9CA3AF'
  },
  searchInput: {
    width: '100%',
    padding: '10px 15px 10px 35px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  filterSelect: {
    padding: '10px 15px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: 'white',
    fontSize: '14px'
  },
  exportButton: {
    padding: '10px 15px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#059669'
    }
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '20px',
    color: '#6b7280'
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(0,0,0,0.1)',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  emptyState: {
    padding: '20px',
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  },
  withdrawalsList: {
    display: 'grid',
    gap: '16px'
  },
  withdrawalCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  withdrawalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f3f4f6',
    flexWrap: 'wrap',
    gap: '10px'
  },
  userInfo: {
    flex: 1,
    minWidth: '200px'
  },
  userId: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '500',
    color: '#111827',
    marginBottom: '8px'
  },
  walletInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#4b5563',
    wordBreak: 'break-all'
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  balanceTypeBadge: {
    marginLeft: '8px',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#e5e7eb',
    color: '#374151'
  },
  withdrawalDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '12px',
    marginBottom: '16px'
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px'
  },
  detailLabel: {
    color: '#6b7280'
  },
  detailValue: {
    fontWeight: '500',
    color: '#111827'
  },
  icon: {
    minWidth: '16px',
    color: '#6b7280'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
    flexWrap: 'wrap'
  },
  button: {
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  processButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    ':hover': {
      backgroundColor: '#2563eb'
    }
  },
  approveButton: {
    backgroundColor: '#10b981',
    color: 'white',
    ':hover': {
      backgroundColor: '#059669'
    }
  },
  rejectButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    ':hover': {
      backgroundColor: '#dc2626'
    }
  },
  buttonDisabled: {
    opacity: '0.7',
    cursor: 'not-allowed',
    ':hover': {
      backgroundColor: 'inherit'
    }
  },
  'text-yellow-600 bg-yellow-100': {
    color: '#92400e',
    backgroundColor: '#fef3c7'
  },
  'text-green-600 bg-green-100': {
    color: '#065f46',
    backgroundColor: '#d1fae5'
  },
  'text-red-600 bg-red-100': {
    color: '#b91c1c',
    backgroundColor: '#fee2e2'
  },
  'text-blue-600 bg-blue-100': {
    color: '#1e40af',
    backgroundColor: '#dbeafe'
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  }
};
