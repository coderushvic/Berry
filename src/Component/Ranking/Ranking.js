import React, { useEffect, useState } from 'react';
import { useUser } from '../../context/userContext';
import { FiRefreshCw } from 'react-icons/fi';
import { IoMdTrophy } from 'react-icons/io';

const UserRanking = () => {
  const { leaderBoard, activeUserRank, fullName, username, balance, totalUsers, fetchLeaderBoard } = useUser();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Enhanced periodic fetching with loading state
  useEffect(() => {
    const fetchData = async () => {
      setIsRefreshing(true);
      try {
        await fetchLeaderBoard();
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchData(); // Initial fetch
    const fetchInterval = setInterval(fetchData, 15000); // Fetch every 15 seconds

    return () => clearInterval(fetchInterval);
  }, [fetchLeaderBoard]);

  // Helper functions
  const getInitials = (name) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    return nameParts
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  };

  const getColorByRank = (rank) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-400';
    if (rank === 3) return 'bg-gradient-to-br from-amber-600 to-amber-800';
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600'
    ];
    return colors[rank % colors.length];
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(2)}M`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchLeaderBoard();
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pb-20">
      {/* Active User Card (Sticky Header) */}
      <div className="sticky top-0 z-10 p-4 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className={`flex items-center text-sm text-gray-500 ${isRefreshing ? 'opacity-50' : 'hover:text-gray-700'}`}
          >
            <FiRefreshCw className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} size={14} />
            {formatTime(lastUpdated)}
          </button>
        </div>
        
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getColorByRank(activeUserRank)}`}>
                {getInitials(fullName || username)}
              </div>
              <div>
                <p className="font-medium text-gray-900 truncate max-w-[120px]">{fullName || username}</p>
                <p className="text-sm text-gray-500">{formatNumber(balance)} NEWCATS</p>
              </div>
            </div>
            <div className="bg-white px-3 py-1 rounded-full shadow-xs">
              <span className="font-semibold text-gray-700">#{activeUserRank}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Stats */}
      <div className="px-4 mt-2 flex items-center justify-between text-sm">
        <p className="text-gray-500">
          Showing <span className="font-medium text-gray-700">{leaderBoard.length}</span> of {totalUsers} holders
        </p>
        <p className="text-gray-400">Top 100</p>
      </div>

      {/* Leaderboard List */}
      <div className="mt-2 px-4 space-y-2">
        {leaderBoard
          .sort((a, b) => b.balance - a.balance)
          .map((user, index) => (
            <div 
              key={user.id} 
              className={`p-3 rounded-lg transition-all ${index < 3 ? 'bg-gradient-to-r from-amber-50 to-yellow-50' : 'hover:bg-gray-50'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getColorByRank(index + 1)}`}>
                      {user.photo_url ? (
                        <img
                          src={user.photo_url}
                          alt={user.username}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.parentElement.innerHTML = `<span class="font-semibold text-[14px]">${getInitials(user.fullName || user.username)}</span>`;
                          }}
                        />
                      ) : (
                        getInitials(user.fullName || user.username)
                      )}
                    </div>
                    {index < 3 && (
                      <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
                        <IoMdTrophy className={index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-700'} size={14} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-[140px]">
                      {user.fullName || user.username}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatNumber(user.balance)} NEWCATS
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full ${index < 3 ? 'bg-white shadow-xs' : ''}`}>
                  <span className={`font-semibold ${index < 3 ? 'text-gray-700' : 'text-gray-500'}`}>
                    #{index + 1}
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Loading Indicator */}
      {isRefreshing && (
        <div className="fixed top-20 right-4 bg-white px-3 py-1 rounded-full shadow-md flex items-center text-sm text-gray-600">
          <FiRefreshCw className="animate-spin mr-2" size={14} />
          Updating...
        </div>
      )}
    </div>
  );
};

export default UserRanking;
