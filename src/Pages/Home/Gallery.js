// src/Pages/Profile/ProfilePage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useTranslation } from "react-i18next";
import "./ProfilePage.css";

const isValidImageUrl = (u) => typeof u === "string" && u.startsWith("http");

const LetterAvatar = ({ name, size = 120 }) => {
  const letter = (name && name.charAt(0).toUpperCase()) || "U";
  const bgColors = ["#F97316", "#06B6D4", "#7C3AED", "#EF4444", "#10B981"];
  const color = bgColors[letter.charCodeAt(0) % bgColors.length];
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

const ProfilePage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState(null);

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      if (!id) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const userDocRef = doc(db, "users", id);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          setUser(null);
        } else {
          const data = userDoc.data();
          const photos = Array.isArray(data.photos)
            ? data.photos.filter(Boolean)
            : [];

          setUser({
            name: data.name || "",
            age: data.age || "",
            height: data.height || "",
            weight: data.weight || "",
            chestCircumference: data.chestCircumference || "",
            price: data.price || "",
            address: data.address || "",
            talents: data.talents || [],
            verified: data.verified ?? false,
            photos,
            contactInfo: {
              telegram: data.contactInfo?.telegram || "",
              wechat: data.contactInfo?.wechat || "",
              phone: data.contactInfo?.phone || "",
            },
          });
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // ENABLE ANDROID HARDWARE BACK BUTTON
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      navigate(-1);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  const handleBackClick = () => navigate(-1);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>{t("loadingProfile")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error-container">
          <h2>{t("userNotFound") || "User not found"}</h2>
          <button onClick={handleBackClick} className="back-button">
            {t("back")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-button" onClick={handleBackClick}>
          ← {t("back")}
        </button>
      </div>

      <div className="profile-hero">
        <div
          className="profile-image-container"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {isValidImageUrl(user.photos?.[0]) ? (
            <img
              src={user.photos[0]}
              alt={user.name}
              className="profile-main-image"
              style={{ borderRadius: 12, maxWidth: 360 }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div style={{ marginBottom: 12 }}>
              <LetterAvatar name={user.name} size={140} />
            </div>
          )}

          {user.verified && (
            <div className="status-badge verified">✓ {t("verified")}</div>
          )}
        </div>

        <div className="profile-overview">
          <h1>{user.name}</h1>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{user.age}</div>
              <div className="stat-label">{t("age")}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user.height}</div>
              <div className="stat-label">{t("height")}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user.weight}</div>
              <div className="stat-label">{t("weight")}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user.chestCircumference}</div>
              <div className="stat-label">{t("chest")}</div>
            </div>
          </div>

          {user.price && (
            <div className="premium-price-box">
              <div className="premium-price-amount">{user.price}</div>
            </div>
          )}

          {user.talents && user.talents.length > 0 && (
            <div className="talents-section">
              <h3>{t("talents")}</h3>
              <div className="talents-grid">
                {user.talents.map((t, i) => (
                  <div key={i} className="talent-item">
                    ✨ {t}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONTACT INFO BADGES */}
          {user.contactInfo && (
            <div className="contact-info-section">
              <h3>{t("contactInfo")}</h3>
              <div className="contact-badges">
                {user.contactInfo.telegram && (
                  <span className="contact-badge telegram">
                    <strong>{t("telegram")}:</strong> {user.contactInfo.telegram}
                  </span>
                )}
                {user.contactInfo.wechat && (
                  <span className="contact-badge wechat">
                    <strong>{t("wechat")}:</strong> {user.contactInfo.wechat}
                  </span>
                )}
                {user.contactInfo.phone && (
                  <span className="contact-badge phone">
                    <strong>{t("phone")}:</strong> {user.contactInfo.phone}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Gallery */}
          {user.photos && user.photos.length > 0 && (
            <div className="profile-gallery">
              <h3>{t("gallery")}</h3>

              <div className="gallery-grid">
                {user.photos.map((p, i) => (
                  <div
                    key={i}
                    className="gallery-thumb"
                    onClick={() => setModalImage(p)}
                  >
                    <img
                      src={p}
                      alt={`gallery-${i}`}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen modal image */}
      {modalImage && (
        <div
          className="image-modal-overlay"
          onClick={() => setModalImage(null)}
        >
          <div className="image-modal-content">
            <img src={modalImage} alt="Full view" className="image-modal-img" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
