import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  getDocs, 
  collection, 
  orderBy, 
  where, 
  query, 
  limit, 
  runTransaction, 
  Timestamp,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firestore';
import YoutubeTasks from '../Component/Alltask/YoutubeTasks';
import * as XLSX from 'xlsx';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  // State declarations
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
  const [lastAdTime, setLastAdTime] = useState(null);
  const [videoWatched, setVideoWatched] = useState(0);
  const [lastVideoTime, setLastVideoTime] = useState(null);
  const [allWithdrawals, setAllWithdrawals] = useState([]);
  const [adsWithdrawals, setAdsWithdrawals] = useState([]);
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState({});
  const [isPremium, setIsPremium] = useState(false);
  
  // Ad tracking states
  const [adsConfig, setAdsConfig] = useState({
    pointsBonus: 1000,
    dollarBonus: 10.001,
    dailyLimit: 50,
    premiumDailyLimit: 100,
    cooldown: 20 * 60 * 1000, // 20 minutes in milliseconds
    ads: [{
      id: "default_ad",
      scriptSrc: "//whephiwums.com/sdk.js",
      zoneId: "8693006",
      sdkVar: "show_8693006",
      active: true
    }]
  });
  const [adWatches, setAdWatches] = useState({});
  const [adCooldowns, setAdCooldowns] = useState({});
  const [adWatched, setAdWatched] = useState(false);

  const CACHE_KEY = 'topUsers';
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Combined balance calculation
  const getTotalBalance = useCallback(() => {
    return (balance || 0) + (adsBalance || 0) + (dollarBalance2 || 0);
  }, [balance, adsBalance, dollarBalance2]);

  // Ad management functions
  const updateAdsConfig = useCallback(async (newConfig) => {
    try {
      await updateDoc(doc(db, 'adminConfig', 'adsSettings'), newConfig);
      setAdsConfig(newConfig);
      return true;
    } catch (error) {
      console.error("Error updating ads config:", error);
      return false;
    }
  }, []);

  const recordAdWatch = useCallback(async (adData) => {
    if (!id) throw new Error('User not authenticated');
    
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];
    const userRef = doc(db, 'telegramUsers', id);
    
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("User does not exist");
        
        const userData = userDoc.data();
        const adWatchesToday = userData.adWatches?.[today] || 0;
        const dailyLimit = userData.isPremium ? 
          adsConfig.premiumDailyLimit : adsConfig.dailyLimit;
        
        if (adWatchesToday >= dailyLimit) {
          throw new Error("Daily ad limit reached");
        }
        
        // Update ad watch count
        const updates = {
          [`adWatches.${today}`]: increment(1),
          lastAdTimestamp: serverTimestamp(),
          [`adCooldowns.${adData.adId}`]: serverTimestamp(),
          adsWatched: increment(1),
          lastAdTime: serverTimestamp()
        };
        
        transaction.update(userRef, updates);
      });
      
      // Update local state
      setAdWatches(prev => ({
        ...prev,
        [today]: (prev[today] || 0) + 1
      }));
      setAdCooldowns(prev => ({
        ...prev,
        [adData.adId]: now
      }));
      setAdsWatched(prev => prev + 1);
      setLastAdTime(now);
      setAdWatched(true);
      
      return true;
    } catch (error) {
      console.error("Error recording ad watch:", error);
      throw error;
    }
  }, [id, adsConfig]);

  const getAdStatus = useCallback((adId) => {
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];
    const cooldownEnd = adCooldowns[adId] ? adCooldowns[adId] + adsConfig.cooldown : 0;
    const remaining = Math.max(0, cooldownEnd - now);
    
    return {
      canWatch: remaining === 0,
      remainingTime: remaining,
      dailyLimit: isPremium ? adsConfig.premiumDailyLimit : adsConfig.dailyLimit,
      watchedToday: adWatches[today] || 0,
      pointsReward: adsConfig.pointsBonus,
      dollarReward: adsConfig.dollarBonus,
      lastWatch: adCooldowns[adId] || null
    };
  }, [adCooldowns, adWatches, adsConfig, isPremium]);

  const resetDailyAdLimits = useCallback(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const today = now.toISOString().split('T')[0];
    
    // Reset at midnight
    if (hours === 0 && minutes === 0) {
      setAdWatches(prev => {
        const newWatches = {...prev};
        if (!newWatches[today]) {
          Object.keys(newWatches).forEach(date => {
            if (date !== today) {
              delete newWatches[date];
            }
          });
        }
        return newWatches;
      });
    }
  }, []);

  const claimAdReward = useCallback(async () => {
    if (!id || !adWatched) return;
    
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'telegramUsers', id);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error("User does not exist");
        }
        
        // Verify recent ad watch
        const lastAdTime = userDoc.data().lastAdTime?.toDate()?.getTime() || 0;
        const timeSinceLastAd = Date.now() - lastAdTime;
        
        if (timeSinceLastAd > adsConfig.cooldown * 2) {
          throw new Error("No recent ad watch recorded");
        }
        
        // Update balances
        transaction.update(userRef, {
          balance: increment(adsConfig.pointsBonus),
          adsBalance: increment(adsConfig.dollarBonus),
          taskPoints: increment(adsConfig.pointsBonus)
        });
      });
      
      // Update local state
      setBalance(prev => prev + adsConfig.pointsBonus);
      setAdsBalance(prev => +(prev + adsConfig.dollarBonus).toFixed(6));
      setTaskPoints(prev => prev + adsConfig.pointsBonus);
      setAdWatched(false);
      
      return true;
    } catch (error) {
      console.error("Error claiming ad reward:", error);
      throw error;
    }
  }, [id, adWatched, adsConfig]);

  // Unified reward adding function with default case
  const addRewards = async (amount, type = 'main') => {
    if (!id) throw new Error('User not authenticated');
    
    try {
      const userRef = doc(db, 'telegramUsers', id);
      
      const updateData = {};
      const stateUpdates = {};
      
      switch (type) {
        case 'main':
          updateData.balance = increment(amount);
          stateUpdates.setBalance = amount;
          break;
        case 'ads':
          updateData.adsBalance = increment(amount);
          updateData.adsWatched = increment(1);
          updateData.lastAdTime = Timestamp.now();
          stateUpdates.setAdsBalance = amount;
          stateUpdates.setAdsWatched = 1;
          stateUpdates.setLastAdTime = Date.now();
          break;
        case 'video':
          updateData.dollarBalance2 = increment(amount);
          updateData.videoWatched = increment(1);
          updateData.lastVideoTime = Timestamp.now();
          stateUpdates.setDollarBalance2 = amount;
          stateUpdates.setVideoWatched = 1;
          stateUpdates.setLastVideoTime = Date.now();
          break;
        default:
          throw new Error(`Invalid reward type: ${type}. Must be 'main', 'ads', or 'video'`);
      }
      
      await updateDoc(userRef, updateData);
      
      // Update local state
      Object.entries(stateUpdates).forEach(([setter, value]) => {
        const setterFn = {
          setBalance,
          setAdsBalance,
          setDollarBalance2,
          setAdsWatched,
          setVideoWatched,
          setLastAdTime,
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

  // Fetch top users with caching
  const fetchTopUsers = useCallback(async () => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`);
      const now = new Date().getTime();

      if (cachedData && cachedTimestamp && now - parseInt(cachedTimestamp) < CACHE_DURATION) {
        return JSON.parse(cachedData);
      }

      const usersRef = collection(db, 'telegramUsers');
      const q = query(usersRef, orderBy('balance', 'desc'), limit(100));
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
  }, [CACHE_DURATION]);

  // Update user's active time
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

  // Handle referral logic
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
        balance: increment(refBonus),
      });
    } catch (error) {
      console.error('Error handling referral:', error);
      setError(error);
    }
  }, []);

  // Fetch withdrawal history
  const fetchWithdrawals = useCallback(async () => {
    try {
      const [withdrawalsSnapshot, adsWithdrawalsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'withdrawalRequests'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'adsWithdrawalRequests'), orderBy('createdAt', 'desc')))
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
  }, []);

  // Update withdrawal status
  const updateWithdrawalStatus = useCallback(async (id, status, isAdsWithdrawal = false) => {
    setIsProcessingWithdrawal(prev => ({ ...prev, [id]: true }));
    try {
      const collectionName = isAdsWithdrawal ? 'adsWithdrawalRequests' : 'withdrawalRequests';
      await updateDoc(doc(db, collectionName, id), {
        status,
        updatedAt: Timestamp.now()
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

  // Export approved withdrawals to Excel
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

  // Fetch user data from Firestore
  const fetchData = useCallback(async (userId) => {
    if (!userId) return;

    try {
      const userRef = doc(db, 'telegramUsers', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const today = new Date().toISOString().split('T')[0];
        
        // Set all balance-related states
        setBalance(userData.balance || 0);
        setAdsBalance(userData.adsBalance || 0);
        setDollarBalance2(userData.dollarBalance2 || 0);
        setAdsWatched(userData.adsWatched || 0);
        setVideoWatched(userData.videoWatched || 0);
        setLastAdTime(userData.lastAdTime?.toDate() || null);
        setLastVideoTime(userData.lastVideoTime?.toDate() || null);

        // Set ad-related states
        setAdWatches(userData.adWatches || { [today]: 0 });
        setAdCooldowns(userData.adCooldowns || {});
        setIsPremium(userData.isPremium || false);
        setAdWatched(false);

        // Set other user data
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

        // Referrals
        const totalReferralBonus = userData.processedReferrals?.reduce(
          (total, referral) => total + (referral.refBonus || 0), 0
        ) || 0;
        setRefBonus(totalReferralBonus);

        // User tasks
        setCompletedTasks(userData.tasksCompleted || []);
        setUserManualTasks(userData.manualTasks || []);
        setUserAdvertTasks(userData.advertTasks || []);
        setReferrals(userData.referrals || []);
        setProcessedReferrals(userData.processedReferrals || []);

        // Fetch ads configuration
        const adsConfigDoc = await getDoc(doc(db, 'adminConfig', 'adsSettings'));
        if (adsConfigDoc.exists()) {
          setAdsConfig(adsConfigDoc.data());
        }

        // Fetch leaderboard
        const topUsersData = await fetchTopUsers();
        setLeaderBoard(topUsersData);

        // Calculate user rank
        const usersAboveQuery = query(
          collection(db, 'telegramUsers'),
          where('balance', '>', userData.balance || 0)
        );
        const querySnapshot = await getDocs(usersAboveQuery);
        setActiveUserRank(querySnapshot.size + 1);

        // Fetch all collections in parallel
        const fetchCollections = async () => {
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
            getDocs(collection(db, 'manualTasks')) // Assuming AdTask uses manualTasks collection
          ]);

          setManualTasks(manualTasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setAdvertTasks(advertTasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setYoutubeTasks(youtubeTasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setTasks(tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setDailyTasks(dailyTasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setAdTask(adTaskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        await fetchCollections();

        // Get total users count
        const totalUsersDoc = await getDoc(doc(db, 'data', 'allUsersCount'));
        if (totalUsersDoc.exists()) {
          setTotalUsers(totalUsersDoc.data().count || 0);
        }

        // Update active time
        await updateActiveTime(userRef);

        // Fetch withdrawal history
        await fetchWithdrawals();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error);
    }
  }, [fetchTopUsers, updateActiveTime, fetchWithdrawals]);

  // Send user data to Firestore
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
          balance: 0,
          adsBalance: 0,
          dollarBalance2: 0,
          adsWatched: 0,
          videoWatched: 0,
          lastAdTime: null,
          lastVideoTime: null,
          lastActive: Timestamp.now(),
          refereeId: referrerId || null,
          referrals: [],
          processedReferrals: [],
          welcomeBonus: welcomeBonus,
          refBonus: 0,
          streak: 0,
          isPremium: false,
          adWatches: {},
          adCooldowns: {},
          dailyTasksCompleted: [],
          catsAndFriends: []
        };

        await setDoc(userRef, userData);
        setCheckinRewards(0);

        // Update total users count
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

  // Check if user has visited before
  useEffect(() => {
    if (id) {
      const visited = localStorage.getItem('hasVisitedBefore');
      setHasVisitedBefore((balance > 0) && !!visited);
      setChecker(!((balance > 0) && !!visited));
      if (!visited) localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, [id, balance]);

  // Check last check-in status
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

  // Initialize user data
  useEffect(() => {
    sendUserData();
  }, [sendUserData]);

  // Set initial loading state
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  // Daily reset for ad limits
  useEffect(() => {
    const interval = setInterval(resetDailyAdLimits, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [resetDailyAdLimits]);

  return (
    <UserContext.Provider value={{
      // All state values
      balance, 
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
      lastAdTime,
      videoWatched,
      lastVideoTime,
      allWithdrawals,
      adsWithdrawals,
      isProcessingWithdrawal,
      isPremium,
      adsConfig,
      adWatches,
      adCooldowns,
      adWatched,

      // All state setters
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
      setLastAdTime,
      setVideoWatched,
      setLastVideoTime,
      setAllWithdrawals,
      setAdsWithdrawals,
      setIsProcessingWithdrawal,
      setIsPremium,
      setAdsConfig,
      setAdWatches,
      setAdCooldowns,
      setAdWatched,

      // Components
      YoutubeTasks,

      // Functions
      sendUserData, 
      handleReferral, 
      addRewards,
      getTotalBalance,
      fetchWithdrawals,
      updateWithdrawalStatus,
      exportApprovedWithdrawals,
      updateAdsConfig,
      recordAdWatch,
      getAdStatus,
      claimAdReward,
      resetDailyAdLimits
    }}>
      {children}
    </UserContext.Provider>
  );
};
