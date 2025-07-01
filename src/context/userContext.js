import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  doc, getDoc, setDoc, updateDoc, arrayUnion, 
  getDocs, collection, orderBy, where, query, 
  limit, runTransaction, Timestamp, increment, serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/firestore';
import YoutubeTasks from '../Component/Alltask/YoutubeTasks';
import * as XLSX from 'xlsx';

const UserContext = createContext();

// Helper function for cache key generation
const getEssentialDataCacheKey = (userId) => `essentialData_${userId}`;

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  // State declarations (all original states preserved)
  const [balance, setBalance] = useState(0);
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
  
  // Ad tracking configuration
  const [adsConfig, setAdsConfig] = useState({
    pointsBonus: 1,
    dollarBonus: 1,
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

  // Cache configuration
  const CACHE_KEY = 'topUsers';
  const CACHE_DURATION = 10 * 60 * 1000;
  const CACHE_TTL = 5 * 60 * 1000;

  // Fixed firebaseOperationWithRetry with recursive implementation
  const firebaseOperationWithRetry = async (operation, maxRetries = 2, delay = 1000) => {
    let attempt = 0;
    
    const executeOperation = async () => {
      try {
        return await operation();
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        return executeOperation();
      }
    };

    return executeOperation();
  };

  // Balance calculations
  const getDisplayBalance = useCallback(() => {
    return {
      total: ((balance / 1000) + adsBalance + dollarBalance2).toFixed(2),
      available: dollarBalance2.toFixed(2),
      ads: adsBalance.toFixed(2),
      points: balance
    };
  }, [balance, adsBalance, dollarBalance2]);

  const getTotalBalance = useCallback(() => {
    return parseFloat(getDisplayBalance().total);
  }, [getDisplayBalance]);

  // Ad management functions
  const updateAdsConfig = useCallback(async (newConfig) => {
    try {
      await firebaseOperationWithRetry(async () => {
        await updateDoc(doc(db, 'adminConfig', 'adsSettings'), newConfig);
      });
      setAdsConfig(newConfig);
      return true;
    } catch (error) {
      console.error("Error updating ads config:", error);
      return false;
    }
  }, []);

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
      await firebaseOperationWithRetry(async () => {
        await runTransaction(db, async (transaction) => {
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
            dollarsEarned: adsConfig.dollarBonus
          };
          
          transaction.update(userRef, {
            adsWatched: increment(1),
            dailyAdsWatched: increment(1),
            lastAdTimestamp: serverTimestamp(),
            adHistory: arrayUnion(newAdEntry),
            adsBalance: increment(adsConfig.dollarBonus),
            balance: increment(adsConfig.dollarBonus * 1000),
            dollarBalance2: increment(adsConfig.dollarBonus)
          });
        });
      });
      
      setAdsWatched(prev => prev + 1);
      setDailyAdsWatched(prev => prev + 1);
      setLastAdTimestamp(now);
      setAdHistory(prev => [...prev, {
        adId: adData.adId,
        timestamp: now,
        dollarsEarned: adsConfig.dollarBonus
      }]);
      setAdsBalance(prev => +(prev + adsConfig.dollarBonus).toFixed(6));
      setBalance(prev => prev + (adsConfig.dollarBonus * 1000));
      setDollarBalance2(prev => +(prev + adsConfig.dollarBonus).toFixed(6));
      
      return true;
    } catch (error) {
      console.error("Error recording ad watch:", error);
      throw error;
    }
  }, [id, adsConfig, checkAndResetDailyAds]);

  const watchVideo = useCallback(async (rewardAmount) => {
    if (!id) throw new Error('User not authenticated');

    try {
      const userRef = doc(db, 'telegramUsers', id);
      
      const result = await firebaseOperationWithRetry(async () => {
        return await runTransaction(db, async (transaction) => {
          const userDoc = await transaction.get(userRef);
          if (!userDoc.exists()) throw new Error("User does not exist");

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
            balance: increment(rewardAmount * 1000)
          });

          return { 
            success: true, 
            newBalance: (userDoc.data().dollarBalance2 || 0) + rewardAmount
          };
        });
      });

      setDollarBalance2(prev => +(prev + rewardAmount).toFixed(3));
      setVideoWatched(prev => prev + 1);
      setLastVideoTime(new Date());
      setBalance(prev => prev + (rewardAmount * 1000));

      return result;
    } catch (error) {
      console.error('Error in watchVideo:', error);
      return { success: false, error: error.message };
    }
  }, [id]);

  const fetchTopUsers = useCallback(async () => {
    try {
      const now = Date.now();
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`);

      if (cachedData && cachedTimestamp && now - parseInt(cachedTimestamp) < CACHE_DURATION) {
        return JSON.parse(cachedData);
      }

      const users = await firebaseOperationWithRetry(async () => {
        const usersRef = collection(db, 'telegramUsers');
        const q = query(usersRef, orderBy('balance', 'desc'), limit(100));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      });

      localStorage.setItem(CACHE_KEY, JSON.stringify(users));
      localStorage.setItem(`${CACHE_KEY}_timestamp`, now.toString());

      return users;
    } catch (error) {
      console.error('Error fetching top users:', error);
      throw error;
    }
  }, [CACHE_DURATION]);

  // Fixed fetchEssentialData with proper dependencies
  const fetchEssentialData = useCallback(async (userId) => {
    if (!userId) return;

    const essentialDataCacheKey = getEssentialDataCacheKey(userId);

    try {
      const cachedData = localStorage.getItem(essentialDataCacheKey);
      const cachedTimestamp = localStorage.getItem(`${essentialDataCacheKey}_timestamp`);
      const now = Date.now();

      if (cachedData && cachedTimestamp && now - parseInt(cachedTimestamp) < CACHE_TTL) {
        const data = JSON.parse(cachedData);
        updateEssentialStates(data);
        return;
      }

      const userRef = doc(db, 'telegramUsers', userId);
      const [userDoc, adsConfigDoc] = await Promise.all([
        firebaseOperationWithRetry(() => getDoc(userRef)),
        firebaseOperationWithRetry(() => getDoc(doc(db, 'adminConfig', 'adsSettings')))
      ]);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const essentialData = {
          balance: userData.balance || 0,
          adsBalance: userData.adsBalance || 0,
          dollarBalance2: userData.dollarBalance2 || 0,
          adsWatched: userData.adsWatched || 0,
          dailyAdsWatched: userData.dailyAdsWatched || 0,
          videoWatched: userData.videoWatched || 0,
          lastAdTimestamp: userData.lastAdTimestamp?.toDate() || null,
          lastVideoTime: userData.lastVideoTime?.toDate() || null,
          adHistory: userData.adHistory || [],
          isPremium: userData.isPremium || false,
          username: userData.username || '',
          tonTasks: userData.tonTasks || false,
          welcomeBonus: userData.welcomeBonus || 0,
          tonTransactions: userData.tonTransactions || 0,
          selectedExchange: userData.selectedExchange || { 
            id: 'selectex', 
            icon: '/exchange.svg', 
            name: 'Select exchange' 
          },
          walletAddress: userData.address || '',
          isAddressSaved: userData.isAddressSaved || false,
          adsConfig: adsConfigDoc.exists() ? adsConfigDoc.data() : {}
        };

        localStorage.setItem(essentialDataCacheKey, JSON.stringify(essentialData));
        localStorage.setItem(`${essentialDataCacheKey}_timestamp`, now.toString());

        updateEssentialStates(essentialData);
      }
    } catch (error) {
      console.error("Error fetching essential data:", error);
      setError(error);
    }
  }, [CACHE_TTL]);

  const updateEssentialStates = (data) => {
    setBalance(data.balance);
    setAdsBalance(data.adsBalance);
    setDollarBalance2(data.dollarBalance2);
    setAdsWatched(data.adsWatched);
    setDailyAdsWatched(data.dailyAdsWatched);
    setVideoWatched(data.videoWatched);
    setLastAdTimestamp(data.lastAdTimestamp);
    setLastVideoTime(data.lastVideoTime);
    setAdHistory(data.adHistory);
    setIsPremium(data.isPremium);
    setUsername(data.username);
    setTonTasks(data.tonTasks);
    setWelcomeBonus(data.welcomeBonus);
    setTonTransactions(data.tonTransactions);
    setSelectedExchange(data.selectedExchange);
    setWalletAddress(data.walletAddress);
    setIsAddressSaved(data.isAddressSaved);
    if (data.adsConfig) setAdsConfig(data.adsConfig);
  };

  // Define fetchWithdrawals before fetchSecondaryData
  const fetchWithdrawals = useCallback(async () => {
    try {
      const [withdrawalsSnapshot, adsWithdrawalsSnapshot] = await Promise.all([
        firebaseOperationWithRetry(() => 
          getDocs(query(collection(db, 'withdrawalRequests'), orderBy('createdAt', 'desc')))
        ),
        firebaseOperationWithRetry(() => 
          getDocs(query(collection(db, 'adsWithdrawalRequests'), orderBy('createdAt', 'desc')))
        )
      ]);

      const processSnapshot = (snapshot, type) => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        balanceType: type,
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));

      setAllWithdrawals(processSnapshot(withdrawalsSnapshot, 'main'));
      setAdsWithdrawals(processSnapshot(adsWithdrawalsSnapshot, 'ads'));
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      setError(error);
    }
  }, []);

  // Fixed fetchSecondaryData with proper dependencies
  const fetchSecondaryData = useCallback(async (userId) => {
    if (!userId) return;

    // Define helper functions internally to avoid dependencies
    const fetchCollectionsInBatches = async () => {
      try {
        const [manualTasksSnapshot, advertTasksSnapshot] = await Promise.all([
          firebaseOperationWithRetry(() => getDocs(collection(db, 'manualTasks'))),
          firebaseOperationWithRetry(() => getDocs(collection(db, 'advertTasks')))
        ]);
        
        setManualTasks(manualTasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setAdvertTasks(advertTasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const [youtubeTasksSnapshot, tasksSnapshot] = await Promise.all([
          firebaseOperationWithRetry(() => getDocs(collection(db, 'youtubeTasks'))),
          firebaseOperationWithRetry(() => getDocs(collection(db, 'tasks')))
        ]);
        
        setYoutubeTasks(youtubeTasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setTasks(tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const [dailyTasksSnapshot, adTaskSnapshot] = await Promise.all([
          firebaseOperationWithRetry(() => getDocs(collection(db, 'dailyTasks'))),
          firebaseOperationWithRetry(() => getDocs(collection(db, 'manualTasks')))
        ]);
        
        setDailyTasks(dailyTasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setAdTask(adTaskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching collections:", error);
        setError(error);
      }
    };

    const fetchLeaderboardData = async (userBalance) => {
      try {
        const topUsersData = await fetchTopUsers();
        setLeaderBoard(topUsersData);

        const usersAboveQuery = query(
          collection(db, 'telegramUsers'),
          where('balance', '>', userBalance)
        );
        const querySnapshot = await firebaseOperationWithRetry(() => getDocs(usersAboveQuery));
        setActiveUserRank(querySnapshot.size + 1);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        setError(error);
      }
    };

    const fetchTotalUsersCount = async () => {
      try {
        const totalUsersDoc = await firebaseOperationWithRetry(() => 
          getDoc(doc(db, 'data', 'allUsersCount'))
        );
        if (totalUsersDoc.exists()) {
          setTotalUsers(totalUsersDoc.data().count || 0);
        }
      } catch (error) {
        console.error("Error fetching total users count:", error);
        setError(error);
      }
    };

    try {
      const userRef = doc(db, 'telegramUsers', userId);
      const userDoc = await firebaseOperationWithRetry(() => getDoc(userRef));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Set referral data
        const totalReferralBonus = userData.processedReferrals?.reduce(
          (total, referral) => total + (referral.refBonus || 0), 0
        ) || 0;
        setRefBonus(totalReferralBonus);

        // Set other user data
        setFullName(userData.fullName || '');
        setId(userData.userId || '');
        setStreak(userData.streak || 0);
        setLastCheckIn(userData.lastCheckIn?.toDate() || null);
        setCheckInDays(userData.checkInDays || []);
        setCheckinRewards(userData.checkinRewards || 0);

        // Set tasks data
        setCompletedTasks(userData.tasksCompleted || []);
        setUserManualTasks(userData.manualTasks || []);
        setUserAdvertTasks(userData.advertTasks || []);
        setReferrals(userData.referrals || []);
        setProcessedReferrals(userData.processedReferrals || []);
        setCompletedDailyTasks(userData.dailyTasksCompleted || []);
        setCompletedCatTasks(userData.catsAndFriends || []);
        setTaskPoints(userData.taskPoints || 0);
        setCompletedYoutubeTasks(userData.completedYoutubeTasks || []);

        await fetchCollectionsInBatches();
        await fetchLeaderboardData(userData.balance || 0);
        await fetchTotalUsersCount();
        await fetchWithdrawals();
      }
    } catch (error) {
      console.error("Error fetching secondary data:", error);
      setError(error);
    }
  }, [fetchTopUsers, fetchWithdrawals]);

  const updateWithdrawalStatus = useCallback(async (id, status, isAdsWithdrawal = false) => {
    setIsProcessingWithdrawal(prev => ({ ...prev, [id]: true }));
    try {
      const collectionName = isAdsWithdrawal ? 'adsWithdrawalRequests' : 'withdrawalRequests';
      await firebaseOperationWithRetry(async () => {
        await updateDoc(doc(db, collectionName, id), {
          status,
          updatedAt: Timestamp.now()
        });
      });
      
      const updateState = isAdsWithdrawal ? setAdsWithdrawals : setAllWithdrawals;
      updateState(prev => prev.map(w => 
        w.id === id ? { ...w, status, updatedAt: new Date() } : w
      ));
    } catch (error) {
      console.error('Error updating withdrawal:', error);
      setError(error);
    } finally {
      setIsProcessingWithdrawal(prev => ({ ...prev, [id]: false }));
    }
  }, []);

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

  const addRewards = async (amount, type = 'main') => {
    if (!id) throw new Error('User not authenticated');
    
    try {
      const userRef = doc(db, 'telegramUsers', id);
      
      const updateData = {};
      const stateUpdates = {};
      
      switch (type) {
        case 'main':
          updateData.balance = increment(amount * 1000);
          updateData.dollarBalance2 = increment(amount);
          stateUpdates.setBalance = amount * 1000;
          stateUpdates.setDollarBalance2 = amount;
          break;
        case 'ads':
          updateData.adsBalance = increment(amount);
          updateData.adsWatched = increment(1);
          updateData.lastAdTimestamp = Timestamp.now();
          stateUpdates.setAdsBalance = amount;
          stateUpdates.setAdsWatched = 1;
          stateUpdates.setLastAdTimestamp = Date.now();
          break;
        case 'video':
          updateData.dollarBalance2 = increment(amount);
          updateData.balance = increment(amount * 1000);
          updateData.videoWatched = increment(1);
          updateData.lastVideoTime = Timestamp.now();
          stateUpdates.setDollarBalance2 = amount;
          stateUpdates.setBalance = amount * 1000;
          stateUpdates.setVideoWatched = 1;
          stateUpdates.setLastVideoTime = Date.now();
          break;
        default:
          throw new Error(`Invalid reward type: ${type}`);
      }
      
      await firebaseOperationWithRetry(async () => {
        await updateDoc(userRef, updateData);
      });
      
      Object.entries(stateUpdates).forEach(([setter, value]) => {
        const setterFn = {
          setBalance,
          setDollarBalance2,
          setAdsBalance,
          setAdsWatched,
          setVideoWatched,
          setLastAdTimestamp,
          setLastVideoTime
        }[setter];
        
        if (setterFn) {
          setterFn(prev => prev + value);
        }
      });

      return { success: true, newBalance: getTotalBalance() };
    } catch (error) {
      console.error('Error adding rewards:', error);
      return { success: false, error: error.message };
    }
  };

  const handleReferral = useCallback(async (userId, referrerId, username) => {
    if (!referrerId) return;

    try {
      const referrerRef = doc(db, 'telegramUsers', referrerId);
      const referrerDoc = await firebaseOperationWithRetry(() => getDoc(referrerRef));

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

      await firebaseOperationWithRetry(async () => {
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
          balance: increment(refBonus * 1000),
          dollarBalance2: increment(refBonus)
        });
      });

      if (referrerId === id) {
        setBalance(prev => prev + (refBonus * 1000));
        setDollarBalance2(prev => +(prev + refBonus).toFixed(6));
        setRefBonus(prev => prev + refBonus);
      }
    } catch (error) {
      console.error('Error handling referral:', error);
      setError(error);
    }
  }, [id]);

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
        const userDoc = await firebaseOperationWithRetry(() => getDoc(userRef));

        if (userDoc.exists()) {
          await fetchEssentialData(userId.toString());
          setInitialized(true);
          setTimeout(() => fetchSecondaryData(userId.toString()), 500);
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
          balance: 0,
          adsBalance: 0,
          dollarBalance2: 0,
          adsWatched: 0,
          dailyAdsWatched: 0,
          videoWatched: 0,
          lastAdTimestamp: null,
          lastVideoTime: null,
          adHistory: [],
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

        await firebaseOperationWithRetry(() => setDoc(userRef, userData));
        setCheckinRewards(0);

        // Update total users count
        const allUsersCountRef = doc(db, 'data', 'allUsersCount');
        await firebaseOperationWithRetry(() => runTransaction(db, async (transaction) => {
          const allUsersCountDoc = await transaction.get(allUsersCountRef);
          if (!allUsersCountDoc.exists()) {
            transaction.set(allUsersCountRef, { count: 1 });
          } else {
            transaction.update(allUsersCountRef, { count: allUsersCountDoc.data().count + 1 });
          }
        }));

        setWelcomeBonus(welcomeBonus);
        setId(userId.toString());

        if (referrerId) {
          await handleReferral(userId, referrerId, finalUsername);
        }

        setInitialized(true);
        await fetchEssentialData(userId.toString());
        setTimeout(() => fetchSecondaryData(userId.toString()), 500);
      } catch (error) {
        console.error('Error saving user:', error);
        setError(error);
      }
    }
  }, [telegramUser, fetchEssentialData, fetchSecondaryData, handleReferral]);

  // Effect hooks
  useEffect(() => {
    if (id) {
      const visited = localStorage.getItem('hasVisitedBefore');
      setHasVisitedBefore((balance > 0) && !!visited);
      setChecker(!((balance > 0) && !!visited));
      if (!visited) localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, [id, balance]);

  useEffect(() => {
    const checkLastCheckIn = async () => {
      if (!id) return;

      try {
        const userDoc = await firebaseOperationWithRetry(() => getDoc(doc(db, 'telegramUsers', id)));
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

  // Real-time listener for balance updates
  useEffect(() => {
    if (!id) return;

    const userRef = doc(db, 'telegramUsers', id);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setBalance(data.balance || 0);
        setAdsBalance(data.adsBalance || 0);
        setDollarBalance2(data.dollarBalance2 || 0);
        setAdsWatched(data.adsWatched || 0);
        setDailyAdsWatched(data.dailyAdsWatched || 0);
        setVideoWatched(data.videoWatched || 0);
      }
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkAndResetDailyAds();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [checkAndResetDailyAds]);

  // Context value
  return (
    <UserContext.Provider value={{
      balance: getTotalBalance(),
      balanceDetails: getDisplayBalance(),
      rawBalance: balance,
      adsBalance,
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
      adsConfig,

      setBalance, 
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
      setAdsConfig,

      YoutubeTasks,

      getDisplayBalance,
      getTotalBalance,
      sendUserData, 
      handleReferral, 
      addRewards,
      watchVideo,
      fetchWithdrawals,
      updateWithdrawalStatus,
      exportApprovedWithdrawals,
      updateAdsConfig,
      recordAdWatch,
      getAdStats,
      checkAndResetDailyAds
    }}>
      {children}
    </UserContext.Provider>
  );
};
