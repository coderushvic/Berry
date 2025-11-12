import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorCom from './Component/ErrorCom';
import InviteFrens from './Pages/Friends/InviteFrens';
import Airdrop from './Pages/Airdrop/Airdrop';
import Leaderboard from './Pages/Leaderboard/Leaderboard';
import TaskPage from './Component/Alltask/Taskpage';
import Settings from "./Pages/admin/Settings";
import AdminAdvertTasks from "./Pages/admin/AdminAdvertTasks";
import AirdropWallets from "./Pages/admin/AdminWallets";
import Search from "./Pages/admin/Search";
import Statistics from "./Pages/admin/Statistics";
import AdminYoutube from "./Pages/admin/AdminYoutube";
import NotAdmin236 from "./Pages/admin/AdminLogin";
import NewDashboard from "./Pages/admin/NewDashboard";
import AdminTelegramTasks from "./Pages/admin/AdminTelegramTasks";
import AdminDailyTasks from "./Pages/admin/AdminDailyTasks";
import { AuthContextProvider } from "./context/AuthContext";
import Taskss from '../src/Component/Adsgram/Taskss'
import BroadcastMessage from './Component/adminComp/BroadcastMessage';
import DailyCheckIn from './Pages/DailyCheckIn';
import DailyRewardCard from './Pages/DailyRewardCard';
import Animate from './Component/Animate';
import GameComponent from './Pages/ColorSwitchGame';
import GameButton from './Pages/GameButton';
import AdTask from './Component/Adsgram/AdTask'
import AdminWithdrawals from './Pages/admin/AdminWithdrawals';
import UserDashboard from './Pages/user/userDashboard';
import Userdashcard from './Pages/Userdashcard';
import WithdrawForm from './Component/user/withdrawForm';
import StatusTracker from './Component/user/statusTracker';
import Home1 from './Pages/Home/Home1';
import Referrals from './Component/Nweb/Referrals';
import ProfilePage from './Component/Nweb/ProfilePage';
import VideoWatchPage from './Component/Nweb/VideoWatchPage';
import AdsPage from './Component/Nweb/AdsPage';
import AdminAdsSettings from './Component/adminComp/AdminAdsSettings';
import DailyReward from './Component/Nweb/DailyReward';
import Gallery from './Pages/Home/Gallery';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorCom />, // Error component for fallback routes
    children: [
      {
        path: "/",
        element: <Home1 />, // Home page
      },
      {
        path: "/invitefriends",
        element: <InviteFrens />, // Invite friends page
      },
      {
        path: "/airdrop",
        element: <Airdrop />, // Airdrop page
      },
      {
        path: "/Taskss",
        element: <Taskss />
      },
      {
        path: "/Referrals",
        element: <Referrals />
      },
      {
        path: "/ProfilePage",
        element: <ProfilePage />
      },
      {
        path: "/user/:id",
        element: <Gallery/>
      },
      {
        path: "/VideoWatchPage",
        element: <VideoWatchPage />
      },
      {
        path: "/AdsPage",
        element: <AdsPage />
      },
       {
        path: "/DailyReward",
        element: <DailyReward />
      },
      {
        path: "/leaderboard",
        element: <Leaderboard />, // Leaderboard page
      },
      {
        path: "/TaskPage",
        element: <TaskPage />, // Task page
      },
      {
        path: "/withdrawx",
        element: <WithdrawForm />, // for User
      },
      {
        path: "/status",
        element: <StatusTracker />, // For User
      },
      {
        path: "/AdTask",
        element: <AdTask />, // Task page
      },
      {
        path: "/DailyCheckIn",
        element: <DailyCheckIn />, // Task page
      },
      {
        path: "/DailyRewardCard",
        element: <DailyRewardCard />, // Task page
      },
      {
        path: "/Userdashcard",
        element: <Userdashcard />, // Task page
      },
      {
        path: "/GameComponent",
        element: <GameComponent/>, // Task page
      },
      {
        path: "/GameButton",
        element: <GameButton/>, // Task page
      },
      {
        path: "/userdash",
        element: <UserDashboard/>, // Task page
      },
      {
        path: "/Animate",
        element: <Animate />, // Task page
      },
      {
        path:"/dashboardlogin",
        element: <NotAdmin236/>,
      },
    ]

  },
    {
      path: "/dashboardAdx",
      element: <NewDashboard />,
      errorElement: <ErrorCom />,
      children:[
        {
          path:"/dashboardAdx/settings",
          element: <Settings />,
        },
        {
          path:"/dashboardAdx/managetasks",
          element: <AdminTelegramTasks />,
        },
        {
          path:"/dashboardAdx/externaltasks",
          element: <AdminDailyTasks />,
        },
        {
          path:"/dashboardAdx/broadcast",
          element: <BroadcastMessage />,
        },
        {
          path:"/dashboardAdx/promo",
          element: <AdminAdvertTasks />,
        },
        {
          path:"/dashboardAdx/withdrawals",
          element: <AdminWithdrawals />,
        },
        {
          path:"/dashboardAdx/youtube",
          element: <AdminYoutube />,
        },
        {
          path:"/dashboardAdx/airdroplist",
          element: <AirdropWallets />,
        },
        {
          path:"/dashboardAdx/adminadssetting",
          element: <AdminAdsSettings/>,
        },
        {
          path:"/dashboardAdx/search",
          element: <Search />,
        },
        {
          path:"/dashboardAdx/stats",
          element: <Statistics />,
        },
  
      ]
    }
  ]);
  
  
  const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthContextProvider>
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
  </AuthContextProvider>
);
