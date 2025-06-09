import React, { useEffect, useState } from "react";
import styled from 'styled-components';
import { berryTheme } from "../../Theme";
import AccountCheck from "./AccountCheck";
import { useUser } from "../../context/userContext";

const WelcomeContainer = styled.div`
  background: ${berryTheme.colors.backgroundGradient};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
`;

const BerryLogo = styled.img`
  height: 5rem;
  margin-bottom: 1.5rem;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;

const WelcomeContent = styled.div`
  max-width: 500px;
  margin: 0 auto;
`;

const WelcomeIllustration = styled.img`
  width: 100%;
  max-width: 300px;
  margin: 2rem auto;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
`;

const WelcomeTitle = styled.h1`
  font-size: 2.2rem;
  color: ${berryTheme.colors.primary};
  margin-bottom: 1rem;
  font-weight: 700;
`;

const WelcomeMessage = styled.p`
  font-size: 1.1rem;
  color: ${berryTheme.colors.textDark};
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const WelcomeButton = styled.button`
  background: ${berryTheme.colors.primary};
  color: white;
  border: none;
  border-radius: 2rem;
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  
  &:hover {
    background: ${berryTheme.colors.primaryDark};
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  }
`;

const RewardPage = () => {
  const [checking, setChecking] = useState(true);
  const [rewardCheck, setRewardCheck] = useState(true);
  const [accountCheck, setAccountCheck] = useState(false);
  const {balance} = useUser();

  const nextStep = () => {
    setAccountCheck(true);
    setRewardCheck(false);
  };

  const closeStep = () => {
    setChecking(false);
    setAccountCheck(false);
  };

  useEffect(() => {
    if (accountCheck) {
      setTimeout(() => {
        setAccountCheck(false);
        setChecking(false);
      }, 4000);
    }
  },[accountCheck]);

  return (
    <>
      {checking && (
        <WelcomeContainer>
          {rewardCheck && (
            <WelcomeContent>
              <BerryLogo src="/Berry.png" alt="Berry Rewards" />
              <WelcomeTitle>Welcome to Berry! 🎉</WelcomeTitle>
              <WelcomeIllustration src="/berry-welcome.png" alt="Berry Rewards" />
              <WelcomeMessage>
                Berry rewards you for being part of the Telegram ecosystem. 
                Earn tokens for your social activity, community participation, 
                and content engagement - all while using Telegram as you normally would.
              </WelcomeMessage>
              {balance > 0 ? (
                <WelcomeButton onClick={closeStep}>
                  Explore Your Rewards
                </WelcomeButton>
              ) : (
                <WelcomeButton onClick={nextStep}>
                  Claim Your Welcome Bonus
                </WelcomeButton>
              )}
            </WelcomeContent>
          )}

          {accountCheck && <AccountCheck/>}
        </WelcomeContainer>
      )}
    </>
  );
};

export default RewardPage;