// src/Pages/UserList/UserList.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useTranslation } from "react-i18next";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./UserList.css";

const isValidImageUrl = (u) => typeof u === "string" && u.startsWith("http");

const LetterAvatar = ({ name, size = 56 }) => {
  const letter = (name && name.charAt(0).toUpperCase()) || "U";
  const bgColors = ["#F97316", "#06B6D4", "#7C3AED", "#EF4444", "#10B981"];
  const color = bgColors[letter.charCodeAt(0) % bgColors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: color, color: "#fff", fontWeight: 700, fontSize: size * 0.45,
    }}>{letter}</div>
  );
};

const UserList = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Ads
  useEffect(() => {
    const adsQuery = query(collection(db, "ads"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(adsQuery, snapshot => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAds(data.slice(0, 6));
    }, err => console.error(err));
    return () => unsubscribe();
  }, []);

  // Users
  useEffect(() => {
    setLoading(true);
    let usersQuery = query(collection(db, "users"), orderBy("name"));
    if (activeFilter === "online") usersQuery = query(collection(db, "users"), where("online", "==", true), orderBy("name"));
    if (activeFilter === "verified") usersQuery = query(collection(db, "users"), where("verified", "==", true), orderBy("name"));

    const unsubscribe = onSnapshot(usersQuery, snapshot => {
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => { console.error(err); setLoading(false); });
    return () => unsubscribe();
  }, [activeFilter]);

  const handleUserClick = (id) => navigate(`/user/${id}`);

  const sliderSettings = {
    dots: true, infinite: ads.length > 1, speed: 500,
    slidesToShow: 1, slidesToScroll: 1, autoplay: ads.length > 1,
    autoplaySpeed: 5000, arrows: true,
  };

  return (
    <div className="user-list-container">
      {/* Ads Slider */}
      {ads.length > 0 && (
        <div className="ads-slider mb-6">
          <Slider {...sliderSettings}>
            {ads.map(ad => (
              <div key={ad.id}>
                <a href={ad.link} target="_blank" rel="noopener noreferrer">
                  <img
                    src={isValidImageUrl(ad.imageUrl) ? ad.imageUrl : ""}
                    alt={`Ad ${ad.id}`}
                    className="ad-image"
                    onError={(e) => e.currentTarget.style.display = "none"}
                  />
                </a>
              </div>
            ))}
          </Slider>
        </div>
      )}

      {/* Filters */}
      <div className="filter-section">
        <div className="filter-tabs">
          {["all", "online", "verified"].map(f => (
            <button
              key={f}
              className={`filter-tab ${activeFilter === f ? "active" : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {t(f)}
            </button>
          ))}
        </div>
        <div className="user-counts">
          {t("total")}: {users.length}
        </div>
      </div>

      {/* User Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t("loadingProfile")}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <p>{t("noUsersFound")}</p>
          <p className="empty-subtitle">{t("checkLater")}</p>
        </div>
      ) : (
        <div className="user-grid">
          {users.map(user => (
            <div key={user.id} className="user-card" onClick={() => handleUserClick(user.id)}>
              <div className="avatar-wrapper">
                {isValidImageUrl(user.photos?.[0])
                  ? <img src={user.photos[0]} alt={user.name} className="user-avatar" />
                  : <LetterAvatar name={user.name} size={64} />}
                <span className={`status-dot ${user.online ? "online" : "offline"}`}></span>
                {user.verified && <span className="verified-badge">✓</span>}
              </div>
              <div className="user-info">
                <h3 className="user-name">{user.name}</h3>
                <p className="user-location">{user.address}</p>
                <div className="user-stats">
                  <span>{t("age")}: {user.age}</span>
                  <span>{t("status")}: {user.online ? t("online") : t("offline")}</span>
                  <span>{t("income")}: {user.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserList;
