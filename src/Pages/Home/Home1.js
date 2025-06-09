import React from 'react';
import { berryTheme } from '../../Theme';
import styled from 'styled-components';
import NavBar from '../../Component/Nweb/NavBar';
import ReferralSection from '../../Component/Nweb/ReferralSection';
import TaskSection from '../../Component/Nweb/TaskSection';
import VideoRewardsSection from '../../Component/Nweb/VideoRewardsSection';

const AppContainer = styled.div`
  font-family: ${berryTheme.fonts.main};
  background: ${berryTheme.colors.backgroundGradient};
  min-height: 100vh;
  margin: 0 auto;
  position: relative;
  padding-bottom: 80px;
`;

const Content = styled.div`
  padding: ${berryTheme.spacing.medium};
  max-width: 600px;
  margin: 0 auto;
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

const StyledBalanceCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: ${berryTheme.shadows.small};
  margin-bottom: 20px;
  border: 1px solid ${berryTheme.colors.grey200};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      rgba(120, 11, 50, 0.15) 0%,
      rgba(120, 11, 50, 0.1) 50%,
      transparent 70%
    );
    z-index: 0;
    pointer-events: none;
  }
`;

const BalanceContent = styled.div`
  position: relative;
  z-index: 1;
`;

const BalanceAmount = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${berryTheme.colors.primaryDark};
  margin: 8px 0;
  text-shadow: 0 1px 1px rgba(0,0,0,0.05);
`;

const BalanceLabel = styled.div`
  font-size: 0.875rem;
  color: ${berryTheme.colors.textSecondary};
`;

function Home1() {
  return (
    <AppContainer>
      <Header>
        <LogoImage src='/Berry.png' alt="Berry Logo" />
        <LogoText>berry</LogoText>
      </Header>
      <Content>
        <StyledBalanceCard>
          <BalanceContent>
            <BalanceLabel>Available Balance</BalanceLabel>
            <BalanceAmount>${6000.00.toFixed(2)}</BalanceAmount>
          </BalanceContent>
        </StyledBalanceCard>
        <ReferralSection />
        <VideoRewardsSection />
        <TaskSection />
      </Content>
      <NavBar />
    </AppContainer>
  );
}

export default Home1;