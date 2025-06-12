import React from 'react';
import TonTask from './TonTask';
import PaymentStars2 from '../TelegramStars/paymentstar2';
import DailyRewardCard from '../../Pages/DailyRewardCard';
import GameButton from '../../Pages/GameButton';
import AdTask from '../Adsgram/AdTask';
import AdsPage from '../../Pages/ads/adsPage';
import AdsTask1 from '../../Pages/ads/AdsTask1';
import Userdashcard from '../../Pages/Userdashcard';


function Dailytask() {
  return (
    <>

       <Userdashcard/>
       <GameButton/>
       <AdTask/>
       <AdsPage/>
       <AdsTask1/>
       <TonTask/>
       <DailyRewardCard/>
       <PaymentStars2 />
    </>

  );
}

export default Dailytask;
