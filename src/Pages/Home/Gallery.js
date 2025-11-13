import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/firestore";
import { useTranslation } from "react-i18next";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const demoUser = useMemo(() => ({
    id: id || "CDC043",
    name: "Nanyu",
    age: 24,
    height: "170cm",
    weight: "50kg",
    chestCircumference: "88cm",
    status: "Available",
    price: "8-14w",
    address: "High-Tech Zone, Nanmen, Shiyangchang, Shanghai",
    contactInfo: {
      telegram: "@NanyuOfficial",
      wechat: "Nanyu_2024",
      phone: "+86 138 0013 8000",
      email: "nanyu@example.com",
    },
    talents: [
      "Multi-lingual (English, Mandarin, Japanese)",
      "Professional Dancer",
      "Certified Masseuse",
      "Cooking Expert",
      "Photography Skills",
      "Musical Instrument (Piano)",
    ],
    online: true,
    verified: true,
    about: "Professional and friendly companion with 3 years of experience. Fluent in English, Mandarin, and Japanese. Passionate about arts, music, and creating memorable experiences.",
    photos: [
      "https://via.placeholder.com/400x500/667eea/ffffff?text=Main+Photo",
      "https://via.placeholder.com/400x500/764ba2/ffffff?text=Gallery+1",
      "https://via.placeholder.com/400x500/10b981/ffffff?text=Gallery+2",
    ],
  }), [id]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        if (!id) {
          setUser(demoUser);
          return;
        }
        const userDocRef = doc(db, "users", id);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUser({
            id: userDoc.id,
            name: data.name || demoUser.name,
            age: data.age || demoUser.age,
            height: data.height || demoUser.height,
            weight: data.weight || demoUser.weight,
            chestCircumference: data.chestCircumference || demoUser.chestCircumference,
            status: data.status || demoUser.status,
            price: data.price || demoUser.price,
            address: data.address || demoUser.address,
            contactInfo: {
              telegram: data.contactInfo?.telegram || demoUser.contactInfo.telegram,
              wechat: data.contactInfo?.wechat || demoUser.contactInfo.wechat,
              phone: data.contactInfo?.phone || demoUser.contactInfo.phone,
              email: data.contactInfo?.email || demoUser.contactInfo.email,
            },
            talents: data.talents || demoUser.talents,
            online: data.online ?? demoUser.online,
            verified: data.verified ?? demoUser.verified,
            about: data.about || demoUser.about,
            photos: data.photos && data.photos.length ? data.photos : demoUser.photos,
          });
        } else {
          setUser(demoUser);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(demoUser);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, demoUser]);

  const handleBackClick = () => navigate(-1);

  const handleMainImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;
    try {
      setUploadingMain(true);
      const imageRef = ref(storage, `profileImages/${user.id}_main_${file.name}`);
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);
      const userDocRef = doc(db, "users", user.id);
      await updateDoc(userDocRef, { "photos.0": downloadURL });
      setUser(prev => ({ ...prev, photos: [downloadURL, ...prev.photos.slice(1)] }));
    } catch (err) {
      console.error("Upload error:", err);
      alert(t("uploadFailed"));
    } finally {
      setUploadingMain(false);
    }
  };

  const handleGalleryUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;
    try {
      setUploadingGallery(true);
      const imageRef = ref(storage, `gallery/${user.id}_${file.name}`);
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);
      const updatedPhotos = [...user.photos, downloadURL];
      const userDocRef = doc(db, "users", user.id);
      await updateDoc(userDocRef, { photos: updatedPhotos });
      setUser(prev => ({ ...prev, photos: updatedPhotos }));
    } catch (err) {
      console.error("Upload error:", err);
      alert(t("uploadFailed"));
    } finally {
      setUploadingGallery(false);
    }
  };

  if (loading) return (
    <div className="profile-container">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t("loadingProfile")}</p>
      </div>
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
          <img src={user.photos[0]} alt={user.name} className="profile-main-image"/>
          <label className="upload-label">
            {uploadingMain ? t("uploading") : t("uploadMain")}
            <input type="file" accept="image/*" onChange={handleMainImageUpload} disabled={uploadingMain} style={{ display: "none" }}/>
          </label>
          <div className="profile-badges">
            {user.online && <div className="status-badge online"><div className="pulse-dot"></div> {t("onlineNow")}</div>}
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
            <div className="status-display"><span className="status-label">{t("status")}:</span> <span className={`status-value ${user.status.toLowerCase()}`}>{user.status}</span></div>
            <div className="income-section"><div className="income-label">{t("income")}</div><div className="income-amount">${user.price}</div></div>
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
              <div className="contact-item"><span>{t("telegram")}:</span> {user.contactInfo.telegram}</div>
              <div className="contact-item"><span>{t("wechat")}:</span> {user.contactInfo.wechat}</div>
              <div className="contact-item"><span>{t("phone")}:</span> {user.contactInfo.phone}</div>
              <div className="contact-item"><span>{t("email")}:</span> {user.contactInfo.email}</div>
            </div>
          </div>
          <div className="content-card"><h3>{t("talents")}</h3>
            <div className="talents-grid">{user.talents.map((t,i)=><div key={i} className="talent-item">✨ {t}</div>)}</div>
          </div>
        </div>
      ) : (
        <div className="gallery-content">
          <label className="upload-label">{uploadingGallery ? t("uploading") : t("uploadGallery")}
            <input type="file" accept="image/*" onChange={handleGalleryUpload} disabled={uploadingGallery} style={{display:"none"}}/>
          </label>
          <div className="gallery-grid">{user.photos.map((p,i)=><div key={i} className="gallery-item"><img src={p} alt={`${user.name}-${i}`} /></div>)}</div>
        </div>
      )}

      {/* Action Bar */}
      <div className="action-bar">
        <button className="message-button">💬 {t("sendMessage")}</button>
        <button className="book-button">⭐ {t("bookSession")}</button>
      </div>
    </div>
  );
};

export default ProfilePage;
