// src/Pages/Admin/AdminPage.js
import React, { useEffect, useState, useCallback } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/firestore";
import { useTranslation } from "react-i18next";
import "./AdminPage.css";

const AdminPage = () => {
  const { t } = useTranslation();

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
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Fetch users (reusable)
  const fetchUsers = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = [];
      querySnapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle field change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Upload image to Firebase Storage
  const handleImageUpload = async (file) => {
    if (!file) return "";
    const imageRef = ref(storage, `profileImages/${file.name}_${Date.now()}`);
    await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  };

  // Create or update user
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let photoURL = "";
      if (imageFile) {
        photoURL = await handleImageUpload(imageFile);
      }

      const userData = {
        name: newUser.name,
        age: newUser.age,
        height: newUser.height,
        weight: newUser.weight,
        chestCircumference: newUser.chestCircumference,
        status: newUser.status,
        price: newUser.price,
        address: newUser.address,
        about: newUser.about,
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
        verified: newUser.verified,
        online: newUser.online,
        photos: photoURL ? [photoURL] : [],
      };

      if (editId) {
        const userDoc = doc(db, "users", editId);
        await updateDoc(userDoc, userData);
        alert(t("updateProfile") || "Profile updated successfully!");
      } else {
        await addDoc(collection(db, "users"), userData);
        alert(t("addProfile") || "New profile created successfully!");
      }

      // Reset form
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
      setImageFile(null);
      setEditId(null);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      alert(t("failedSave") || "Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  // Edit a user
  const handleEdit = (user) => {
    setEditId(user.id);
    setNewUser({
      ...user,
      telegram: user.contactInfo?.telegram || "",
      wechat: user.contactInfo?.wechat || "",
      phone: user.contactInfo?.phone || "",
      email: user.contactInfo?.email || "",
      talents: user.talents ? user.talents.join(", ") : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete a user
  const handleDelete = async (id) => {
    if (!window.confirm(t("confirmDelete") || "Are you sure you want to delete this profile?")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      alert(t("deletedUser") || "User deleted successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="admin-container">
      <h1>👑 {t("adminDashboard") || "Admin Dashboard"}</h1>

      {/* Form */}
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <input name="name" placeholder={t("name") || "Name"} value={newUser.name} onChange={handleChange} required />
          <input name="age" placeholder={t("age") || "Age"} value={newUser.age} onChange={handleChange} />
          <input name="height" placeholder={t("height") || "Height"} value={newUser.height} onChange={handleChange} />
          <input name="weight" placeholder={t("weight") || "Weight"} value={newUser.weight} onChange={handleChange} />
          <input name="chestCircumference" placeholder={t("chestCircumference") || "Chest Circumference"} value={newUser.chestCircumference} onChange={handleChange} />
          <input name="price" placeholder={t("price") || "Price"} value={newUser.price} onChange={handleChange} />
          <input name="address" placeholder={t("address") || "Address"} value={newUser.address} onChange={handleChange} />
        </div>

        <textarea name="about" placeholder={t("about") || "About Me"} value={newUser.about} onChange={handleChange}></textarea>

        <h3>📞 {t("contactSection") || "Contact Information"}</h3>
        <div className="form-grid">
          <input name="telegram" placeholder={t("telegram") || "Telegram"} value={newUser.telegram} onChange={handleChange} />
          <input name="wechat" placeholder={t("wechat") || "WeChat"} value={newUser.wechat} onChange={handleChange} />
          <input name="phone" placeholder={t("phone") || "Phone"} value={newUser.phone} onChange={handleChange} />
          <input name="email" placeholder={t("email") || "Email"} value={newUser.email} onChange={handleChange} />
        </div>

        <h3>🎯 {t("talentList") || "Talents"}</h3>
        <textarea name="talents" placeholder={t("talentList") || "Comma separated list"} value={newUser.talents} onChange={handleChange}></textarea>

        <div className="checkbox-group">
          <label><input type="checkbox" name="verified" checked={newUser.verified} onChange={handleChange}/> {t("verifiedLabel") || "Verified"}</label>
          <label><input type="checkbox" name="online" checked={newUser.online} onChange={handleChange}/> {t("onlineLabel") || "Online"}</label>
        </div>

        <div className="upload-section">
          <label>📷 {t("uploadProfileImage") || "Upload Profile Image"}</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
        </div>

        <button type="submit" disabled={loading}>{loading ? t("saving") || "Saving..." : editId ? t("updateProfile") || "Update Profile" : t("addProfile") || "Add Profile"}</button>
      </form>

      {/* All Users */}
      <h2>📋 {t("allProfiles") || "All Profiles"}</h2>
      <div className="user-list">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <img src={user.photos?.[0] || "https://via.placeholder.com/100"} alt={user.name} />
            <div className="user-info">
              <h4>{user.name}</h4>
              <p>{user.age} {t("age") || "yrs"} — {user.status}</p>
              <p>{user.price}</p>
            </div>
            <div className="user-actions">
              <button onClick={() => handleEdit(user)}>✏️ {t("edit") || "Edit"}</button>
              <button className="delete-btn" onClick={() => handleDelete(user.id)}>🗑 {t("delete") || "Delete"}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
