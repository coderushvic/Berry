import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();

  // Function to check if the link is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-[450px] -translate-x-1/2 items-center justify-evenly bg-[#fbfbfb]">
      
      <Link to="/" className={`grid justify-items-center gap-0.5 p-2 text-xs font-medium transition-opacity ${isActive('/') ? 'opacity-100 text-black' : 'opacity-50 text-black'} group`}>
        <span className={`grid h-9 w-12 place-content-center rounded-full transition-colors ${isActive('/') ? 'bg-gray-200' : 'bg-transparent group-hover:bg-gray-200'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-house size-6 ${isActive('/home') ? 'text-black' : 'group-hover:text-black'}`}>
            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
            <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
        </span>
        <span>Home</span>
      </Link>

      <Link
  to="/TaskPage"
  className={`grid justify-items-center gap-0.5 p-2 text-xs font-medium transition-opacity ${
    isActive('/TaskPage') ? 'opacity-100 text-black' : 'opacity-50 text-black'
  } group`}
>
  <span
    className={`grid h-9 w-12 place-content-center rounded-full transition-colors ${
      isActive('/TaskPage') ? 'bg-gray-200' : 'bg-transparent group-hover:bg-gray-200'
    }`}
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`size-6 ${
        isActive('/TaskPage') ? 'text-black' : 'group-hover:text-black'
      }`}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M12.37 8.87988H17.62"
          stroke="#292D32"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <path
          d="M6.38 8.87988L7.13 9.62988L9.38 7.37988"
          stroke="#292D32"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <path
          d="M12.37 15.8799H17.62"
          stroke="#292D32"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <path
          d="M6.38 15.8799L7.13 16.6299L9.38 14.3799"
          stroke="#292D32"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <path
          d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
          stroke="#292D32"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </g>
    </svg>
  </span>
  <span>Task</span>
</Link>


      <Link to="/leaderboard" className={`grid justify-items-center gap-0.5 p-2 text-xs font-medium transition-opacity ${isActive('/leaderboard') ? 'opacity-100 text-black' : 'opacity-50 text-black'} group`}>
        <span className={`grid h-9 w-12 place-content-center rounded-full transition-colors ${isActive('/leaderboard') ? 'bg-gray-200' : 'bg-transparent group-hover:bg-gray-200'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-trophy size-6 ${isActive('/leaderboard') ? 'text-black' : 'group-hover:text-black'}`}>
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
          </svg>
        </span>
        <span>Leaderboard</span>
      </Link>

      <Link to="/invitefriends" className={`grid justify-items-center gap-0.5 p-2 text-xs font-medium transition-opacity ${isActive('/invitefriends') ? 'opacity-100 text-black' : 'opacity-50 text-black'} group`}>
        <span className={`grid h-9 w-12 place-content-center rounded-full transition-colors ${isActive('/invitefriends') ? 'bg-gray-200' : 'bg-transparent group-hover:bg-gray-200'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-users size-6 ${isActive('/inviteFrens') ? 'text-black' : 'group-hover:text-black'}`}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </span>
        <span>Friends</span>
      </Link>

    </div>
  );
};

export default Footer;