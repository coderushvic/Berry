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
      if (!id) {
        // No id => show not found / empty state (per your choice C)
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
          // sanitize photos: keep only truthy strings
          const photos = Array.isArray(data.photos) && data.photos.length ? data.photos.filter(Boolean) : [];
          setUser({
            id: userDoc.id,
            name: data.name || "",
            age: data.age || "",
            height: data.height || "",
            weight: data.weight || "",
            chestCircumference: data.chestCircumference || "",
            status: data.status || "",
            price: data.price || "",
            address: data.address || "",
            contactInfo: data.contactInfo || {},
            talents: data.talents || [],
            online: data.online ?? false,
            verified: data.verified ?? false,
            about: data.about || "",
            photos,
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

  const handleBackClick = () => navigate(-1);

  const uploadFileToRender = async (file) => {
    if (!file) throw new Error("No file");
    const form = new FormData();
    form.append("file", file);
    const uploadUrl = process.env.REACT_APP_RENDER_UPLOAD_URL;
    if (!uploadUrl) throw new Error("REACT_APP_RENDER_UPLOAD_URL not set");
    const res = await fetch(uploadUrl, { method: "POST", body: form });
    if (!res.ok) {
      const txt = await res.text().catch(() => null);
      throw new Error(txt || `Upload failed (${res.status})`);
    }
    const json = await res.json();
    return json.url;
  };

  const handleMainImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;
    try {
      setUploadingMain(true);
      const url = await uploadFileToRender(file);
      const userDocRef = doc(db, "users", user.id);
      // update photos[0] to new url (preserve other photos)
      const newPhotos = [url, ...(user.photos || []).slice(1)];
      await updateDoc(userDocRef, { photos: newPhotos });
      setUser((prev) => ({ ...prev, photos: newPhotos }));
    } catch (err) {
      console.error("Upload error:", err);
      alert(t("uploadFailed") || "Upload failed");
    } finally {
      setUploadingMain(false);
    }
  };

  const handleGalleryUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;
    try {
      setUploadingGallery(true);
      const url = await uploadFileToRender(file);
      const updatedPhotos = [...(user.photos || []), url];
      const userDocRef = doc(db, "users", user.id);
      await updateDoc(userDocRef, { photos: updatedPhotos });
      setUser((prev) => ({ ...prev, photos: updatedPhotos }));
    } catch (err) {
      console.error("Gallery upload error:", err);
      alert(t("uploadFailed") || "Upload failed");
    } finally {
      setUploadingGallery(false);
    }
  };

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
          <button onClick={handleBackClick} className="back-button">{t("back")}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-button" onClick={handleBackClick}>← {t("back")}</button>
        <div className="header-actions">
          <button className="action-btn favorite">❤</button>
          <button className="action-btn share">↗</button>
        </div>
      </div>

      <div className="profile-hero">
        <div className="profile-image-container" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {isValidImageUrl(user.photos?.[0]) ? (
            <img src={user.photos[0]} alt={user.name} className="profile-main-image" style={{ borderRadius: 12, maxWidth: 360 }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
          ) : (
            <div style={{ marginBottom: 12 }}><LetterAvatar name={user.name} size={140} /></div>
          )}

          <label className="upload-label" style={{ marginTop: 8 }}>
            <strong style={{ background: "#ff7a18", color: "#fff", padding: "10px 16px", borderRadius: 8, cursor: "pointer" }}>
              {uploadingMain ? t("uploading") : t("uploadMain")}
            </strong>
            <input type="file" accept="image/*" onChange={handleMainImageUpload} disabled={uploadingMain} style={{ display: "none" }} />
          </label>

          <div className="profile-badges" style={{ marginTop: 10 }}>
            {user.online && <div className="status-badge online"><div className="pulse-dot" /> {t("onlineNow")}</div>}
            {user.verified && <div className="status-badge verified">✓ {t("verified")}</div>}
          </div>
        </div>

        <div className="profile-overview">
          <h1>{user.name}</h1>
          <div className="id-tag">ID: {user.id}</div>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-value">{user.age}</div><div className="stat-label">{t("age")}</div></div>
            <div className="stat-card"><div className="stat-value">{user.height}</div><div className="stat-label">{t("height")}</div></div>
            <div className="stat-card"><div className="stat-value">{user.weight}</div><div className="stat-label">{t("weight")}</div></div>
            <div className="stat-card"><div className="stat-value">{user.chestCircumference}</div><div className="stat-label">{t("chest")}</div></div>
          </div>
          <div className="status-price-section">
            <div className="status-display"><span className="status-label">{t("status")}:</span> <span className={`status-value ${String(user.status || "").toLowerCase()}`}>{user.status}</span></div>
            <div className="income-section"><div className="income-label">{t("income")}</div><div className="income-amount">${user.price}</div></div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`tab-button ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>📋 {t("aboutMe")}</button>
        <button className={`tab-button ${activeTab === "gallery" ? "active" : ""}`} onClick={() => setActiveTab("gallery")}>📸 {t("uploadGallery")} ({user.photos.length})</button>
      </div>

      {activeTab === "info" ? (
        <div className="info-content">
          <div className="content-card"><h3>{t("aboutMe")}</h3><p>{user.about}</p></div>
          <div className="content-card"><h3>{t("contactInfo")}</h3>
            <div className="contact-grid">
              <div className="contact-item"><span>{t("telegram")}:</span> {user.contactInfo?.telegram}</div>
              <div className="contact-item"><span>{t("wechat")}:</span> {user.contactInfo?.wechat}</div>
              <div className="contact-item"><span>{t("phone")}:</span> {user.contactInfo?.phone}</div>
              <div className="contact-item"><span>{t("email")}:</span> {user.contactInfo?.email}</div>
            </div>
          </div>
          <div className="content-card"><h3>{t("talents")}</h3>
            <div className="talents-grid">{(user.talents || []).map((tt, i) => <div key={i} className="talent-item">✨ {tt}</div>)}</div>
          </div>
        </div>
      ) : (
        <div className="gallery-content">
          <label className="upload-label" style={{ display: "block", marginBottom: 8 }}>
            <strong style={{ background: "#ff7a18", color: "#fff", padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}>
              {uploadingGallery ? t("uploading") : t("uploadGallery")}
            </strong>
            <input type="file" accept="image/*" onChange={handleGalleryUpload} disabled={uploadingGallery} style={{ display: "none" }} />
          </label>
          <div className="gallery-grid">
            {(user.photos || []).map((p, i) => (
              <div key={i} className="gallery-item" style={{ marginBottom: 8 }}>
                {isValidImageUrl(p) ? <img src={p} alt={`${user.name}-${i}`} onError={(e) => { e.currentTarget.style.display = "none"; }} /> : <LetterAvatar name={user.name} size={96} />}
              </div>
            ))}
            {(!user.photos || user.photos.length === 0) && <div className="empty-state"><p>{t("noPhotosYet") || "No photos uploaded yet"}</p></div>}
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
