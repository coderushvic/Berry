import { useUser } from '../../context/userContext';
import { 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiRefreshCw, 
  FiDollarSign, 
  FiCalendar,
  FiCreditCard,
  FiArrowLeft
} from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer/Footer';

export default function StatusTracker() {
  const { 
    loading,
    allWithdrawals = [],
    adsWithdrawals = [],
    isProcessingWithdrawal,
    fetchWithdrawals
  } = useUser();
  
  const navigate = useNavigate();
  const [formattedWithdrawals, setFormattedWithdrawals] = useState([]);

  // Status configuration matching AdminWithdrawals
  const statusConfig = {
    pending: {
      class: 'text-yellow-600 bg-yellow-100',
      icon: <FiClock />
    },
    approved: {
      class: 'text-green-600 bg-green-100',
      icon: <FiCheckCircle />
    },
    rejected: {
      class: 'text-red-600 bg-red-100',
      icon: <FiXCircle />
    },
    processing: {
      class: 'text-blue-600 bg-blue-100',
      icon: <FiRefreshCw />
    },
    default: {
      class: 'text-gray-600 bg-gray-100',
      icon: <FiClock />
    }
  };

  // Fetch withdrawals on component mount
  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  // Format and combine withdrawals (similar to WithdrawalHistory)
  useEffect(() => {
    const combined = [...allWithdrawals, ...adsWithdrawals]
      .filter(w => w && typeof w === 'object')
      .map(w => ({
        ...w,
        status: (w.status || 'pending').toLowerCase(),
        createdAt: w.createdAt?.toDate?.() || new Date(w.createdAt || w.date || w.timestamp),
        balanceType: w.balanceType || (adsWithdrawals.some(aw => aw.id === w.id) ? 'ads' : 'main')
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    setFormattedWithdrawals(combined);
  }, [allWithdrawals, adsWithdrawals]);

  const getStatusConfig = (status) => {
    return statusConfig[status?.toLowerCase()] || statusConfig.default;
  };

  if (loading || isProcessingWithdrawal) {
    return (
      <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
        <div style={styles.card}>
          <div style={styles.header}>
            <button onClick={() => navigate('/userdash')} style={styles.backButton}>
              <FiArrowLeft style={styles.backIcon} />
              Back to Dashboard
            </button>
            <h4 style={styles.title}>Withdrawal Status</h4>
          </div>
          <div style={styles.skeleton}></div>
          <div style={styles.skeleton}></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (formattedWithdrawals.length === 0) {
    return (
      <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
        <div style={styles.card}>
          <div style={styles.header}>
            <button onClick={() => navigate('/userdashboard')} style={styles.backButton}>
              <FiArrowLeft style={styles.backIcon} />
              Back to Dashboard
            </button>
            <h4 style={styles.title}>Withdrawal Status</h4>
          </div>
          <p style={styles.emptyState}>No withdrawal history found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const latestWithdrawal = formattedWithdrawals[0];
  const statusInfo = getStatusConfig(latestWithdrawal.status);
  const isAdsWithdrawal = latestWithdrawal.balanceType === 'ads';

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
      <div style={styles.card}>
        <div style={styles.header}>
          <button onClick={() => navigate('/userdashboard')} style={styles.backButton}>
            <FiArrowLeft style={styles.backIcon} />
            Back to Dashboard
          </button>
          <h4 style={styles.title}>Latest Withdrawal</h4>
        </div>
        
        <div style={styles.statusRow}>
          <span style={styles.label}>Status:</span>
          <span style={{
            ...styles.statusBadge,
            ...styles[statusInfo.class]
          }}>
            {statusInfo.icon}
            {latestWithdrawal.status}
            {isAdsWithdrawal && (
              <span style={styles.balanceTypeBadge}>ADS</span>
            )}
          </span>
        </div>

        {latestWithdrawal.amount !== undefined && (
          <div style={styles.detailRow}>
            <FiDollarSign style={styles.icon} />
            <span style={styles.label}>Amount:</span>
            <span style={styles.value}>
              ${latestWithdrawal.amount?.toFixed(isAdsWithdrawal ? 3 : 2)} {isAdsWithdrawal ? '' : 'NEWCATS'}
            </span>
          </div>
        )}

        {latestWithdrawal.createdAt && (
          <div style={styles.detailRow}>
            <FiCalendar style={styles.icon} />
            <span style={styles.label}>Date:</span>
            <span style={styles.value}>
              {latestWithdrawal.createdAt.toLocaleString()}
            </span>
          </div>
        )}

        {latestWithdrawal.walletAddress && (
          <div style={styles.detailRow}>
            <FiCreditCard style={styles.icon} />
            <span style={styles.label}>Wallet:</span>
            <span style={{...styles.value, ...styles.walletAddress}}>
              {latestWithdrawal.walletAddress}
            </span>
          </div>
        )}

        {latestWithdrawal.network && (
          <div style={styles.detailRow}>
            <span style={styles.label}>Network:</span>
            <span style={styles.value}>
              {latestWithdrawal.network}
            </span>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

const styles = {
  card: {
    padding: '16px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    margin: '20px',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  header: {
    position: 'relative',
    marginBottom: '20px',
    paddingTop: '10px'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#334155',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    ':hover': {
      backgroundColor: '#f1f5f9',
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }
  },
  backIcon: {
    fontSize: '18px',
    color: '#64748b'
  },
  title: {
    margin: '0 auto',
    width: 'fit-content',
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    padding: '10px 0'
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    fontSize: '14px'
  },
  label: {
    color: '#6b7280',
    minWidth: '60px'
  },
  value: {
    fontWeight: '500',
    color: '#111827',
    wordBreak: 'break-word'
  },
  walletAddress: {
    fontSize: '13px',
    fontFamily: 'monospace'
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
    marginLeft: '6px',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: '#e5e7eb',
    color: '#374151'
  },
  icon: {
    minWidth: '16px',
    color: '#6b7280'
  },
  emptyState: {
    color: '#6b7280',
    fontStyle: 'italic',
    margin: '8px 0',
    textAlign: 'center'
  },
  skeleton: {
    height: '20px',
    backgroundColor: '#f3f4f6',
    borderRadius: '4px',
    margin: '8px 0',
    animation: 'pulse 1.5s infinite ease-in-out'
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
  '@keyframes pulse': {
    '0%, 100%': { opacity: 0.6 },
    '50%': { opacity: 0.3 }
  }
};
