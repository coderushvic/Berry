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
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './UserList.css';

const UserList = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState([]);
  const navigate = useNavigate();

  // Fetch ads from Firebase
  useEffect(() => {
    const adsRef = collection(db, "ads");
    const adsQuery = query(adsRef, orderBy("order", "asc")); // max 6 slides

    const unsubscribe = onSnapshot(adsQuery, (snapshot) => {
      const adsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAds(adsData.slice(0, 6));
    }, (error) => {
      console.error("Error fetching ads:", error);
      setAds([]);
    });

    return () => unsubscribe();
  }, []);

  // Fetch users from Firebase
  useEffect(() => {
    const demoUsers = [
      { id: '1', name: 'Windlike Girl', address: '2.2km away', age: 24, height: '165cm', price: '20-40w', online: true, verified: true, imageUrl: 'https://via.placeholder.com/150' },
      { id: '2', name: 'Fora', address: '1km away', age: 22, height: '156cm', price: '15-25w', online: true, verified: false, imageUrl: '' }
    ];

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        let usersQuery;

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
            querySnapshot.forEach((doc) => usersData.push({ id: doc.id, ...doc.data() }));
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

  const handleUserClick = (userId) => navigate(`/user/${userId}`);

  const filteredUsers = users.filter(user => {
    if (activeFilter === 'online') return user.online;
    if (activeFilter === 'verified') return user.verified;
    return true;
  });

  const sliderSettings = {
    dots: true,
    infinite: ads.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: ads.length > 1,
    autoplaySpeed: 5000,
    arrows: true,
  };

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
      {/* Ads Slider */}
      {ads.length > 0 && (
        <div className="ads-slider mb-4">
          <Slider {...sliderSettings}>
            {ads.map(ad => (
              <div key={ad.id}>
                <a href={ad.link} target="_blank" rel="noopener noreferrer">
                  <img
                    src={ad.imageUrl}
                    alt={`Ad ${ad.id}`}
                    style={{ width: '100%', borderRadius: '10px', cursor: 'pointer' }}
                  />
                </a>
              </div>
            ))}
          </Slider>
        </div>
      )}

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-tabs">
          {['all','online','verified'].map(filter => (
            <button
              key={filter}
              className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {t(filter)}
            </button>
          ))}
        </div>

        <div className="user-stats">
          <span className="stat">{t("total")}: {filteredUsers.length}</span>
          <span className="stat">{t("online")}: {filteredUsers.filter(u => u.online).length}</span>
        </div>
      </div>

      {/* User List */}
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
                    <img src={user.imageUrl} alt={user.name} className="user-avatar"/>
                  ) : (
                    <div className="avatar">{user.name.charAt(0)}</div>
                  )}
                  <div className={`status-dot ${user.online ? 'online' : 'offline'}`}></div>
                  {user.verified && <div className="verified-badge">✓</div>}
                </div>

                <div className="user-info">
                  <div className="name-section">
                    <h3 className="user-name">{user.name}</h3>
                    {user.verified && <span className="verified-icon" title={t("verifiedProfile")}>✓</span>}
                    <div className="price-section">
                      <span className="price-label">{t("income")}</span>
                      <span className="user-price">{user.price}</span>
                    </div>
                  </div>
                  <div className="user-address">📍 {user.address}</div>
                  <div className="user-details">
                    <div className="detail-item"><span>{t("age")}</span>: {user.age}</div>
                    <div className="detail-item"><span>{t("height")}</span>: {user.height}</div>
                    <div className="detail-item"><span>{t("status")}</span>: {user.online ? t("online") : t("offline")}</div>
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
