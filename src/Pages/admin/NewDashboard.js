// src/Pages/Admin/AdminPage.js
import React, { useEffect, useState, useCallback } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useTranslation } from "react-i18next";
import ImageUploader from "../../Component/ImageUploader/ImageUploader";
import "./AdminPage.css";

const AdminPage = () => {
  const { t } = useTranslation();

  /** USERS STATE **/
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
    chestCircumference: "",
    status: "Available",
    price: "",
    address: "",
    about: "",
    telegram: "",
    wechat: "",
    phone: "",
    email: "",
    talents: "",
    verified: false,
    online: false,
    photos: [],
  });
  const [editUserId, setEditUserId] = useState(null);
  const [userImagePreview, setUserImagePreview] = useState("");

  /** ADS STATE **/
  const [ads, setAds] = useState([]);
  const [newAd, setNewAd] = useState({ imageFile: null, link: "", order: 0, imageUrl: "" });
  const [editAdId, setEditAdId] = useState(null);

  const [loading, setLoading] = useState(false);

  /** FETCH USERS **/
  const fetchUsers = useCallback(async () => {
    try {
      const usersQuery = query(collection(db, "users"), orderBy("name"));
      const snapshot = await getDocs(usersQuery);
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(list);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, []);

  /** FETCH ADS **/
  const fetchAds = useCallback(async () => {
    try {
      const adsQuery = query(collection(db, "ads"), orderBy("order", "asc"));
      const snapshot = await getDocs(adsQuery);
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAds(list);
    } catch (err) {
      console.error("Error fetching ads:", err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchAds();
  }, [fetchUsers, fetchAds]);

  /** HANDLE INPUT CHANGE **/
  const handleChange = (e, isAd = false) => {
    const { name, value, type, checked } = e.target;
    if (isAd) {
      setNewAd((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    } else {
      setNewUser((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  /** CREATE OR UPDATE USER **/
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = {
        ...newUser,
        contactInfo: {
          telegram: newUser.telegram,
          wechat: newUser.wechat,
          phone: newUser.phone,
          email: newUser.email,
        },
        talents: newUser.talents
          ? newUser.talents.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        photos: newUser.photos || [],
      };

      if (editUserId) {
        await updateDoc(doc(db, "users", editUserId), userData);
        alert(t("updateProfile") || "Profile updated!");
      } else {
        await addDoc(collection(db, "users"), userData);
        alert(t("addProfile") || "New profile added!");
      }

      // reset
      setNewUser({
        name: "",
        age: "",
        height: "",
        weight: "",
        chestCircumference: "",
        status: "Available",
        price: "",
        address: "",
        about: "",
        telegram: "",
        wechat: "",
        phone: "",
        email: "",
        talents: "",
        verified: false,
        online: false,
        photos: [],
      });
      setUserImagePreview("");
      setEditUserId(null);
      fetchUsers();
    } catch (err) {
      console.error("Error saving user:", err);
      alert(t("failedSave") || "Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  /** EDIT USER **/
  const handleUserEdit = (user) => {
    setEditUserId(user.id);
    setNewUser({
      ...user,
      telegram: user.contactInfo?.telegram || "",
      wechat: user.contactInfo?.wechat || "",
      phone: user.contactInfo?.phone || "",
      email: user.contactInfo?.email || "",
      talents: user.talents?.join(", ") || "",
      photos: user.photos || [],
    });
    setUserImagePreview(user.photos?.[0] || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** DELETE USER **/
  const handleUserDelete = async (id) => {
    if (!window.confirm(t("confirmDelete") || "Are you sure?")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  /** AD FORM HANDLERS **/
  const handleAdSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = newAd.imageUrl || "";

      // If admin used ImageUploader to set imageUrl, it is already set.
      // If admin used plain file input (legacy), we still support it by uploading.
      if (newAd.imageFile && !imageUrl) {
        // fallback: upload directly
        const uploadUrl = process.env.REACT_APP_RENDER_UPLOAD_URL;
        if (uploadUrl) {
          const fd = new FormData();
          fd.append('file', newAd.imageFile);
          const res = await fetch(uploadUrl, { method: 'POST', body: fd });
          if (res.ok) {
            const data = await res.json();
            imageUrl = data.url || imageUrl;
          }
        }
      }

      const adData = { imageUrl, link: newAd.link, order: Number(newAd.order) || 0 };

      if (editAdId) {
        await updateDoc(doc(db, "ads", editAdId), adData);
        alert("Ad updated!");
      } else {
        await addDoc(collection(db, "ads"), adData);
        alert("Ad added!");
      }

      setNewAd({ imageFile: null, link: "", order: 0, imageUrl: "" });
      setEditAdId(null);
      fetchAds();
    } catch (err) {
      console.error(err);
      alert("Failed to save ad");
    } finally {
      setLoading(false);
    }
  };

  /** EDIT AD **/
  const handleAdEdit = (ad) => {
    setEditAdId(ad.id);
    setNewAd({ imageFile: null, link: ad.link, order: ad.order, imageUrl: ad.imageUrl });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** DELETE AD **/
  const handleAdDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this ad?")) return;
    try {
      await deleteDoc(doc(db, "ads", id));
      fetchAds();
    } catch (err) {
      console.error(err);
    }
  };

  // image uploaded callback for user
  const onUserImageUploaded = (url) => {
    setNewUser(prev => ({ ...prev, photos: [url, ...(prev.photos || [])] }));
    setUserImagePreview(url);
  };

  // image uploaded callback for ads
  const onAdImageUploaded = (url) => {
    setNewAd(prev => ({ ...prev, imageUrl: url }));
  };

  return (
    <div className="admin-container">
      <h1>👑 {t("adminDashboard") || "Admin Dashboard"}</h1>

      {/* USER FORM */}
      <form className="admin-form" onSubmit={handleUserSubmit}>
        <h2>{editUserId ? t("updateProfile") : t("addProfile")}</h2>
        <div className="form-grid">
          <input name="name" placeholder="Name" value={newUser.name} onChange={handleChange} required />
          <input name="age" placeholder="Age" value={newUser.age} onChange={handleChange} />
          <input name="height" placeholder="Height" value={newUser.height} onChange={handleChange} />
          <input name="weight" placeholder="Weight" value={newUser.weight} onChange={handleChange} />
          <input name="chestCircumference" placeholder="Chest Circumference" value={newUser.chestCircumference} onChange={handleChange} />
          <input name="price" placeholder="Price" value={newUser.price} onChange={handleChange} />
          <input name="address" placeholder="Address" value={newUser.address} onChange={handleChange} />
        </div>

        <textarea name="about" placeholder="About" value={newUser.about} onChange={handleChange}></textarea>

        <h3>📞 Contact Info</h3>
        <div className="form-grid">
          <input name="telegram" placeholder="Telegram" value={newUser.telegram} onChange={handleChange} />
          <input name="wechat" placeholder="WeChat" value={newUser.wechat} onChange={handleChange} />
          <input name="phone" placeholder="Phone" value={newUser.phone} onChange={handleChange} />
          <input name="email" placeholder="Email" value={newUser.email} onChange={handleChange} />
        </div>

        <textarea name="talents" placeholder="Talents, comma separated" value={newUser.talents} onChange={handleChange}></textarea>

        <div className="checkbox-group">
          <label><input type="checkbox" name="verified" checked={newUser.verified} onChange={handleChange}/> Verified</label>
          <label><input type="checkbox" name="online" checked={newUser.online} onChange={handleChange}/> Online</label>
        </div>

        <div className="upload-section">
          <label>📷 Profile Image</label>
          <ImageUploader initialImage={userImagePreview || newUser.photos?.[0]} onUploaded={onUserImageUploaded} buttonText={t('uploadProfileImage') || 'Upload Profile Image'} />
        </div>

        <button type="submit" disabled={loading}>{loading ? "Saving..." : editUserId ? "Update User" : "Add User"}</button>
      </form>

      {/* USERS LIST */}
      <h2>📋 All Users</h2>
      <div className="user-list">
        {users.map((u) => (
          <div key={u.id} className="user-card">
            <img src={u.photos?.[0] || "https://via.placeholder.com/100"} alt={u.name} />
            <div className="user-info">
              <h4>{u.name}</h4>
              <p>{u.age} yrs — {u.status}</p>
              <p>{u.price}</p>
            </div>
            <div className="user-actions">
              <button onClick={() => handleUserEdit(u)}>✏️ Edit</button>
              <button className="delete-btn" onClick={() => handleUserDelete(u.id)}>🗑 Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* ADS FORM */}
      <form className="admin-form" onSubmit={handleAdSubmit}>
        <h2>{editAdId ? "Update Ad" : "Add New Ad"}</h2>
        <div style={{ marginBottom: 8 }}>
          <ImageUploader initialImage={newAd.imageUrl} onUploaded={onAdImageUploaded} buttonText={t('uploadAdImage') || 'Upload Ad Image'} />
        </div>
        <div style={{ marginTop: 8 }}>
          <input type="text" placeholder="Link" name="link" value={newAd.link} onChange={(e) => handleChange(e, true)} required />
          <input type="number" placeholder="Order" name="order" value={newAd.order} onChange={(e) => handleChange(e, true)} />
        </div>
        <button type="submit" disabled={loading}>{loading ? "Saving..." : editAdId ? "Update Ad" : "Add Ad"}</button>
      </form>

      {/* ADS LIST */}
      <h2>📢 Manage Ads</h2>
      <div className="user-list">
        {ads.map((ad) => (
          <div key={ad.id} className="user-card">
            <img src={ad.imageUrl || "https://via.placeholder.com/200"} alt="Ad" style={{ width: "200px", objectFit: "cover" }} />
            <div className="user-info">
              <p>Link: <a href={ad.link} target="_blank" rel="noopener noreferrer">{ad.link}</a></p>
              <p>Order: {ad.order}</p>
            </div>
            <div className="user-actions">
              <button onClick={() => handleAdEdit(ad)}>✏️ Edit</button>
              <button className="delete-btn" onClick={() => handleAdDelete(ad.id)}>🗑 Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
