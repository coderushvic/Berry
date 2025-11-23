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
  const color = bgColors[(letter.charCodeAt(0) % bgColors.length)];

  const style = {
    width: size,
    height: size,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: color,
    color: "#fff",
    fontWeight: 700,
    fontSize: Math.round(size * 0.45),
  };

  return <div style={style}>{letter}</div>;
};

const UserList = () => {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Force Chinese as default language
  useEffect(() => {
    i18n.changeLanguage("zh");
  }, [i18n]);

  // Ads subscription
  useEffect(() => {
    const adsRef = collection(db, "ads");
    const adsQuery = query(adsRef, where("active", "==", true), orderBy("order", "asc"));

    const unsubscribe = onSnapshot(
      adsQuery,
      (snapshot) => {
        const adsData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAds(adsData.slice(0, 6));
      },
      (error) => {
        console.error("Error fetching ads:", error);
        setAds([]);
      }
    );
    return () => unsubscribe();
  }, []);

  // Users subscription
  useEffect(() => {
    setLoading(true);

    try {
      const usersRef = collection(db, "users");
      let usersQuery = query(usersRef, orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(
        usersQuery,
        (snapshot) => {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          setUsers(list);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching users:", error);
          setUsers([]);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Error in users fetch", err);
      setUsers([]);
      setLoading(false);
    }
  }, []);

  const handleUserClick = (userId) => navigate(`/user/${userId}`);

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

      {/* ADS SLIDER */}
      {ads.length > 0 && (
        <div className="ads-slider mb-4">
          <Slider {...sliderSettings}>
            {ads.map((ad) => (
              <div key={ad.id}>
                <a href={ad.link} target="_blank" rel="noopener noreferrer">
                  <img
                    src={isValidImageUrl(ad.imageUrl) ? ad.imageUrl : ""}
                    alt={`Ad ${ad.id}`}
                    style={{ width: "100%", borderRadius: "10px", cursor: "pointer" }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                </a>
              </div>
            ))}
          </Slider>
        </div>
      )}

      {/* USER LIST */}
      <div className="user-list">
        {users.length === 0 ? (
          <div className="empty-state">
            <p>{t("noUsersFound")}</p>
            <p className="empty-subtitle">{t("checkBackLater")}</p>
          </div>
        ) : (
          users.map((user, index) => (
            <div
              key={user.id}
              className="user-card"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleUserClick(user.id)}
            >
              <div className="user-main">

                {/* Avatar */}
                <div className="avatar-section">
                  {isValidImageUrl(user?.photos?.[0]) ? (
                    <img
                      src={user.photos[0]}
                      alt={user.name}
                      className="user-avatar"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <LetterAvatar name={user.name} size={72} />
                  )}
                  <div className={`status-dot ${user.online ? "online" : "offline"}`}></div>
                  {user.verified && <div className="verified-badge">✓</div>}
                </div>

                {/* Info */}
                <div className="user-info">
                  <div className="name-section">
                    <h3 className="user-name">{user.name}</h3>
                  </div>

                  <div className="user-address">📍 {user.address}</div>

                  {/* Clean details */}
                  <div className="user-details">
                    <div className="detail-item">
                      <span>{t("age")}</span> {user.age}
                    </div>

                    <div className="detail-item">
                      <span>{t("height")}</span> {user.height}
                    </div>

                    <div className="detail-item">
                      <span>{t("status")}</span> {user.online ? t("online") : t("offline")}
                    </div>

                    {/* Price value only */}
                    {user.price && (
                      <div className="detail-item price-only">
                        {user.price}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="info-footer">
        <p>{t("priceInfo")}</p>
        <p className="user-count">{users.length} {t("usersFound")}</p>
      </div>
    </div>
  );
};

export default UserList;
