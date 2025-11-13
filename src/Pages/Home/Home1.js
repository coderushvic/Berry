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
import { useTranslation } from "react-i18next";
import './UserList.css';

const UserList = () => {
  const { t } = useTranslation();
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
        imageUrl: 'https://via.placeholder.com/150'
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
        imageUrl: ''
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

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };

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
          <p>{t("loadingUsers")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      <div className="app-header">
        <div className="header-content">
          <h1 className="app-title">{t("eliteMatch")}</h1>
          <p className="app-subtitle">{t("annualIncomeRange")}</p>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            {t("all")}
          </button>

          <button
            className={`filter-tab ${activeFilter === 'online' ? 'active' : ''}`}
            onClick={() => setActiveFilter('online')}
          >
            {t("online")}
          </button>

          <button
            className={`filter-tab ${activeFilter === 'verified' ? 'active' : ''}`}
            onClick={() => setActiveFilter('verified')}
          >
            {t("verified")}
          </button>
        </div>

        <div className="user-stats">
          <span className="stat">{t("total")}: {filteredUsers.length}</span>
          <span className="stat">{t("online")}: {filteredUsers.filter(u => u.online).length}</span>
        </div>
      </div>

      <div className="user-list">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <p>{t("noUsersFound")}</p>
            <p className="empty-subtitle">{t("checkBackLater")}</p>
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
                        <span className="verified-icon" title={t("verifiedProfile")}>✓</span>
                      )}
                    </div>
                    <div className="price-section">
                      <span className="price-label">{t("income")}</span>
                      <span className="user-price">${user.price}</span>
                    </div>
                  </div>

                  <div className="user-address">
                    <span className="location-icon">📍</span>
                    {user.address}
                  </div>

                  <div className="user-details">
                    <div className="detail-item">
                      <span className="detail-label">{t("age")}</span>
                      <span className="detail-value">{user.age}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">{t("height")}</span>
                      <span className="detail-value">{user.height}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">{t("status")}</span>
                      <span className={`status ${user.online ? 'online' : 'offline'}`}>
                        {user.online ? t("online") : t("offline")}
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
        <p>{t("priceInfo")}</p>
        <p className="user-count">{filteredUsers.length} {t("usersFound")}</p>
      </div>
    </div>
  );
};

export default UserList;
