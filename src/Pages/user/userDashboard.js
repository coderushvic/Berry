// =========================================== 
// File: src/pages/user/userDashboard.js
// ===========================================

import { useUser } from '../../context/userContext';
import BalanceCard from '../../Component/user/balanceCard';
import WithdrawalHistory from '../../Component/user/withdrawalHistory';
import NavBar from '../../Component/Nweb/NavBar';
import { berryTheme } from '../../Theme';
import styled from 'styled-components';

const AppContainer = styled.div`
  font-family: ${berryTheme.fonts.main};
  background: ${berryTheme.colors.backgroundGradient};
  min-height: 100vh;
  max-width: auto;
  margin: 0 auto;
  position: relative;
  padding-bottom: 80px; // Space for nav
`;

const Content = styled.div`
  padding: ${berryTheme.spacing.medium};
`;

const Header = styled.header`
  padding: ${berryTheme.spacing.large} ${berryTheme.spacing.medium} ${berryTheme.spacing.medium};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${berryTheme.spacing.small};
`;

const LogoImage = styled.img`
  height: 36px;
  width: auto;
`;

const LogoText = styled.span`
  font-size: 1.5rem;
  font-weight: ${berryTheme.fonts.bold};
  color: ${berryTheme.colors.primary};
`;

const DashboardContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const WelcomeText = styled.span`
  font-size: 14px;
  color: ${berryTheme?.colors?.textSecondary || '#666666'};
  display: block;
  margin-bottom: 16px;
`;

export default function UserDashboard() {
  const { user, loading } = useUser();

  return (
    <AppContainer>
      <Header>
        <LogoImage src='/Berry.png' alt="Berry Logo" />
        <LogoText>berry</LogoText>
      </Header>
      
      <Content>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading your dashboard...</p>
          </div>
        ) : (
          <DashboardContent>
            {user?.username && (
              <WelcomeText>Welcome, {user.username}</WelcomeText>
            )}

            {/* Top Section - Balance Card */}
            <div style={styles.topSection}>
              <BalanceCard />
            </div>
            
            {/* Bottom Section - Withdrawal History */}
            <div style={styles.bottomSection}>
              <WithdrawalHistory />
            </div>
          </DashboardContent>
        )}
      </Content>
      <NavBar />
    </AppContainer>
  );
}

const styles = {
  topSection: {
    backgroundColor: berryTheme?.colors?.cardBackground || '#ffffff',
    borderRadius: '16px',
    boxShadow: berryTheme?.shadows?.card || '0 2px 8px rgba(0,0,0,0.05)',
    padding: '20px'
  },
  bottomSection: {
    backgroundColor: berryTheme?.colors?.cardBackground || '#ffffff',
    borderRadius: '16px',
    boxShadow: berryTheme?.shadows?.card || '0 2px 8px rgba(0,0,0,0.05)',
    padding: '20px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    backgroundColor: berryTheme?.colors?.cardBackground || '#ffffff',
    borderRadius: '12px',
    boxShadow: berryTheme?.shadows?.card || '0 1px 3px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '0 auto'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(0,0,0,0.1)',
    borderTopColor: berryTheme?.colors?.primary || '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  loadingText: {
    fontSize: '16px',
    color: berryTheme?.colors?.textSecondary || '#6b7280',
    margin: 0
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  },
  '@media (max-width: 480px)': {
    topSection: {
      padding: '16px'
    },
    bottomSection: {
      padding: '16px'
    }
  }
};