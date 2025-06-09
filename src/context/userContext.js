import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, getDocs, collection, orderBy, where, query, limit, runTransaction, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import YoutubeTasks from '../Component/Alltask/YoutubeTasks';
import * as XLSX from 'xlsx';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
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
  const [selectedExchange, setSelectedExchange] = useState({ id: 'selectex', icon: '/exchange.svg', name: 'Select exchange' });
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
  const [adsBalance, setAdsBalance] = useState(0);
  const [adsWatched, setAdsWatched] = useState(0);
  const [lastAdTime, setLastAdTime] = useState(null);
  const [allWithdrawals, setAllWithdrawals] = useState([]);
  const [adsWithdrawals, setAdsWithdrawals] = useState([]);
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState({});

  // New states for second AdWatch system
  const [secondAdsWatched, setSecondAdsWatched] = useState(0);
  const [secondLastAdTime, setSecondLastAdTime] = useState(null);

  const CACHE_KEY = 'topUsers';
  const CACHE_DURATION = 10 * 60 * 1000;

  // New function to handle watching ads in the second system
  const watchSecondAd = useCallback(async (rewardAmount) => {
    if (!id) return;

    try {
      const userRef = doc(db, 'telegramUsers', id);
      const now = Timestamp.now();
      
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error("User document does not exist!");
        }

        const userData = userDoc.data();
        
        // Update both the second ad stats and main ads balance
        transaction.update(userRef, {
          secondAdsWatched: (userData.secondAdsWatched || 0) + 1,
          secondLastAdTime: now,
          adsBalance: (userData.adsBalance || 0) + rewardAmount,
          adsWatched: (userData.adsWatched || 0) + 1,
          lastAdTime: now
        });
      });

      // Update local state
      setSecondAdsWatched(prev => prev + 1);
      setSecondLastAdTime(new Date());
      setAdsBalance(prev => prev + rewardAmount);
      setAdsWatched(prev => prev + 1);
      setLastAdTime(new Date());
      
      return { success: true, message: "Ad watched successfully" };
    } catch (error) {
      console.error("Error watching second ad:", error);
      return { success: false, message: error.message };
    }
  }, [id]);

  const fetchTopUsers = useCallback(async () => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`);
    const now = new Date().getTime();

    if (cachedData && cachedTimestamp && now - parseInt(cachedTimestamp) < CACHE_DURATION) {
      console.log('Returning cached top users data');
      return JSON.parse(cachedData);
    }

    console.log('Fetching fresh top users data from Firestore');
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
  }, [CACHE_DURATION]);

  const updateActiveTime = useCallback(async (userRef) => {
    try {
      await updateDoc(userRef, {
        lastActive: Timestamp.now(),
      });
      console.log('Active Time Updated');
    } catch (error) {
      console.error('Error updating Active Time:', error);
      setError(error);
    }
  }, []);

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

  const updateWithdrawalStatus = useCallback(async (id, status, isAdsWithdrawal = false) => {
    setIsProcessingWithdrawal(prev => ({ ...prev, [id]: true }));
    try {
      const collectionName = isAdsWithdrawal ? 'adsWithdrawalRequests' : 'withdrawalRequests';
      await updateDoc(doc(db, collectionName, id), {
        status,
        updatedAt: new Date()
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
  }, [allWithdrawals, adsWithdrawals]);

  const handleReferral = async (userId, referrerId, username) => {
    if (!referrerId) return;

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
      refBonus: referrerDoc.data().refBonus + refBonus,
      balance: referrerDoc.data().balance + refBonus,
    });

    console.log('Referral added successfully, and refBonus issued');
  };

  const fetchData = useCallback(async (userId) => {
    if (!userId) return;

    try {
      const userRef = doc(db, 'telegramUsers', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userBalance = userData.balance;

        setBalance(userBalance);
        setAdsBalance(userData.adsBalance || 0);
        setAdsWatched(userData.adsWatched || 0);
        setLastAdTime(userData.lastAdTime?.toDate() || null);
        
        // New: Set second ad watch data
        setSecondAdsWatched(userData.secondAdsWatched || 0);
        setSecondLastAdTime(userData.secondLastAdTime?.toDate() || null);

        const topUsersData = await fetchTopUsers();
        setLeaderBoard(topUsersData);

        const usersAboveQuery = query(
          collection(db, 'telegramUsers'),
          where('balance', '>', userBalance)
        );

        const querySnapshot = await getDocs(usersAboveQuery);
        const activeUserRank = querySnapshot.size + 1;
        setActiveUserRank(activeUserRank);

        setLastCheckIn(userData.lastCheckIn?.toDate() || null);
        setCheckInDays(userData.checkInDays || []);
        setCheckinRewards(userData.checkinRewards);
        setUsername(userData.username);
        setTonTasks(userData.tonTasks);
        setWelcomeBonus(userData.welcomeBonus);
        setTonTransactions(userData.tonTransactions);
        setSelectedExchange(userData.selectedExchange);
        setWalletAddress(userData.address);
        setIsAddressSaved(userData.isAddressSaved);
        setCompletedDailyTasks(userData.dailyTasksCompleted || []);
        setCompletedCatTasks(userData.catsAndFriends || []);
        setTaskPoints(userData.taskPoints);
        setCompletedYoutubeTasks(userData.completedYoutubeTasks || []);
        setFullName(userData.fullName);
        setId(userData.userId);
        setStreak(userData.streak || 0);

        const totalReferralBonus = userData.processedReferrals?.reduce((total, referral) => total + (referral.refBonus || 0), 0) || 0;
        setRefBonus(totalReferralBonus);

        setCompletedTasks(userData.tasksCompleted || []);
        setUserManualTasks(userData.manualTasks || []);
        setUserAdvertTasks(userData.advertTasks || []);
        setReferrals(userData.referrals || []);
        setProcessedReferrals(userData.processedReferrals || []);
        await updateActiveTime(userRef);

        const manualTasksQuerySnapshot = await getDocs(collection(db, 'manualTasks'));
        const manualTasksData = manualTasksQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setManualTasks(manualTasksData);

        const advertTasksQuerySnapshot = await getDocs(collection(db, 'advertTasks'));
        const advertTasksData = advertTasksQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAdvertTasks(advertTasksData);

        const youtubeTasksQuerySnapshot = await getDocs(collection(db, 'youtubeTasks'));
        const youtubeTasksData = youtubeTasksQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setYoutubeTasks(youtubeTasksData);

        const AdTaskQuerySnapshot = await getDocs(collection(db, 'manualTasks'));
        const AdTaskData = AdTaskQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAdTask(AdTaskData);

        const tasksQuerySnapshot = await getDocs(collection(db, 'tasks'));
        const tasksData = tasksQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTasks(tasksData);

        const dailyTasksQuerySnapshot = await getDocs(collection(db, 'dailyTasks'));
        const dailyTasksData = dailyTasksQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDailyTasks(dailyTasksData);

        const totalUsersDocRef = doc(db, 'data', 'allUsersCount');
        const totalUsersDocSnap = await getDoc(totalUsersDocRef);

        if (totalUsersDocSnap.exists()) {
          const totalUsersData = totalUsersDocSnap.data();
          setTotalUsers(totalUsersData.count);
        }
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
      setError(error);
    }
  }, [fetchTopUsers, updateActiveTime]);

  const sendUserData = useCallback(async () => {
    const queryParams = new URLSearchParams(window.location.search);
    let referrerId = queryParams.get("ref");
    if (referrerId) {
      referrerId = referrerId.replace(/\D/g, "");
    }

    if (telegramUser) {
      const { id: userId, username, first_name: firstName, last_name: lastName } = telegramUser;
      const finalUsername = username || `${firstName}_${userId}`;
      const fullNamed = `${firstName} ${lastName}`;

      try {
        const userRef = doc(db, 'telegramUsers', userId.toString());
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          fetchData(userId.toString());
          setInitialized(true);
          return;
        }

        const firstDigit = parseInt(userId.toString()[0]);
        const welcomeBonus = firstDigit * 1000;

        const userData = {
          userId: userId.toString(),
          username: finalUsername,
          firstName: firstName,
          lastName: lastName,
          fullName: fullNamed,
          selectedExchange: { id: 'selectex', icon: '/exchange.svg', name: 'Choose exchange' },
          tonTransactions: 0,
          taskPoints: 0,
          checkinRewards: 0,
          balance: 0,
          adsBalance: 0,
          adsWatched: 0,
          secondAdsWatched: 0, // New: Initialize second ad watch counter
          lastAdTime: null,
          secondLastAdTime: null, // New: Initialize second ad last watch time
          lastActive: Timestamp.now(),
          refereeId: referrerId || null,
          referrals: [],
          processedReferrals: [],
          welcomeBonus: welcomeBonus,
          refBonus: 0,
          streak: 0,
        };

        await setDoc(userRef, userData);
        setCheckinRewards(0);

        const allUsersCountRef = doc(db, 'data', 'allUsersCount');
        await runTransaction(db, async (transaction) => {
          const allUsersCountDoc = await transaction.get(allUsersCountRef);
          if (!allUsersCountDoc.exists()) {
            transaction.set(allUsersCountRef, { count: 1 });
          } else {
            const newCount = allUsersCountDoc.data().count + 1;
            transaction.update(allUsersCountRef, { count: newCount });
          }
        });

        await setDoc(userRef, userData);
        setWelcomeBonus(welcomeBonus);
        setId(userId.toString());

        if (referrerId) {
          await handleReferral(userId, referrerId, finalUsername);
        }

        setInitialized(true);
        fetchData(userId.toString());
      } catch (error) {
        console.error('Error saving user in Firestore:', error);
        setError(error);
      }
    }
  }, [telegramUser, fetchData]);

  useEffect(() => {
    setChecker(false);
    if (id) {
      const visited = localStorage.getItem('hasVisitedBefore');
      if ((balance > 0) && visited) {
        setHasVisitedBefore(true);
      } else {
        setChecker(true);
        localStorage.setItem('hasVisitedBefore', 'true');
      }
    }
  }, [id, balance]);

  useEffect(() => {
    const checkLastCheckIn = async () => {
      if (!id) return;

      try {
        const userDocRef = doc(db, 'telegramUsers', id);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const now = new Date();

          const lastCheckInTimestamp = userData.lastCheckIn;
          const lastCheckInDate = lastCheckInTimestamp ? lastCheckInTimestamp.toDate() : null;

          if (lastCheckInDate) {
            const lastCheckInLocal = new Date(lastCheckInDate.getTime() + lastCheckInDate.getTimezoneOffset() * 60000);
            const lastCheckInMidnight = new Date(lastCheckInLocal);
            lastCheckInMidnight.setHours(0, 0, 0, 0);

            const todayMidnight = new Date(now);
            todayMidnight.setHours(0, 0, 0, 0);

            const daysSinceLastCheckIn = Math.floor((todayMidnight - lastCheckInMidnight) / (1000 * 60 * 60 * 24));

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
        console.error('Error during initial check-in:', err);
        setError('An error occurred while checking your last check-in.');
      }
    };

    checkLastCheckIn();
  }, [id, setCheckInDays, setError]);

  useEffect(() => {
    sendUserData();
  }, [sendUserData]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3500);
  }, []);

  return (
    <UserContext.Provider value={{
      balance, setBalance, totalUsers, completedYoutubeTasks, completedDailyTasks, lastCheckIn, setLastCheckIn, 
      completedCatTasks, setCompletedCatTasks, setCompletedDailyTasks, dailyTasks, setDailyTasks, openInfoThree, 
      welcomeBonus, setWelcomeBonus, setOpenInfoThree, youtubeTasks, setYoutubeTasks, YoutubeTasks, 
      setCompletedYoutubeTasks, fullName, selectedExchange, setSelectedExchange, leaderBoard, tonTasks, setTonTasks, 
      username, tonTransactions, setTonTransactions, setUsername, activeUserRank, setActiveUserRank, setLeaderBoard, 
      loadingTwo, setLoadingTwo, taskPoints, setTaskPoints, error, setError, checker, setChecker, userAdvertTasks, 
      setUserAdvertTasks, advertTasks, setAdvertTasks, setFullName, walletAddress, setWalletAddress, isAddressSaved, 
      setIsAddressSaved, loading, setLoading, id, setId, sendUserData, refBonus, setRefBonus, manualTasks, AdTask, 
      setManualTasks, setAdTask, userManualTasks, setUserManualTasks, checkinRewards, setCheckinRewards, tasks, 
      setTasks, completedTasks, setCompletedTasks, referrals, processedReferrals, setProcessedReferrals, initialized, 
      setInitialized, checkInDays, setCheckInDays, hasVisitedBefore, setHasVisitedBefore,
      showStartOverModal, setShowStartOverModal, showClaimModal, setShowClaimModal, handleReferral, streak, setStreak,
      adsBalance, setAdsBalance,
      adsWatched, setAdsWatched,
      lastAdTime, setLastAdTime,
      // Withdrawal related state and functions
      allWithdrawals,
      adsWithdrawals,
      isProcessingWithdrawal,
      fetchWithdrawals,
      updateWithdrawalStatus,
      exportApprovedWithdrawals,
      // New second AdWatch system
      secondAdsWatched,
      secondLastAdTime,
      watchSecondAd
    }}>
      {children}
    </UserContext.Provider>
  );
};
