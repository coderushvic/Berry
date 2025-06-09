import React, { useEffect, useState } from "react";
import './RewardPage.css';
import AccountCheck from "./AccountCheck";
import { useUser } from "../../context/userContext";

const RewardPage = () => {
  const [checking, setChecking] = useState(true);
  const [rewardCheck, setRewardCheck] = useState(true);
  const [accountCheck, setAccountCheck] = useState(false);
  const {balance} = useUser()


  const nextStep = () => {
    setAccountCheck(true);
    setRewardCheck(false);
  }
  const closeStep = () => {
    setChecking(false);
    setAccountCheck(false);
  }

    useEffect(() => {
      if (accountCheck) {

        setTimeout(() => {
          setAccountCheck(false);
          setChecking(false);
        }, 4000 )
        
      }
    },[accountCheck])

  return (
    <>
 
      {checking && (
    <div className="bg-white !fixed top-0 left-0 right-0 bottom-0 z-[60] flex flex-col">
    {rewardCheck && (
      <div className="reward-container">
      <div className="reward-header">
        <img
          src='/bitget-logo.png' // Replace this URL with your actual logo URL
          alt="Bitget"
          className="reward-logo"
        />
      </div>
      <div className="reward-content">
        <img
          src='/cats-gif.gif' // Replace this URL with the image of the cat in the suitcase
          alt="CatGif"
          className="reward-image"
        />
        <h1 className="reward-title">👋 Hey!</h1>
        <p className="reward-text">You've been in Telegram for a while, <br/> it's time to get rewarded!</p>
      </div>
      {balance > 0 ? (
  <button onClick={closeStep} className="reward-button">Wow, let’s go!</button>
      ) : (
        <button onClick={nextStep} className="reward-button">Wow, let’s go!</button>
      )}
    
    </div>
    )}

    {accountCheck && (
      <AccountCheck/>
    )}

    </div>
  )}
   </>
  );
};

export default RewardPage;