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
  const [userImageFile, setUserImageFile] = useState(null);

  /** ADS STATE **/
  const [ads, setAds] = useState([]);
  const [newAd, setNewAd] = useState({ imageFile: null, link: "", order: 0 });
  const [editAdId, setEditAdId] = useState(null);

  const [loading, setLoading] = useState(false);

  /** FETCH USERS **/
  const fetchUsers = useCallback(async () => {
    try {
      const usersQuery = query(collection(db, "users"), orderBy("name"));
      const snapshot = await getDocs(usersQuery);
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
      setNewAd((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    } else {
      setNewUser((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  /** UPLOAD TO NETLIFY BLOB STORAGE **/
  const uploadFile = async (file) => {
    if (!file) return "";

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/.netlify/functions/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      return data.url;
    } catch (err) {
      console.error("Upload error:", err);
      return "";
    }
  };

  /** CREATE OR UPDATE USER **/
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoURL = "";

      if (userImageFile) {
        photoURL = await uploadFile(userImageFile);
      }

      const userData = {
        ...newUser,
        contactInfo: {
          telegram: newUser.telegram,
          wechat: newUser.wechat,
          phone: newUser.phone,
          email: newUser.email,
        },
        talents: newUser.talents
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
        photos: photoURL ? [photoURL] : newUser.photos,
      };

      if (editUserId) {
        await updateDoc(doc(db, "users", editUserId), userData);
        alert(t("userUpdated"));
      } else {
        await addDoc(collection(db, "users"), userData);
        alert(t("userAdded"));
      }

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
      setUserImageFile(null);
      setEditUserId(null);
      fetchUsers();
    } catch (err) {
      console.error("Error:", err);
      alert(t("userSaveFailed"));
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
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** DELETE USER **/
  const handleUserDelete = async (id) => {
    if (!window.confirm(t("confirmDelete"))) return;
    await deleteDoc(doc(db, "users", id));
    fetchUsers();
  };

  /** CREATE OR UPDATE ADS **/
  const handleAdSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = newAd.imageUrl || "";

      if (newAd.imageFile) {
        imageUrl = await uploadFile(newAd.imageFile);
      }

      const adData = {
        imageUrl,
        link: newAd.link,
        order: Number(newAd.order) || 0,
      };

      if (editAdId) {
        await updateDoc(doc(db, "ads", editAdId), adData);
        alert(t("adUpdated"));
      } else {
        await addDoc(collection(db, "ads"), adData);
        alert(t("adAdded"));
      }

      setNewAd({ imageFile: null, link: "", order: 0, imageUrl: "" });
      setEditAdId(null);
      fetchAds();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /** EDIT AD **/
  const handleAdEdit = (ad) => {
    setEditAdId(ad.id);
    setNewAd({
      imageFile: null,
      link: ad.link,
      order: ad.order,
      imageUrl: ad.imageUrl,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** DELETE AD **/
  const handleAdDelete = async (id) => {
    if (!window.confirm(t("confirmDelete"))) return;
    await deleteDoc(doc(db, "ads", id));
    fetchAds();
  };

  return (
    <div className="admin-container">
      <h1>👑 {t("adminDashboard")}</h1>

      {/* USER FORM */}
      <form className="admin-form" onSubmit={handleUserSubmit}>
        <h2>{editUserId ? t("updateUser") : t("addUser")}</h2>

        <div className="form-grid">
          <input name="name" placeholder={t("name")} value={newUser.name} onChange={handleChange} required />
          <input name="age" placeholder={t("age")} value={newUser.age} onChange={handleChange} />
          <input name="height" placeholder={t("height")} value={newUser.height} onChange={handleChange} />
          <input name="weight" placeholder={t("weight")} value={newUser.weight} onChange={handleChange} />
          <input name="chestCircumference" placeholder={t("chest")} value={newUser.chestCircumference} onChange={handleChange} />
          <input name="price" placeholder={t("price")} value={newUser.price} onChange={handleChange} />
          <input name="address" placeholder={t("address")} value={newUser.address} onChange={handleChange} />
        </div>

        <textarea name="about" placeholder={t("about")} value={newUser.about} onChange={handleChange}></textarea>

        <h3>{t("contactInfo")}</h3>
        <div className="form-grid">
          <input name="telegram" placeholder="Telegram" value={newUser.telegram} onChange={handleChange} />
          <input name="wechat" placeholder="WeChat" value={newUser.wechat} onChange={handleChange} />
          <input name="phone" placeholder={t("phone")} value={newUser.phone} onChange={handleChange} />
          <input name="email" placeholder="Email" value={newUser.email} onChange={handleChange} />
        </div>

        <textarea name="talents" placeholder={t("talentsPlaceholder")} value={newUser.talents} onChange={handleChange}></textarea>

        <div className="checkbox-group">
          <label>
            <input type="checkbox" name="verified" checked={newUser.verified} onChange={handleChange} />
            {t("verified")}
          </label>
          <label>
            <input type="checkbox" name="online" checked={newUser.online} onChange={handleChange} />
            {t("online")}
          </label>
        </div>

        <div className="upload-section">
          <label>📷 {t("profileImage")}</label>
          <input type="file" accept="image/*" onChange={(e) => setUserImageFile(e.target.files[0])} />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? t("saving") : editUserId ? t("updateUser") : t("addUser")}
        </button>
      </form>

      {/* USERS LIST */}
      <h2>{t("allUsers")}</h2>
      <div className="user-list">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <img
              src={user.photos?.[0] || "https://via.placeholder.com/100"}
              alt={user.name}
            />

            <div className="user-info">
              <h4>{user.name}</h4>
              <p>{user.age} yrs — {user.status}</p>
              <p>{user.price}</p>
            </div>

            <div className="user-actions">
              <button onClick={() => handleUserEdit(user)}>✏️ {t("edit")}</button>
              <button className="delete-btn" onClick={() => handleUserDelete(user.id)}>🗑 {t("delete")}</button>
            </div>
          </div>
        ))}
      </div>

      {/* ADS FORM */}
      <form className="admin-form" onSubmit={handleAdSubmit}>
        <h2>{editAdId ? t("updateAd") : t("addAd")}</h2>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setNewAd((prev) => ({ ...prev, imageFile: e.target.files[0] }))
          }
        />

        {newAd.imageUrl && (
          <img
            src={newAd.imageUrl}
            style={{
              width: "150px",
              borderRadius: "10px",
              margin: "10px 0",
            }}
            alt="Preview"
          />
        )}

        <input type="text" placeholder={t("link")} name="link" value={newAd.link} onChange={(e) => handleChange(e, true)} required />
        <input type="number" placeholder={t("order")} name="order" value={newAd.order} onChange={(e) => handleChange(e, true)} />

        <button type="submit" disabled={loading}>
          {loading ? t("saving") : editAdId ? t("updateAd") : t("addAd")}
        </button>
      </form>

      {/* ADS LIST */}
      <h2>{t("manageAds")}</h2>
      <div className="user-list">
        {ads.map((ad) => (
          <div key={ad.id} className="user-card">
            <img
              src={ad.imageUrl}
              alt="Ad"
              style={{ width: "200px", objectFit: "cover" }}
            />

            <div className="user-info">
              <p>{t("link")}: <a href={ad.link} target="_blank" rel="noopener noreferrer">{ad.link}</a></p>
              <p>{t("order")}: {ad.order}</p>
            </div>

            <div className="user-actions">
              <button onClick={() => handleAdEdit(ad)}>✏️ {t("edit")}</button>
              <button className="delete-btn" onClick={() => handleAdDelete(ad.id)}>🗑 {t("delete")}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
