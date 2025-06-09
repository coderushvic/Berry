import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/userContext';
import { doc, Timestamp, updateDoc } from '@firebase/firestore';
import { db } from '../../firebase/firestore';

const AccountCheck = () => {

  // eslint-disable-next-line
  const [awardedPoint, setAwardedPoint] = useState(0);
  const {id, setLastCheckIn, setBalance, setWelcomeBonus} = useUser()


  const [progress, setProgress] = useState({
    accountAge: 0,
    activityLevel: 0,
    telegramPremium: 0,
    ogStatus: 0,
  });

  const awardPointsNotPrem = async () => {
    // Get the first digit of the user ID
    const firstDigit = parseInt(id.toString()[0]);
  
    // Calculate points to award based on the first digit
    const pointsToAward = firstDigit * 1000;
    // Calculate the new balance
    const newBalance = pointsToAward;
  
    try {
      const now = new Date();
      const userRef = doc(db, 'telegramUsers', id.toString());
      await updateDoc(userRef, {
        balance: newBalance,
        welcomeBonus: pointsToAward, // Assuming you want to track the points awarded for years separately
        lastCheckIn: Timestamp.fromDate(now),

      });
      setTimeout(() => {
        setBalance(newBalance);
      }, 3800)

      setAwardedPoint(pointsToAward);
      setLastCheckIn(now);
      setWelcomeBonus(pointsToAward);
    } catch (error) {
      console.error('Error updating user points:', error);
    }
  };

  useEffect(() => {
    if (id) {
        awardPointsNotPrem();
    }
  // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    const intervals = {
      accountAge: setInterval(() => updateProgress('accountAge'), 140),
      activityLevel: setInterval(() => updateProgress('activityLevel'), 100),
      telegramPremium: setInterval(() => updateProgress('telegramPremium'), 120),
      ogStatus: setInterval(() => updateProgress('ogStatus'), 160),
    };

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, []);

  const updateProgress = (key) => {
    setProgress((prev) => {
      if (prev[key] >= 100) {
        return prev;
      }
      return { ...prev, [key]: prev[key] + 5 };
    });
  };

  return (
    
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <img src='/bitget-logo.png' alt="Bitget" style={{ width: '50px', marginBottom: '20px' }} />
      <h1 style={{ marginBottom: '40px', fontSize: '28px', fontWeight: 'bold', marginTop: '20px' }}>
        Checking <br /> your account
      </h1>

      {['Account Age Verified', 'Activity Level Analyzed', 'Telegram Premium Checked', 'OG Status Confirmed'].map(
        (label, index) => {
          const key = Object.keys(progress)[index];
          return (
            <div key={key} style={{ marginBottom: '30px', width: '80%', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '19px' }}>
                <div style={{ textAlign: 'left', marginBottom: '-24px' }}>{label}</div>
                <img
                  src={progress[key] === 100 ? '/blueCheckmark.png' : '/grayCheckmark.png'} // Conditionally render gray or blue checkmark
                  alt="Checkmark"
                  style={{ width: '24px', height: '24px', marginLeft: '10px' }}
                />
              </div>
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <div
                  style={{
                    background: '#E3F2FD', // Light blue background for unfilled part
                    borderRadius: '10px',
                    width: '100%',
                    height: '15px',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      background: '#1877F2', // Blue for filled part of the progress bar
                      height: '100%',
                      width: `${progress[key]}%`,
                      borderRadius: '10px',
                      transition: 'width 0.5s ease-in-out',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
};

export default AccountCheck;