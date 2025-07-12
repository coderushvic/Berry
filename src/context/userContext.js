import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  doc, getDoc, setDoc, updateDoc, arrayUnion, 
  getDocs, collection, orderBy, where, query, 
  limit, runTransaction, Timestamp, increment, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firestore';
import YoutubeTasks from '../Component/Alltask/YoutubeTasks';
import * as XLSX from 'xlsx';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  // State declarations (removed balance related states)
  const [adsBalance, setAdsBalance] = useState(0);
  const [dollarBalance2, setDollarBalance2] = useState(0);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingTwo, setLoadingTwo] = useState(true);
  const [refBonus, setRefBonus] = useState(0);
  const [manualTasks, setManualTasks] = useState([]);
  const [advertTasks, setAdvertTasks] = useState([]);
  const [userAdvertTasks, setUserAdvertTasks] = useState([]);
  const [userManualTasks, setUserManualTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [processedReferrals, setProcessedReferrals] = useState([]);
  const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user;
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isAddressSaved, setIsAddressSaved] = useState(false);
  const [checker, setChecker] = useState(false);
  const [taskPoints, setTaskPoints] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [error, setError] = useState(null);
  const [leaderBoard, setLeaderBoard] = useState([]);
  const [activeUserRank, setActiveUserRank] = useState(null);
  const [tonTransactions, setTonTransactions] = useState(0);
  const [tonTasks, setTonTasks] = useState(false);
  const [openInfoThree, setOpenInfoThree] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState({ 
    id: 'selectex', 
    icon: '/exchange.svg', 
    name: 'Select exchange' 
  });
  const [youtubeTasks, setYoutubeTasks] = useState([]);
  const [completedYoutubeTasks, setCompletedYoutubeTasks] = useState([]);
  const [hasVisitedBefore, setHasVisitedBefore] = useState(false);
  const [welcomeBonus, setWelcomeBonus] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [completedDailyTasks, setCompletedDailyTasks] = useState([]);
  const [completedCatTasks, setCompletedCatTasks] = useState([]);
  const [AdTask, setAdTask] = useState([]);
  const [checkInDays, setCheckInDays] = useState([]);
  const [checkinRewards, setCheckinRewards] = useState(0);
  const [showStartOverModal, setShowStartOverModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [streak, setStreak] = useState(0);
  const [adsWatched, setAdsWatched] = useState(0);
  const [dailyAdsWatched, setDailyAdsWatched] = useState(0);
  const [lastAdTimestamp, setLastAdTimestamp] = useState(null);
  const [adHistory, setAdHistory] = useState([]);
  const [videoWatched, setVideoWatched] = useState(0);
  const [lastVideoTime, setLastVideoTime] = useState(null);
  const [allWithdrawals, setAllWithdrawals] = useState([]);
  const [adsWithdrawals, setAdsWithdrawals] = useState([]);
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState({});
  const [isPremium, setIsPremium] = useState(false);
  const [claimedVideos, setClaimedVideos] = useState([]);
  const [lastDailyReward, setLastDailyReward] = useState(null);
  const [lastVideoClaim, setLastVideoClaim] = useState(null);

  // Ad configuration
  const [adsConfig, setAdsConfig] = useState({
    dollarBonus: 1.00,
    dailyLimit: 50,
    premiumDailyLimit: 100,
    cooldown: 20 * 60 * 1000,
    ads: [{
      id: "default_ad",
      scriptSrc: "//whephiwums.com/sdk.js",
      zoneId: "8693006",
      sdkVar: "show_8693006",
      active: true
    }]
  });

  // Helper functions
  const updateActiveTime = useCallback(async (userRef) => {
    try {
      await updateDoc(userRef, {
        lastActive: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating active time:', error);
      setError(error);
    }
  }, []);

  const fetchTopUsers = useCallback(async () => {
    try {
      const CACHE_KEY = 'topUsers';
      const CACHE_DURATION = 10 * 60 * 1000;
      
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`);
      const now = new Date().getTime();

      if (cachedData && cachedTimestamp && now - parseInt(cachedTimestamp) < CACHE_DURATION) {
        return JSON.parse(cachedData);
      }

      const usersRef = collection(db, 'telegramUsers');
      const q = query(usersRef, orderBy('dollarBalance2', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);

      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      localStorage.setItem(CACHE_KEY, JSON.stringify(users));
      localStorage.setItem(`${CACHE_KEY}_timestamp`, now.toString());

      return users;
    } catch (error) {
      console.error('Error fetching top users:', error);
      throw error;
    }
  }, []);

  const handleReferral = useCallback(async (userId, referrerId, username) => {
    if (!referrerId) return;

    try {
      const referrerRef = doc(db, 'telegramUsers', referrerId);
      const referrerDoc = await getDoc(referrerRef);

      if (!referrerDoc.exists()) {
        console.error('Referrer does not exist');
        return;
      }

      const existingReferral = referrerDoc.data().referrals?.find(ref => ref.userId === userId);
      if (existingReferral) {
        console.log('User already referred');
        return;
      }

      const firstDigit = parseInt(userId.toString()[0]);
      const welcomeBonus = firstDigit * 1000;
      const refBonus = welcomeBonus * 0.2;

      await updateDoc(referrerRef, {
        referrals: arrayUnion({
          userId: userId.toString(),
          username: username,
          balance: 0,
          refBonus: refBonus,
          refBonusStatus: 'claimed',
          level: { id: 1, name: "Bronze", imgUrl: "/bronze.webp" },
          hasContributed: false,
        }),
        processedReferrals: arrayUnion({
          userId: userId.toString(),
          refBonus: refBonus,
        }),
        refBonus: increment(refBonus),
        dollarBalance2: increment(refBonus)
      });

      if (referrerId === id) {
        setDollarBalance2(prev => +(prev + refBonus).toFixed(6));
        setRefBonus(prev => prev + refBonus);
      }
    } catch (error) {
      console.error('Error handling referral:', error);
      setError(error);
    }
  }, [id]);

  const fetchWithdrawals = useCallback(async () => {
    try {
      if (!id) return;
      
      const [
        withdrawalsSnapshot,
        adsWithdrawalsSnapshot
      ] = await Promise.all([
        getDocs(query(
          collection(db, 'withdrawalRequests'),
          where('userId', '==', id),
          orderBy('createdAt', 'desc')
        )),
        getDocs(query(
          collection(db, 'adsWithdrawalRequests'),
          where('userId', '==', id),
          orderBy('createdAt', 'desc')
        ))
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
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      setError(error);
    }
  }, [id]);

  // Balance functions (updated to use dollarBalance2 as primary balance)
  const getDisplayBalance = useCallback(() => {
    return {
      total: dollarBalance2.toFixed(2),
      ads: adsBalance.toFixed(2),
      points: dollarBalance2
    };
  }, [adsBalance, dollarBalance2]);

  const getTotalBalance = useCallback(() => {
    return parseFloat(dollarBalance2.toFixed(2));
  }, [dollarBalance2]);

  // Ad statistics function
  const getAdStats = useCallback(() => {
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    
    const todaysAds = adHistory.filter(ad => 
      ad.timestamp?.toDate ? ad.timestamp.toDate() >= today : new Date(ad.timestamp) >= today
    );
    
    const dailyLimit = isPremium ? adsConfig.premiumDailyLimit : adsConfig.dailyLimit;
    
    return {
      totalAdsWatched: adsWatched,
      dailyAdsWatched: todaysAds.length || dailyAdsWatched,
      dailyLimit,
      remainingToday: Math.max(0, dailyLimit - (todaysAds.length || dailyAdsWatched)),
      lastAdTime: lastAdTimestamp,
      adHistory
    };
  }, [adsWatched, dailyAdsWatched, lastAdTimestamp, adHistory, isPremium, adsConfig]);

  // Export function using XLSX
  const exportApprovedWithdrawals = useCallback(() => {
    try {
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
    } catch (error) {
      console.error('Error exporting withdrawals:', error);
      setError(error);
    }
  }, [allWithdrawals, adsWithdrawals]);

  // Reward functions (updated to remove balance updates)
  const checkAndResetDailyAds = useCallback(() => {
    const now = new Date();
    const lastMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    
    if (!lastAdTimestamp || lastAdTimestamp < lastMidnight) {
      setDailyAdsWatched(0);
      return true;
    }
    return false;
  }, [lastAdTimestamp]);

  const recordAdWatch = useCallback(async (adData) => {
    if (!id) throw new Error('User not authenticated');
    
    checkAndResetDailyAds();
    
    const now = new Date();
    const userRef = doc(db, 'telegramUsers', id);
    
    try {
      const result = await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("User does not exist");
        
        const userData = userDoc.data();
        const currentDailyCount = userData.dailyAdsWatched || 0;
        const dailyLimit = userData.isPremium ? 
          adsConfig.premiumDailyLimit : adsConfig.dailyLimit;
        
        if (currentDailyCount >= dailyLimit) {
          throw new Error("Daily ad limit reached");
        }
        
        const newAdEntry = {
          adId: adData.adId,
          timestamp: serverTimestamp(),
          dollarsEarned: adsConfig.dollarBonus,
          status: 'completed'
        };
        
        transaction.update(userRef, {
          adsWatched: increment(1),
          dailyAdsWatched: increment(1),
          lastAdTimestamp: serverTimestamp(),
          adHistory: arrayUnion(newAdEntry),
          adsBalance: increment(adsConfig.dollarBonus)
        });

        return {
          success: true,
          amount: adsConfig.dollarBonus,
          dailyCount: currentDailyCount + 1
        };
      });
      
      setAdsWatched(prev => prev + 1);
      setDailyAdsWatched(prev => prev + 1);
      setLastAdTimestamp(now);
      setAdHistory(prev => [...prev, {
        adId: adData.adId,
        timestamp: now,
        dollarsEarned: adsConfig.dollarBonus,
        status: 'completed'
      }]);
      setAdsBalance(prev => +(prev + adsConfig.dollarBonus).toFixed(6));
      
      return result;
    } catch (error) {
      console.error("Error recording ad watch:", error);
      throw error;
    }
  }, [id, adsConfig, checkAndResetDailyAds]);

  const watchVideo = useCallback(async (videoId) => {
    if (!id) throw new Error('User not authenticated');
    const rewardAmount = 2.00;

    try {
      const userRef = doc(db, 'telegramUsers', id);
      
      const result = await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("User does not exist");

        const userClaimedVideos = userDoc.data().claimedVideos || [];
        if (userClaimedVideos.includes(videoId)) {
          throw new Error("Reward for this video already claimed");
        }

        const now = new Date();
        const lastVideoTime = userDoc.data().lastVideoTime?.toDate();
        
        if (lastVideoTime) {
          const hoursSinceLastWatch = (now - lastVideoTime) / (1000 * 60 * 60);
          if (hoursSinceLastWatch < 1) {
            throw new Error(`Please wait ${Math.ceil(60 - (hoursSinceLastWatch * 60))} minutes before watching another video`);
          }
        }

        transaction.update(userRef, {
          dollarBalance2: increment(rewardAmount),
          videoWatched: increment(1),
          lastVideoTime: serverTimestamp(),
          claimedVideos: arrayUnion(videoId),
          lastVideoClaim: serverTimestamp()
        });

        return { 
          success: true, 
          amount: rewardAmount,
          videoId
        };
      });

      setDollarBalance2(prev => +(prev + rewardAmount).toFixed(2));
      setVideoWatched(prev => prev + 1);
      setLastVideoTime(new Date());
      setClaimedVideos(prev => [...prev, videoId]);
      setLastVideoClaim(new Date());

      return result;
    } catch (error) {
      console.error('Error in watchVideo:', error);
      return { success: false, error: error.message };
    }
  }, [id]);

  const claimDailyReward = useCallback(async () => {
    if (!id) throw new Error('User not authenticated');
    const rewardAmount = 5.00;

    try {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      const userRef = doc(db, 'telegramUsers', id);
      
      const result = await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("User does not exist");

        const lastClaim = userDoc.data().lastDailyReward?.toDate();
        const lastClaimDate = lastClaim ? new Date(lastClaim) : null;
        
        if (lastClaimDate) {
          lastClaimDate.setHours(0, 0, 0, 0);
          
          if (lastClaimDate.getTime() === today.getTime()) {
            throw new Error("Daily reward already claimed today");
          }
          
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastClaimDate.getTime() === yesterday.getTime()) {
            transaction.update(userRef, { streak: increment(1) });
          } else if (lastClaimDate.getTime() < yesterday.getTime()) {
            transaction.update(userRef, { streak: 1 });
          }
        }

        transaction.update(userRef, {
          dollarBalance2: increment(rewardAmount),
          lastDailyReward: serverTimestamp(),
          checkinRewards: increment(rewardAmount),
          checkInDays: arrayUnion(now.toISOString().split('T')[0])
        });

        return { 
          success: true, 
          amount: rewardAmount,
          claimedAt: now,
          streak: (userDoc.data().streak || 0) + 1
        };
      });

      setDollarBalance2(prev => +(prev + rewardAmount).toFixed(2));
      setLastDailyReward(now);
      setCheckinRewards(prev => prev + rewardAmount);
      setCheckInDays(prev => [...prev, now.toISOString().split('T')[0]]);
      setStreak(result.streak);
      
      return result;
    } catch (error) {
      console.error('Error claiming daily reward:', error);
      return { success: false, error: error.message };
    }
  }, [id]);

  const addRewards = useCallback(async (amount, type = 'main', options = {}) => {
    if (!id) throw new Error('User not authenticated');
    
    try {
      const userRef = doc(db, 'telegramUsers', id);
      const now = new Date();
      
      const result = await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("User does not exist");

        const updateData = {};
        const claimId = options.claimId || `${type}-${now.getTime()}`;
        
        if (options.preventDuplicate && userDoc.data().processedClaims?.includes(claimId)) {
          throw new Error("Reward already claimed");
        }

        switch (type) {
          case 'main':
            updateData.dollarBalance2 = increment(amount);
            break;
          case 'ads':
            updateData.adsBalance = increment(amount);
            updateData.adsWatched = increment(1);
            updateData.lastAdTimestamp = serverTimestamp();
            break;
          case 'video':
            updateData.dollarBalance2 = increment(amount);
            updateData.videoWatched = increment(1);
            updateData.lastVideoTime = serverTimestamp();
            
            if (options.videoId) {
              if (userDoc.data().claimedVideos?.includes(options.videoId)) {
                throw new Error("Video reward already claimed");
              }
              updateData.claimedVideos = arrayUnion(options.videoId);
              updateData.lastVideoClaim = serverTimestamp();
            }
            break;
          default:
            throw new Error(`Invalid reward type: ${type}`);
        }

        if (options.preventDuplicate) {
          updateData.processedClaims = arrayUnion(claimId);
        }

        transaction.update(userRef, updateData);

        return {
          success: true,
          amount,
          type
        };
      });

      switch (type) {
        case 'main':
          setDollarBalance2(prev => +(prev + amount).toFixed(2));
          break;
        case 'ads':
          setAdsBalance(prev => +(prev + amount).toFixed(6));
          setAdsWatched(prev => prev + 1);
          setLastAdTimestamp(now);
          break;
        case 'video':
          setDollarBalance2(prev => +(prev + amount).toFixed(2));
          setVideoWatched(prev => prev + 1);
          setLastVideoTime(now);
          
          if (options.videoId) {
            setClaimedVideos(prev => [...prev, options.videoId]);
            setLastVideoClaim(now);
          }
          break;
        default:
          console.error(`Unknown reward type: ${type}`);
          throw new Error(`Invalid reward type: ${type}`);
      }

      return result;
    } catch (error) {
      console.error('Error adding rewards:', error);
      return { success: false, error: error.message };
    }
  }, [id]);

  // Data fetching (updated to remove balance calculation)
  const fetchData = useCallback(async (userId) => {
    if (!userId) return;

    try {
      const userRef = doc(db, 'telegramUsers', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Set all states (removed balance calculation)
        setAdsBalance(userData.adsBalance || 0);
        setDollarBalance2(userData.dollarBalance2 || 0);
        setAdsWatched(userData.adsWatched || 0);
        setDailyAdsWatched(userData.dailyAdsWatched || 0);
        setVideoWatched(userData.videoWatched || 0);
        setLastAdTimestamp(userData.lastAdTimestamp?.toDate() || null);
        setLastVideoTime(userData.lastVideoTime?.toDate() || null);
        setAdHistory(userData.adHistory || []);
        setClaimedVideos(userData.claimedVideos || []);
        setLastDailyReward(userData.lastDailyReward?.toDate() || null);
        setLastVideoClaim(userData.lastVideoClaim?.toDate() || null);
        setIsPremium(userData.isPremium || false);
        setUsername(userData.username || '');
        setTonTasks(userData.tonTasks || false);
        setWelcomeBonus(userData.welcomeBonus || 0);
        setTonTransactions(userData.tonTransactions || 0);
        setSelectedExchange(userData.selectedExchange || { 
          id: 'selectex', 
          icon: '/exchange.svg', 
          name: 'Select exchange' 
        });
        setWalletAddress(userData.address || '');
        setIsAddressSaved(userData.isAddressSaved || false);
        setCompletedDailyTasks(userData.dailyTasksCompleted || []);
        setCompletedCatTasks(userData.catsAndFriends || []);
        setTaskPoints(userData.taskPoints || 0);
        setCompletedYoutubeTasks(userData.completedYoutubeTasks || []);
        setFullName(userData.fullName || '');
        setId(userData.userId || '');
        setStreak(userData.streak || 0);
        setLastCheckIn(userData.lastCheckIn?.toDate() || null);
        setCheckInDays(userData.checkInDays || []);
        setCheckinRewards(userData.checkinRewards || 0);

        const totalReferralBonus = userData.processedReferrals?.reduce(
          (total, referral) => total + (referral.refBonus || 0), 0
        ) || 0;
        setRefBonus(totalReferralBonus);

        setCompletedTasks(userData.tasksCompleted || []);
        setUserManualTasks(userData.manualTasks || []);
        setUserAdvertTasks(userData.advertTasks || []);
        setReferrals(userData.referrals || []);
        setProcessedReferrals(userData.processedReferrals || []);

        const adsConfigDoc = await getDoc(doc(db, 'adminConfig', 'adsSettings'));
        if (adsConfigDoc.exists()) {
          setAdsConfig(adsConfigDoc.data());
        }

        const topUsersData = await fetchTopUsers();
        setLeaderBoard(topUsersData);

        const usersAboveQuery = query(
          collection(db, 'telegramUsers'),
          where('dollarBalance2', '>', userData.dollarBalance2 || 0)
        );
        const querySnapshot = await getDocs(usersAboveQuery);
        setActiveUserRank(querySnapshot.size + 1);

        const [
          manualTasksSnapshot,
          advertTasksSnapshot,
          youtubeTasksSnapshot,
          tasksSnapshot,
          dailyTasksSnapshot,
          adTaskSnapshot
        ] = await Promise.all([
          getDocs(collection(db, 'manualTasks')),
          getDocs(collection(db, 'advertTasks')),
          getDocs(collection(db, 'youtubeTasks')),
          getDocs(collection(db, 'tasks')),
          getDocs(collection(db, 'dailyTasks')),
          getDocs(collection(db, 'manualTasks'))
        ]);

        setManualTasks(manualTasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setAdvertTasks(advertTasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setYoutubeTasks(youtubeTasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setTasks(tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setDailyTasks(dailyTasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setAdTask(adTaskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const totalUsersDoc = await getDoc(doc(db, 'data', 'allUsersCount'));
        if (totalUsersDoc.exists()) {
          setTotalUsers(totalUsersDoc.data().count || 0);
        }

        await updateActiveTime(userRef);
        await fetchWithdrawals();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error);
    }
  }, [fetchTopUsers, updateActiveTime, fetchWithdrawals]);

  const sendUserData = useCallback(async () => {
    const queryParams = new URLSearchParams(window.location.search);
    let referrerId = queryParams.get("ref");
    if (referrerId) referrerId = referrerId.replace(/\D/g, "");

    if (telegramUser) {
      const { id: userId, username, first_name: firstName, last_name: lastName } = telegramUser;
      const finalUsername = username || `${firstName}_${userId}`;
      const fullNamed = `${firstName} ${lastName || ''}`.trim();

      try {
        const userRef = doc(db, 'telegramUsers', userId.toString());
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          await fetchData(userId.toString());
          setInitialized(true);
          return;
        }

        const firstDigit = parseInt(userId.toString()[0]);
        const welcomeBonus = firstDigit * 1000;

        const userData = {
          userId: userId.toString(),
          username: finalUsername,
          firstName: firstName,
          lastName: lastName || '',
          fullName: fullNamed,
          selectedExchange: { id: 'selectex', icon: '/exchange.svg', name: 'Choose exchange' },
          tonTransactions: 0,
          walletConnected: false,
          initialConnectionDone: false,
          tonTasks: false,
          taskPoints: 0,
          checkinRewards: 0,
          adsBalance: 0,
          dollarBalance2: welcomeBonus,
          adsWatched: 0,
          dailyAdsWatched: 0,
          videoWatched: 0,
          lastAdTimestamp: null,
          lastVideoTime: null,
          lastVideoClaim: null,
          lastDailyReward: null,
          adHistory: [],
          claimedVideos: [],
          lastActive: Timestamp.now(),
          refereeId: referrerId || null,
          referrals: [],
          processedReferrals: [],
          welcomeBonus: welcomeBonus,
          refBonus: 0,
          streak: 0,
          isPremium: false,
          dailyTasksCompleted: [],
          catsAndFriends: []
        };

        await setDoc(userRef, userData);
        setCheckinRewards(0);

        const allUsersCountRef = doc(db, 'data', 'allUsersCount');
        await runTransaction(db, async (transaction) => {
          const allUsersCountDoc = await transaction.get(allUsersCountRef);
          if (!allUsersCountDoc.exists()) {
            transaction.set(allUsersCountRef, { count: 1 });
          } else {
            transaction.update(allUsersCountRef, { count: allUsersCountDoc.data().count + 1 });
          }
        });

        setWelcomeBonus(welcomeBonus);
        setId(userId.toString());

        if (referrerId) {
          await handleReferral(userId, referrerId, finalUsername);
        }

        setInitialized(true);
        await fetchData(userId.toString());
      } catch (error) {
        console.error('Error saving user:', error);
        setError(error);
      }
    }
  }, [telegramUser, fetchData, handleReferral]);

  // Effects (updated to use dollarBalance2 instead of balance)
  useEffect(() => {
    if (id) {
      const visited = localStorage.getItem('hasVisitedBefore');
      setHasVisitedBefore((dollarBalance2 > 0) && !!visited);
      setChecker(!((dollarBalance2 > 0) && !!visited));
      if (!visited) localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, [id, dollarBalance2]);

  useEffect(() => {
    const checkLastCheckIn = async () => {
      if (!id) return;

      try {
        const userDoc = await getDoc(doc(db, 'telegramUsers', id));
        if (userDoc.exists()) {
          const lastCheckInDate = userDoc.data().lastCheckIn?.toDate();
          const now = new Date();

          if (lastCheckInDate) {
            const lastCheckInLocal = new Date(lastCheckInDate.getTime() + lastCheckInDate.getTimezoneOffset() * 60000);
            lastCheckInLocal.setHours(0, 0, 0, 0);
            
            const todayMidnight = new Date(now);
            todayMidnight.setHours(0, 0, 0, 0);
            
            const daysSinceLastCheckIn = Math.floor((todayMidnight - lastCheckInLocal) / (1000 * 60 * 60 * 24));

            if (daysSinceLastCheckIn === 0) {
              setError('You have already checked in today. Next check-in is tomorrow.');
            } else if (daysSinceLastCheckIn === 1) {
              setShowClaimModal(true);
            } else if (daysSinceLastCheckIn > 1) {
              setShowStartOverModal(true);
            }
          } else {
            setShowClaimModal(true);
          }
        }
      } catch (err) {
        console.error('Check-in error:', err);
        setError('Error checking last check-in');
      }
    };

    checkLastCheckIn();
  }, [id]);

  useEffect(() => {
    sendUserData();
  }, [sendUserData]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      checkAndResetDailyAds();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [checkAndResetDailyAds]);

  return (
    <UserContext.Provider value={{
      // State values (removed balance related values)
      balanceDetails: getDisplayBalance(),
      adsBalance,
      dollarBalance2,
      id,
      loading,
      loadingTwo,
      refBonus,
      manualTasks,
      advertTasks,
      userAdvertTasks,
      userManualTasks,
      tasks,
      completedTasks,
      referrals,
      processedReferrals,
      fullName,
      username,
      walletAddress,
      isAddressSaved,
      checker,
      taskPoints,
      lastCheckIn,
      error,
      leaderBoard,
      activeUserRank,
      tonTransactions,
      tonTasks,
      openInfoThree,
      initialized,
      selectedExchange,
      youtubeTasks,
      completedYoutubeTasks,
      hasVisitedBefore,
      welcomeBonus,
      totalUsers,
      dailyTasks,
      completedDailyTasks,
      completedCatTasks,
      AdTask,
      checkInDays,
      checkinRewards,
      showStartOverModal,
      showClaimModal,
      streak,
      adsWatched,
      dailyAdsWatched,
      lastAdTimestamp,
      adHistory,
      videoWatched,
      lastVideoTime,
      allWithdrawals,
      adsWithdrawals,
      isProcessingWithdrawal,
      isPremium,
      claimedVideos,
      lastDailyReward,
      lastVideoClaim,
      adsConfig,

      // State setters (removed setBalance)
      setAdsBalance,
      setDollarBalance2,
      setId,
      setLoading,
      setLoadingTwo,
      setRefBonus,
      setManualTasks,
      setAdvertTasks,
      setUserAdvertTasks,
      setUserManualTasks,
      setTasks,
      setCompletedTasks,
      setReferrals,
      setProcessedReferrals,
      setFullName,
      setUsername,
      setWalletAddress,
      setIsAddressSaved,
      setChecker,
      setTaskPoints,
      setLastCheckIn,
      setError,
      setLeaderBoard,
      setActiveUserRank,
      setTonTransactions,
      setTonTasks,
      setOpenInfoThree,
      setInitialized,
      setSelectedExchange,
      setYoutubeTasks,
      setCompletedYoutubeTasks,
      setHasVisitedBefore,
      setWelcomeBonus,
      setTotalUsers,
      setDailyTasks,
      setCompletedDailyTasks,
      setCompletedCatTasks,
      setAdTask,
      setCheckInDays,
      setCheckinRewards,
      setShowStartOverModal,
      setShowClaimModal,
      setStreak,
      setAdsWatched,
      setDailyAdsWatched,
      setLastAdTimestamp,
      setAdHistory,
      setVideoWatched,
      setLastVideoTime,
      setAllWithdrawals,
      setAdsWithdrawals,
      setIsProcessingWithdrawal,
      setIsPremium,
      setClaimedVideos,
      setLastDailyReward,
      setLastVideoClaim,
      setAdsConfig,

      // Components
      YoutubeTasks,

      // Functions
      getDisplayBalance,
      getTotalBalance,
      sendUserData,
      handleReferral,
      addRewards,
      watchVideo,
      fetchWithdrawals,
      recordAdWatch,
      getAdStats,
      exportApprovedWithdrawals,
      checkAndResetDailyAds,
      claimDailyReward,
      fetchTopUsers,
      updateActiveTime
    }}>
      {children}
    </UserContext.Provider>
  );
};
