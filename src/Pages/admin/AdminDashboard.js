import React, { useState, useEffect, useRef } from 'react';
import LogoutButton from '../../Component/adminComp/LogoutButton';
import { useAuthContext } from '../../context/AuthContext';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Outlet } from "react-router-dom";
import { IoCloseCircle } from 'react-icons/io5';
import { HiMenuAlt1 } from "react-icons/hi";
import AdminWithdrawals from './AdminWithdrawals'; // Import the AdminWithdrawals component

// Function to mask email
const maskEmail = (email) => {
    const [localPart, domain] = email.split('@');
    const visibleChars = 3;
    const maskedLocal = localPart.slice(0, visibleChars) + '***';
    return `${maskedLocal}@${domain}`;
};

const linksTo = [
    {
        link: '/dashboardAdx',
        title: 'NewDashboard',
    },
    {
        link: '/dashboardAdx/managetasks',
        title: 'Telegram Tasks',
    },
    {
        link: '/dashboardAdx/externaltasks',
        title: 'Daily Tasks',
    },
    {
        link: '/dashboardAdx/broadcast',
        title: 'Broadcast',
    },
    {
        link: '/dashboardAdx/airdroplist',
        title: 'Airdrop List',
    },
    {
        link: '/dashboardAdx/adminadssettings',
        title: 'AdminAdsSettings',
    },
    {
        link: '/dashboardAdx/search',
        title: 'Users list',
    },
    {
        link: '/dashboardAdx/withdrawals', // New route for withdrawals
        title: 'Withdrawals',
    },
    {
        link: '/dashboardAdx/settings',
        title: 'Settings',
    },
];

const AdminDashboard = () => {
    const { user, loading } = useAuthContext();
    const [showMenu, setShowMenu] = useState(false);
    const pageRoute = useLocation();
    const [pageTitle, setPageTitle] = useState('');
    const infoRefTwo = useRef(null);
    const location = useNavigate();

    const handleClickOutside = (event) => {
        if (infoRefTwo.current && !infoRefTwo.current.contains(event.target)) {
            setShowMenu(false);
        }
    };

    useEffect(() => {
        const titles = {
            '/dashboardAdx': 'New Dashboard',
            '/dashboardAdx/managetasks': 'Manage Telegram Tasks',
            '/dashboardAdx/externaltasks': 'Manage External Tasks',
            '/dashboardAdx/broadcast': 'Broadcast',
            '/dashboardAdx/promo': 'Adverts/Promo Tasks',
            '/dashboardAdx/youtube': 'Youtube Tasks',
            '/dashboardAdx/ranks': 'Update Users Ranks',
            '/dashboardAdx/airdroplist': 'Airdrop List',
            '/dashboardAdx/settings': 'Settings',
            '/dashboardAdx/withdrawals': 'Withdrawal Requests', // New title
        };
        setPageTitle(titles[pageRoute.pathname] || 'Users list');
    }, [pageRoute.pathname]);

    useEffect(() => {
        if (!loading && !user) {
            location("/dashboardlogin");
        }
    }, [user, loading, location]);

    useEffect(() => {
        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    if (!user) {
        return null;
    }

    return (
        <div className="w-full flex justify-center">
            <div className="flex flex-col pt-5 space-y-3 w-full">
                <div className='w-full flex justify-center flex-col -mt-5'>
                    <div className='w-full flex justify-between gap-2 items-center bg-[#55aa24] p-4 fixed top-0 left-0 right-0 z-10'>
                        <div className='flex sm:w-[18%] items-center'>
                            <NavLink to='/dashboardAdx/stats' className=''>
                                <img src='/cat-icon.png' alt='not' className='w-[20px]'/>
                            </NavLink>
                        </div>

                        <div className='sm:w-[82%] flex flex-1 justify-between items-center sm:px-4'>
                            <h1 className='text-[16px] sm:text-[18px] font-bold text-nowrap text-white'>
                                {pageTitle}
                            </h1>
                            
                            <div className='relative flex justify-end w-[60%]'>
                                {showMenu ? (
                                    <button onClick={() => setShowMenu(false)}
                                        className='h-[35px] w-[35px] rounded-full bg-[#cecdcd] flex items-center justify-center text-[#fff]'>
                                        <IoCloseCircle size={18} className=''/>
                                    </button>
                                ) : (
                                    <button onClick={() => setShowMenu(true)}
                                        className='h-[35px] w-[35px] rounded-full bg-[#606060] flex items-center justify-center text-[#fff]'>
                                        <HiMenuAlt1 size={18} className=''/>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className='w-full flex justify-between'>
                        <div className={`${showMenu ? 'visible opacity-100 pointer-events-auto left-0 right-0 bottom-0' : 'invisible opacity-0 sm:opacity-100 sm:visible pointer-events-none sm:pointer-events-auto left-[-100%] sm:left-0'} backdrop-blur-[1px] w-full ease-in duration-200 bg-[#2424243f] z-20 sm:w-[18%] flex flex-col top-0 fixed sm:relative`}>
                            <div ref={infoRefTwo} className={`w-[70%] sm:w-full bg-[#8fec42] h-screen absolute left-0 top-0 flex flex-col space-y-5 p-4`}>
                                <div className='flex items-center flex-row sm:flex-col w-full gap-2'>
                                    <img src='/cat-icon.png' alt='not' className='w-[18px] sm:w-[24px]'/>
                                    <span className='text-[13px]'>
                                        {user && maskEmail(user.email)}
                                    </span>
                                </div>

                                <div className='flex flex-col space-y-3 w-full pt-8'>
                                    {linksTo.map((menu, index) => (
                                        <NavLink 
                                            to={menu.link} 
                                            onClick={() => setShowMenu(false)} 
                                            key={index} 
                                            className={`${pageRoute.pathname === `${menu.link}` ? 'bg-[#55aa24]' : ''} px-2 py-3 flex rounded-[6px] items-center space-x-1 font-medium text-white`}
                                        >
                                            <span>{menu.title}</span>
                                        </NavLink>
                                    ))}
                                    <LogoutButton/>
                                </div>
                            </div>
                        </div>

                        <div className='w-full sm:w-[82%] flex px-4 sm:px-6 flex-col pt-[70px]'>
                            {/* Render AdminWithdrawals if on the withdrawals route */}
                            {pageRoute.pathname === '/dashboardAdx/withdrawals' ? (
                                <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                                    <AdminWithdrawals />
                                </div>
                            ) : (
                                <Outlet />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
