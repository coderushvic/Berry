// src/Pages/Profile/ProfilePage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useTranslation } from "react-i18next";
import "./ProfilePage.css";

const isValidImageUrl = (u) => typeof u === "string" && u.startsWith("http");

const LetterAvatar = ({ name, size = 120 }) => {
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

const ProfilePage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      if (!id) { setUser(null); setLoading(false); return; }
      try {
        const userDoc = await getDoc(doc(db, "users", id));
        if (!userDoc.exists()) { setUser(null); } 
        else {
          const data = userDoc.data();
          const photos = Array.isArray(data.photos) ? data.photos.filter(Boolean) : [];
          setUser({ id: userDoc.id, ...data, photos, contactInfo: data.contactInfo || {}, talents: data.talents || [] });
        }
      } catch (err) { console.error(err); setUser(null); }
      finally { setLoading(false); }
    };
    fetchUser();
  }, [id]);

  const handleBackClick = () => navigate(-1);

  const uploadFileToRender = async (file) => {
    if (!file) throw new Error("No file");
    const form = new FormData(); form.append("file", file);
    const uploadUrl = process.env.REACT_APP_RENDER_UPLOAD_URL;
    const res = await fetch(uploadUrl, { method: "POST", body: form });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()).url;
  };

  const handleMainImageUpload = async (e) => {
    if (!e.target.files[0] || !user) return;
    try {
      setUploadingMain(true);
      const url = await uploadFileToRender(e.target.files[0]);
      const newPhotos = [url, ...(user.photos || []).slice(1)];
      await updateDoc(doc(db, "users", user.id), { photos: newPhotos });
      setUser(prev => ({ ...prev, photos: newPhotos }));
    } catch (err) { console.error(err); alert(t("uploadFailed")); }
    finally { setUploadingMain(false); }
  };

  const handleGalleryUpload = async (e) => {
    if (!e.target.files[0] || !user) return;
    try {
      setUploadingGallery(true);
      const url = await uploadFileToRender(e.target.files[0]);
      const updatedPhotos = [...(user.photos || []), url];
      await updateDoc(doc(db, "users", user.id), { photos: updatedPhotos });
      setUser(prev => ({ ...prev, photos: updatedPhotos }));
    } catch (err) { console.error(err); alert(t("uploadFailed")); }
    finally { setUploadingGallery(false); }
  };

  if (loading) return (
    <div className="profile-container">
      <div className="loading-container"><div className="loading-spinner"></div><p>{t("loadingProfile")}</p></div>
    </div>
  );

  if (!user) return (
    <div className="profile-container">
      <div className="error-container">
        <h2>{t("userNotFound")}</h2>
        <button onClick={handleBackClick} className="back-button">{t("back")}</button>
      </div>
    </div>
  );

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <button className="back-button" onClick={handleBackClick}>← {t("back")}</button>
        <div className="header-actions">
          <button className="action-btn favorite">❤</button>
          <button className="action-btn share">↗</button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="profile-hero">
        <div className="profile-image-container">
          {isValidImageUrl(user.photos?.[0])
            ? <img src={user.photos[0]} alt={user.name} className="profile-main-image" />
            : <LetterAvatar name={user.name} size={140} />}
          <label className="upload-label">
            <strong>{uploadingMain ? t("uploading") : t("uploadMain")}</strong>
            <input type="file" accept="image/*" onChange={handleMainImageUpload} disabled={uploadingMain} />
          </label>
          <div className="profile-badges">
            {user.online && <div className="status-badge online"><div className="pulse-dot" /> {t("onlineNow")}</div>}
            {user.verified && <div className="status-badge verified">✓ {t("verified")}</div>}
          </div>
        </div>

        <div className="profile-overview">
          <h1>{user.name}</h1>
          <div className="id-tag">ID: {user.id}</div>
          <div className="stats-grid">
            <div className="stat-card"><div>{user.age}</div><div>{t("age")}</div></div>
            <div className="stat-card"><div>{user.height}</div><div>{t("height")}</div></div>
            <div className="stat-card"><div>{user.weight}</div><div>{t("weight")}</div></div>
            <div className="stat-card"><div>{user.chestCircumference}</div><div>{t("chest")}</div></div>
          </div>
          <div className="status-price-section">
            <div><span>{t("status")}:</span> <span className={`status-value ${user.status.toLowerCase()}`}>{user.status}</span></div>
            <div><span>{t("income")}</span>: ${user.price}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button className={`tab-button ${activeTab==="info"?"active":""}`} onClick={()=>setActiveTab("info")}>📋 {t("aboutMe")}</button>
        <button className={`tab-button ${activeTab==="gallery"?"active":""}`} onClick={()=>setActiveTab("gallery")}>📸 {t("uploadGallery")} ({user.photos.length})</button>
      </div>

      {/* Tab Content */}
      {activeTab==="info" ? (
        <div className="info-content">
          <div className="content-card"><h3>{t("aboutMe")}</h3><p>{user.about}</p></div>
          <div className="content-card"><h3>{t("contactInfo")}</h3>
            <div className="contact-grid">
              <div><span>{t("telegram")}:</span> {user.contactInfo?.telegram}</div>
              <div><span>{t("wechat")}:</span> {user.contactInfo?.wechat}</div>
              <div><span>{t("phone")}:</span> {user.contactInfo?.phone}</div>
              <div><span>{t("email")}:</span> {user.contactInfo?.email}</div>
            </div>
          </div>
          <div className="content-card"><h3>{t("talents")}</h3>
            <div className="talents-grid">{user.talents.map((tt,i)=><div key={i} className="talent-item">✨ {tt}</div>)}</div>
          </div>
        </div>
      ) : (
        <div className="gallery-content">
          <label className="upload-label">
            <strong>{uploadingGallery ? t("uploading") : t("uploadGallery")}</strong>
            <input type="file" accept="image/*" onChange={handleGalleryUpload} disabled={uploadingGallery} />
          </label>
          <div className="gallery-grid">
            {user.photos.length ? user.photos.map((p,i)=>
              <div key={i} className="gallery-item">{isValidImageUrl(p)?<img src={p} alt={`${user.name}-${i}`}/>:<LetterAvatar name={user.name} size={96}/>}</div>
            ) : <div className="empty-state"><p>{t("noPhotosYet")}</p></div>}
          </div>
        </div>
      )}

      <div className="action-bar">
        <button className="message-button">💬 {t("sendMessage")}</button>
        <button className="book-button">⭐ {t("bookSession")}</button>
      </div>
    </div>
  );
};

export default ProfilePage;
