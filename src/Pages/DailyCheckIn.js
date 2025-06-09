import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firestore'; // Adjust the import based on your file structure
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useUser } from '../context/userContext';
import { PiLockKeyFill } from 'react-icons/pi';
import { FaCalendarAlt } from 'react-icons/fa';
import { IoCheckmarkCircleSharp, IoClose, IoWarningOutline } from 'react-icons/io5';
import Animate from '../Component/Animate';
import { useNavigate } from 'react-router-dom';

const DailyCheckIn = () => {
  const {
    id,
    showStartOverModal,
    setShowStartOverModal,
    checkinRewards,
    setCheckinRewards,
    showClaimModal,
    setShowClaimModal,
    setLastCheckIn,
    setError,
    error,
    checkInDays = [], // Default to an empty array to prevent undefined errors
    setCheckInDays,
    balance,
    setBalance,
  } = useUser();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [congrats, setCongrats] = useState(false);
  const locations = useNavigate();
  const [backLos, setBackLos] = useState(true);
  const [streak, setStreak] = useState(false);

  const bonusPoints = [500, 1000, 2500, 5000, 15000, 25000, 100000, 500000, 1000000, 5000000, 10000000, 15000000, 20000000, 25000000, 35000000];

  useEffect(() => {
    const handleBackButtonClick = () => {
      locations('/');
      setBackLos(false);
    };

    if (backLos) {
      window.Telegram.WebApp.BackButton.show();
      window.Telegram.WebApp.BackButton.onClick(handleBackButtonClick);
    } else {
      window.Telegram.WebApp.BackButton.hide();
      window.Telegram.WebApp.BackButton.offClick(handleBackButtonClick);
    }

    return () => {
      window.Telegram.WebApp.BackButton.offClick(handleBackButtonClick);
    };
  }, [backLos, setBackLos, locations]);

  const handleDailyCheckIn = async () => {
    if (!id) return;
    setClaiming(true);
    setError(null);
    setShowSuccessModal(false);
    setShowClaimModal(false);
  
    try {
      const userDocRef = doc(db, "telegramUsers", id);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) throw new Error("User data not found.");
  
      const userData = userDoc.data();
      const now = new Date();
      const lastCheckInDate = userData.lastCheckIn?.toDate();
      const currentDayIndex = checkInDays.length || 0; // Prevent undefined
  
      let newStreak = userData.streak || 0;
  
      if (lastCheckInDate) {
        const lastCheckInMidnight = new Date(lastCheckInDate);
        lastCheckInMidnight.setHours(0, 0, 0, 0);
        const todayMidnight = new Date(now);
        todayMidnight.setHours(0, 0, 0, 0);
  
        const daysSinceLastCheckIn = Math.floor(
          (todayMidnight - lastCheckInMidnight) / (1000 * 60 * 60 * 24)
        );
  
        if (daysSinceLastCheckIn === 0) {
          throw new Error("Next check-in is tomorrow!");
        } else if (daysSinceLastCheckIn > 1) {
          setShowStartOverModal(true);
          newStreak = 0; // Reset streak
          await updateDoc(userDocRef, { streak: newStreak });
          return;
        } else {
          newStreak += 1; // Increase streak if checked in consecutively
        }
      } else {
        newStreak = 1; // First-time check-in starts streak
      }
  
      const currentBonus = bonusPoints[currentDayIndex] || 0;
      const newBalance = (userData.balance || 0) + currentBonus;
  
      const updatedCheckInDays =
        currentDayIndex >= bonusPoints.length - 1
          ? [1]
          : [...checkInDays, currentDayIndex + 1];
  
      await updateDoc(userDocRef, {
        lastCheckIn: Timestamp.fromDate(now),
        balance: newBalance,
        checkInDays: updatedCheckInDays,
        checkinRewards: (checkinRewards || 0) + currentBonus,
        streak: newStreak, // Update streak
      });
  
      setCheckInDays(updatedCheckInDays);
      setCheckinRewards((checkinRewards || 0) + currentBonus);
      setShowSuccessModal(true);
      setCongrats(true);
      setTimeout(() => setCongrats(false), 4000);
      setLastCheckIn(now);
      setBalance(newBalance);
      setStreak(newStreak); // Update state
  
    } catch (err) {
      console.error("Error during daily check-in:", err);
      setError(err.message);
    } finally {
      setClaiming(false);
    }
  };
  
  

  const handleStartOver = async () => {
    if (!id) return;
    setClaiming(true);
    setError(null);
    setShowStartOverModal(false);

    try {
      const userDocRef = doc(db, 'telegramUsers', id);
      const now = new Date();
      const currentBonus = bonusPoints[0]; // Bonus for day 1

      await updateDoc(userDocRef, {
        lastCheckIn: Timestamp.fromDate(now),
        balance: balance + currentBonus,
        checkInDays: [1], // Starting over from day 1
        checkinRewards: checkinRewards + currentBonus,
      });
      setCheckinRewards(checkinRewards + currentBonus);
      setShowSuccessModal(true);
      setCongrats(true);
      setTimeout(() => {
        setCongrats(false);
      }, 4000);
      setLastCheckIn(now);
      setBalance(balance + currentBonus);
      setCheckInDays([1]);
    } catch (err) {
      console.error('Error during start over:', err);
      setError(err.message);
    } finally {
      setClaiming(false);
    }
  };

  const formatNumberCliam = (num) => {
    if (num < 100000) {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    } else if (num < 1000000) {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    } else {
      return (num / 1000000).toFixed(2).replace(".", ".") + " M";
    }
  };

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  }, [error, setError]);

  const renderCheckInBoxes = () => {
    if (!Array.isArray(checkInDays) || !Array.isArray(bonusPoints)) {
      return null; // Fallback if arrays are not defined
    }

    return bonusPoints.map((points, index) => {
      const isCurrentDay = index === checkInDays.length;
      const isCheckedIn = checkInDays.includes(index + 1);
      const isLocked = index > checkInDays.length;

      return (
        <button
          key={index}
          disabled={isCheckedIn || isLocked}
          className={`w-[23%] space-y-1 flex flex-col items-center justify-center relative h-[80px] rounded-[8px] cursor-pointer select-none 
            ${isCurrentDay && !isCheckedIn ? 'bg-[#00a6fb] border-[#00a6fb]' : ''}
            ${isCheckedIn ? 'bg-[#00a6fb] border-[#00a6fb] cursor-not-allowed' : ''}
            ${isLocked ? 'bg-[#f0f0f0] border-[#ddd] cursor-not-allowed' : ''}
            ${!isCurrentDay && !isLocked ? 'bg-[#f0f0f0]' : ''}
          `}
          onClick={() => isCurrentDay && !isCheckedIn && handleDailyCheckIn()}
        >
          <h2 className='text-[10px] text-black'>
            {isLocked ? <PiLockKeyFill size={10} className='text-[#666]' /> : `Day ${index + 1}`}
          </h2>
          <img src="/coin.webp" alt='coin' className='w-[16px]' />
          <span className='text-[13px] font-bold text-black'>{formatNumberCliam(points)}</span>
          <span className={`${isCurrentDay ? 'absolute' : 'hidden'} w-[6px] top-1 right-2 h-[6px] bg-white rounded-full ${!isCheckedIn ? 'animate-pulse' : ''}`}></span>
          <span className={`${claiming && isCurrentDay ? 'flex' : 'hidden'} absolute left-0 right-0 top-0 bottom-0 !mt-0 items-center justify-center text-[10px] rounded-[8px] bg-[#414040]`}>
            <em className='animate-pulse not-italic'>Claiming...</em>
          </span>
        </button>
      );
    });
  };

  return (
    <>
      <Animate>
        <div className='w-full flex justify-center flex-col bg-white'>
          <div id="refer" className='w-full flex flex-col scroller h-[100vh] overflow-y-auto pb-[180px] pt-3 px-4'>
            <div className={`w-full flex-col pb-4 flex items-center justify-center text-center pt-4`}>
              <span className='bg-[#f0f0f0] h-[70px] w-[70px] rounded-full flex items-center justify-center'>
                <FaCalendarAlt size={40} className='text-[#00a6fb]' />
              </span>
              <h1 className='text-center font-bold text-[24px] pt-2 text-black'>Daily Check-In Rewards</h1>
              <p className='text-[14px] leading-[24px] text-black'>
                Accrue NEWCATS tokens for logging into the game daily and maintain consistency for reward streaks!
              </p>
            </div>

            <div className="w-full flex justify-center gap-2 flex-wrap">
              {renderCheckInBoxes()}
              <button className='w-[23%] space-y-1 bg-[#f0f0f0] flex flex-col items-center justify-center relative h-[80px] rounded-[8px] cursor-pointer select-none'>
                <h2 className='text-[10px] text-black'>
                  <PiLockKeyFill size={10} className='text-[#666]' />
                </h2>
                <img src="/coin.webp" alt='coin' className='w-[16px]' />
              </button>
            </div>
          </div>

          <div className='w-full absolute top-[50px] flex justify-center z-50 pointer-events-none select-none'>
            {congrats ? (<img src='/congrats.gif' alt="congrats" className="w-[80%]" />) : (<></>)}
          </div>

          <div className={`${showSuccessModal ? "visible" : "invisible"} fixed top-[-12px] claimdiv bottom-0 left-0 z-40 right-0 h-[100vh] bg-[#00000042] flex flex-col justify-center items-center px-4`}>
            <div className={`${showSuccessModal ? "opacity-100 mt-0" : "opacity-0 mt-[100px]"} w-full bg-white rounded-[16px] relative flex flex-col ease-in duration-300 transition-all justify-center p-8`}>
              <div className="w-full flex justify-center flex-col items-center space-y-3">
                <div className="w-full items-center justify-center flex flex-col space-y-2">
                  <IoCheckmarkCircleSharp size={32} className='text-[#00a6fb]' />
                  <p className='font-medium text-black'>Check-in bonus claimed</p>
                </div>
                <h3 className="font-medium text-[24px] text-black pb-2">
                  {streak === true ? (
                    <>
                      <span className='text-[#00a6fb]'>+{formatNumberCliam(bonusPoints[14])}</span> NEWCATS
                    </>
                  ) : (
                    <>
                      <span className='text-[#00a6fb]'>+{formatNumberCliam(bonusPoints[checkInDays.length - 1])}</span> MAX
                    </>
                  )}
                </h3>
                <p className="pb-6 text-[#666] text-[15px] w-full text-center">
                  Daily check-in bonus claimed! <br /> <br />
                  Come back tomorrow to claim another check-in bonus!
                </p>

                <div className="w-full flex justify-center">
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="bg-[#00a6fb] w-full py-[16px] px-6 flex items-center justify-center text-center rounded-[12px] font-medium text-[18px] text-white"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={`${showClaimModal ? 'flex' : 'hidden'} fixed bottom-0 left-0 z-40 right-0 h-[100vh] bg-[#00000042] flex-col justify-end items-center`}>
            <div className={`w-full bg-white shadowtop rounded-tl-[40px] rounded-tr-[40px] relative flex flex-col ease-in duration-300 transition-all justify-center`}>
              <div className="w-full flex taskbg rounded-tl-[40px] rounded-tr-[40px] mt-[2px] justify-center relative flex-col items-center space-y-3 p-4 pt-20 pb-28">
                <button
                  onClick={() => setShowClaimModal(false)}
                  className="flex items-center justify-center h-[32px] w-[32px] rounded-full bg-[#f0f0f0] absolute right-6 top-4 text-center font-medium text-[16px]"
                >
                  <IoClose size={20} className="text-[#666]" />
                </button>

                <div className='w-full bg-[#f0f0f0] rounded-[16px] py-6 relative px-4 flex flex-col justify-center items-center'>
                  <FaCalendarAlt size={34} className='text-[#00a6fb]' />
                  <h3 className="font-medium text-[20px] pt-2 !mt-[2px] text-black">Claim Your Check-In Bonus</h3>
                  <p className="text-[#666] font-medium px-4 pt-1 text-[14px] w-full text-center">
                    Keep your streak alive by claiming your bonus for today!
                  </p>
                </div>

                <div className="w-full flex justify-between items-center gap-2 px-4">
                  <div className="w-[40%] h-[2px] bg-[#ddd]"></div>
                  <span className="text-nowrap text-black">Day {checkInDays.length + 1}</span>
                  <div className="w-[40%] h-[2px] bg-[#ddd]"></div>
                </div>
                <div className="w-full flex justify-center items-center flex-col space-y-2 pb-7">
                  <button
                    onClick={handleDailyCheckIn}
                    className="bg-[#00a6fb] w-full py-[18px] px-6 text-nowrap flex items-center justify-center text-center rounded-[12px] font-semibold text-[17px] text-white"
                  >
                    Claim Bonus!
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={`${showStartOverModal ? 'flex' : 'hidden'} fixed bottom-0 left-0 z-40 right-0 h-[100vh] bg-[#00000042] flex-col justify-end items-center`}>
            <div className={`w-full bg-white shadowtop rounded-tl-[40px] rounded-tr-[40px] relative flex flex-col ease-in duration-300 transition-all justify-center`}>
              <div className="w-full flex taskbg rounded-tl-[40px] rounded-tr-[40px] mt-[2px] justify-center relative flex-col items-center space-y-3 p-4 pt-20 pb-28">
                <button
                  onClick={handleStartOver}
                  className="flex items-center justify-center h-[32px] w-[32px] rounded-full bg-[#f0f0f0] absolute right-6 top-4 text-center font-medium text-[16px]"
                >
                  <IoClose size={20} className="text-[#666]" />
                </button>

                <div className='w-full bg-[#f0f0f0] rounded-[16px] py-6 relative px-4 flex flex-col justify-center items-center'>
                  <FaCalendarAlt size={34} className='text-[#00a6fb]' />
                  <h3 className="font-medium text-[20px] pt-2 !mt-[2px] text-black">Oops! You Missed a Day</h3>
                  <p className="text-[#666] font-medium px-4 pt-1 text-[14px] w-full text-center">
                    Your progress has been reset, and you will start over again! Keep up your streak to earn bigger rewards daily!
                  </p>
                </div>

                <div className="w-full flex justify-center items-center flex-col space-y-2 pb-7 pt-4">
                  <button
                    onClick={handleStartOver}
                    className="bg-[#00a6fb] w-full py-[18px] px-6 text-nowrap flex items-center justify-center text-center rounded-[12px] font-semibold text-[17px] text-white"
                  >
                    Start Over!
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={`${error ? 'fixed' : 'hidden'} z-[60] ease-in duration-300 w-full fixed left-0 right-0 px-4 bottom-24`}>
            <div className="w-full text-red-500 flex items-center space-x-2 px-4 bg-[#fff] h-[50px] rounded-[8px] border border-[#ddd]">
              <IoWarningOutline size={16} />
              <span className="text-[15px]">{error}</span>
            </div>
          </div>
        </div>
      </Animate>
    </>
  );
};

export default DailyCheckIn;
