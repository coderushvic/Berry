import React, { useState, useEffect } from "react";
import { RiAdvertisementFill } from "react-icons/ri";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { doc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useUser } from "../../context/userContext";

const Taskss = () => {
  const {
    id,
    setBalance,
    setTaskPoints,
    completedDailyTasks,
    setCompletedDailyTasks,
  } = useUser();

  const [adWatched, setAdWatched] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [congrats, setCongrats] = useState(false);
  const [showAdCooldown, setShowAdCooldown] = useState(0);
  const [isAdLoading, setIsAdLoading] = useState(false);

  const task = {
    bonus: 1000,
  };

  const generateTaskId = () => `adTask_${new Date().getTime()}`;
  const [taskId, setTaskId] = useState(generateTaskId());

  // Initialize the ad script using useEffect
  useEffect(() => {
    if (window.show_8693006) {
      return;
    }

    const tag = document.createElement("script");
    tag.src = "//niphaumeenses.net/vignette.min.js";
    tag.dataset.zone = "8693006";
    tag.dataset.sdk = "show_8693006";

    document.body.appendChild(tag);
  }, []);

  const showAd = async () => {
    if (!window.show_8693006) {
      console.error("Ad script not loaded yet.");
      return;
    }

    setIsAdLoading(true);

    try {
      await window.show_8693006();
      handleAdCompletion();
    } catch (error) {
      console.error("Error showing ad:", error);
    } finally {
      setIsAdLoading(false);
    }
  };

  const handleAdCompletion = () => {
    setAdWatched(true);
    setShowAdCooldown(59);
    const countdown = setInterval(() => {
      setShowAdCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const claimReward = async () => {
    if (completedDailyTasks.includes(taskId)) {
      alert("You have already claimed this reward.");
      return;
    }

    if (!adWatched) {
      alert("You need to watch an ad before claiming the reward.");
      return;
    }

    setClaiming(true);
    try {
      const userDocRef = doc(db, "telegramUsers", id);
      await updateDoc(userDocRef, {
        balance: increment(task.bonus),
        dailyTasksCompleted: arrayUnion(taskId),
        taskPoints: increment(task.bonus),
      });

      setBalance((prev) => prev + task.bonus);
      setCompletedDailyTasks((prev) => [...prev, taskId]);
      setTaskPoints((prev) => prev + task.bonus);

      setAdWatched(false);
      setCongrats(true);

      setTimeout(() => setCongrats(false), 4000);
      setTaskId(generateTaskId());
    } catch (error) {
      console.error("Error claiming reward:", error);
      alert("An error occurred while claiming your reward. Please try again.");
    } finally {
      setClaiming(false);
    }
  };

  const styles = {
    outerContainer: {
      backgroundColor: 'black', // Full-width black background
      width: '100%', // Ensures it spans the entire width
      paddingTop: '20px', // Added padding to the top
    },
    container: {
      maxWidth: '380px', // Width for the content area
      margin: '0 auto', // Center the content within the black background
      padding: '0 16px', // Optional padding for smaller screens
    },
    listItem: {
      display: 'flex',
      height: '72px',
      minHeight: '72px',
      alignItems: 'center',
    },
    media: {
      width: '37px',
      minWidth: '37px',
      height: '37px',
      marginRight: '14px',
      borderRadius: '50%',
      overflow: 'hidden',
      flexShrink: 0,
      backgroundColor: '#323232',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      overflow: 'hidden',
    },
    after: {
      marginLeft: 'auto',
      paddingLeft: '14px',
      fontSize: '16px',
      fontWeight: '590',
      lineHeight: '21px',
      whiteSpace: 'nowrap',
    },
    title: {
      fontSize: '15px',
      fontWeight: '590',
      lineHeight: '20px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: '#ffffff',
    },
    footer: {
      fontSize: '15px',
      fontWeight: '590',
      lineHeight: '20px',
      color: '#a6a6a6',
    },
    button: {
      backgroundColor: '#282828',
      color: '#fff',
      userSelect: 'none',
      transition: 'background-color ease 0.3s',
      cursor: 'pointer',
      padding: '0 16px',
      fontSize: '14px',
      height: '36px',
      minHeight: '36px',
      minWidth: '64px',
      borderRadius: '9999px',
      textAlign: 'center',
      fontWeight: '590',
      border: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2px',
    },
  };    

  return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        <div style={styles.listItem}>
          <div style={styles.media}>
            <RiAdvertisementFill size={20} color="white" />
          </div>
          <div style={styles.body}>
            <div style={styles.title}>Watch an Ad to Earn {task.bonus} NEWCATS</div>
            <div style={styles.footer}>+{task.bonus} NEWCATS</div>
          </div>
          <div style={styles.after}>
            {!adWatched ? (
              <button
                onClick={showAd}
                disabled={showAdCooldown > 0 || isAdLoading}
                style={{
                  ...styles.button,
                  backgroundColor:
                    showAdCooldown > 0 || isAdLoading ? "#888" : "#282828",
                }}
              >
                {isAdLoading
                  ? "Loading..."
                  : showAdCooldown > 0
                  ? `Wait ${showAdCooldown}s`
                  : "Show Ad"}
              </button>
            ) : (
              <button
                onClick={claimReward}
                disabled={claiming}
                style={{
                  ...styles.button,
                  ...styles.claimButton,
                  backgroundColor: claiming ? "#888" : "#4CAF50",
                }}
              >
                {claiming ? "Claiming..." : "Claim Reward"}
              </button>
            )}
          </div>
        </div>
        {congrats && (
          <div style={styles.successMessage}>
            <IoCheckmarkCircleSharp size={20} /> Meow! Task Completed 🐈‍⬛
          </div>
        )}
      </div>
    </div>
  );
};

export default Taskss;
