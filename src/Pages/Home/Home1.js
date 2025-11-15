// src/Pages/UserList/UserList.js
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
import Slider from "react-slick"; // Slider
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './UserList.css';

const UserList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [ads, setAds] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  /** ------------------ FETCH USERS ------------------ **/
  useEffect(() => {
    const usersRef = collection(db, "users");

    const usersQuery = (activeFilter === "online")
      ? query(usersRef, where("online", "==", true), orderBy("name"))
      : (activeFilter === "verified")
      ? query(usersRef, where("verified", "==", true), orderBy("name"))
      : query(usersRef, orderBy("name"));

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
        setUsers(list);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [activeFilter]);

  /** ------------------ FETCH ADS ------------------ **/
  useEffect(() => {
    const adsRef = collection(db, "ads");
    const adsQuery = query(adsRef, orderBy("order", "asc"));

    const unsubscribe = onSnapshot(
      adsQuery,
      (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
        setAds(list);
      },
      (error) => console.error("Error fetching ads:", error)
    );

    return () => unsubscribe();
  }, []);

  /** ------------------ HANDLE NAVIGATE ------------------ **/
  const handleUserClick = (userId) => navigate(`/user/${userId}`);

  const filteredUsers = users.filter((user) => {
    switch (activeFilter) {
      case "online": return user.online;
      case "verified": return user.verified;
      default: return true;
    }
  });

  /** ------------------ SLIDER SETTINGS ------------------ **/
  const sliderSettings = {
    dots: true,
    infinite: ads.length > 1,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: ads.length > 1,
    autoplaySpeed: 4000,
    arrows: true,
  };

  if (loading) {
    return (
      <div className="user-list-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t("loadingProfile")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-list-container">

      {/* ------------------ ADS SLIDER ------------------ */}
      {ads.length > 0 && (
        <div className="ads-slider mb-4">
          <Slider {...sliderSettings}>
            {ads.map((ad) => (
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

      {/* ------------------ FILTER TABS ------------------ */}
      <div className="filter-section">
        <div className="filter-tabs">
          <button className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>{t("all")}</button>
          <button className={`filter-tab ${activeFilter === 'online' ? 'active' : ''}`} onClick={() => setActiveFilter('online')}>{t("online")}</button>
          <button className={`filter-tab ${activeFilter === 'verified' ? 'active' : ''}`} onClick={() => setActiveFilter('verified')}>{t("verified")}</button>
        </div>
        <div className="user-stats">
          <span>{t("total")}: {filteredUsers.length}</span>
          <span>{t("online")}: {filteredUsers.filter(u => u.online).length}</span>
        </div>
      </div>

      {/* ------------------ USER LIST ------------------ */}
      <div className="user-list">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <p>{t("noUsersFound")}</p>
            <p>{t("checkLater")}</p>
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
                  {user.photos?.[0] ? (
                    <img src={user.photos[0]} alt={user.name} className="user-avatar" />
                  ) : (
                    <div className="avatar">{user.name.charAt(0)}</div>
                  )}
                  <div className={`status-dot ${user.online ? 'online' : 'offline'}`}></div>
                  {user.verified && <div className="verified-badge">✓</div>}
                </div>

                <div className="user-info">
                  <div className="name-section">
                    <div className="name-wrapper">
                      <h3 className="user-name">{user.name}</h3>
                      {user.verified && <span className="verified-icon">✓</span>}
                    </div>
                    <div className="price-section">
                      <span>{t("income")}</span>
                      <span className="user-price">{user.price}</span>
                    </div>
                  </div>

                  <div className="user-address">
                    <span>📍</span>{user.address}
                  </div>

                  <div className="user-details">
                    <div className="detail-item">
                      <span>{t("age")}</span>
                      <span>{user.age}</span>
                    </div>
                    <div className="detail-item">
                      <span>{t("height")}</span>
                      <span>{user.height}</span>
                    </div>
                    <div className="detail-item">
                      <span>{t("status")}</span>
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
    </div>
  );
};

export default UserList;
