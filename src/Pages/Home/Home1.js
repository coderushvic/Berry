import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import './UserList.css';

const UserList = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch users from Firebase
  useEffect(() => {
    const demoUsers = [
      {
        id: '1',
        name: 'Windlike Girl',
        address: '2.2km away',
        age: 24,
        height: '165cm',
        price: '20-40w',
        online: true,
        verified: true,
        imageUrl: 'https://via.placeholder.com/150' // demo placeholder
      },
      {
        id: '2',
        name: 'Fora',
        address: '1km away',
        age: 22,
        height: '156cm',
        price: '15-25w',
        online: true,
        verified: false,
        imageUrl: '' // no image → fallback to initials
      }
    ];

    const fetchUsers = async () => {
      try {
        setLoading(true);

        let usersQuery;
        const usersRef = collection(db, 'users');

        switch (activeFilter) {
          case 'online':
            usersQuery = query(usersRef, where('online', '==', true), orderBy('name'));
            break;
          case 'verified':
            usersQuery = query(usersRef, where('verified', '==', true), orderBy('name'));
            break;
          default:
            usersQuery = query(usersRef, orderBy('name'));
        }

        const unsubscribe = onSnapshot(
          usersQuery,
          (querySnapshot) => {
            const usersData = [];
            querySnapshot.forEach((doc) => {
              usersData.push({ id: doc.id, ...doc.data() });
            });

            // If no data in Firebase, use demo data
            setUsers(usersData.length === 0 ? demoUsers : usersData);
            setLoading(false);
          },
          (error) => {
            console.error('Error fetching users:', error);
            setUsers(demoUsers);
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (err) {
        console.error('Error:', err);
        setUsers(demoUsers);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [activeFilter]);

  // Handle user click
  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  // Apply filters
  const filteredUsers = users.filter(user => {
    switch (activeFilter) {
      case 'online':
        return user.online;
      case 'verified':
        return user.verified;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="user-list-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      <div className="app-header">
        <div className="header-content">
          <h1 className="app-title">Elite Match</h1>
          <p className="app-subtitle">Annual Income Range</p>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-tabs">
          {['all', 'online', 'verified'].map(filter => (
            <button
              key={filter}
              className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
        <div className="user-stats">
          <span className="stat">Total: {filteredUsers.length}</span>
          <span className="stat">Online: {filteredUsers.filter(u => u.online).length}</span>
        </div>
      </div>

      <div className="user-list">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <p>No users found</p>
            <p className="empty-subtitle">Check back later for new profiles</p>
          </div>
        ) : (
          filteredUsers.map((user, index) => (
            <div
              key={user.id}
              className="user-card"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleUserClick(user.id)}
            >
              <div className="user-main">
                <div className="avatar-section">
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.name}
                      className="user-avatar"
                    />
                  ) : (
                    <div className="avatar">
                      {user.name.charAt(0)}
                    </div>
                  )}

                  <div className={`status-dot ${user.online ? 'online' : 'offline'}`}></div>
                  {user.verified && <div className="verified-badge">✓</div>}
                </div>

                <div className="user-info">
                  <div className="name-section">
                    <div className="name-wrapper">
                      <h3 className="user-name">{user.name}</h3>
                      {user.verified && (
                        <span className="verified-icon" title="Verified Profile">✓</span>
                      )}
                    </div>
                    <div className="price-section">
                      <span className="price-label">Income</span>
                      <span className="user-price">${user.price}</span>
                    </div>
                  </div>

                  <div className="user-address">
                    <span className="location-icon">📍</span>
                    {user.address}
                  </div>

                  <div className="user-details">
                    <div className="detail-item">
                      <span className="detail-label">Age</span>
                      <span className="detail-value">{user.age}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Height</span>
                      <span className="detail-value">{user.height}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status</span>
                      <span className={`status ${user.online ? 'online' : 'offline'}`}>
                        {user.online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="info-footer">
        <p>💰 Price indicates annual income range in 10,000s (w)</p>
        <p className="user-count">{filteredUsers.length} users found</p>
      </div>
    </div>
  );
};

export default UserList;
