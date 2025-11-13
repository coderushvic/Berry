import React, { useEffect, useState } from "react";
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
import "./AdminPage.css";

const AdminPage = () => {
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

  // Fetch all users
  const fetchUsers = async () => {
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
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
        alert("Profile updated successfully!");
      } else {
        await addDoc(collection(db, "users"), userData);
        alert("New profile created successfully!");
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
      setImageFile(null);
      setEditId(null);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Failed to save user");
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
    if (!window.confirm("Are you sure you want to delete this profile?")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      alert("User deleted successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="admin-container">
      <h1>👑 Admin Dashboard</h1>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <input name="name" placeholder="Name" value={newUser.name} onChange={handleChange} required />
          <input name="age" placeholder="Age" value={newUser.age} onChange={handleChange} />
          <input name="height" placeholder="Height" value={newUser.height} onChange={handleChange} />
          <input name="weight" placeholder="Weight" value={newUser.weight} onChange={handleChange} />
          <input name="chestCircumference" placeholder="Chest Circumference" value={newUser.chestCircumference} onChange={handleChange} />
          <input name="price" placeholder="Price (e.g. 8-14w)" value={newUser.price} onChange={handleChange} />
          <input name="address" placeholder="Address" value={newUser.address} onChange={handleChange} />
        </div>

        <textarea name="about" placeholder="About Me" value={newUser.about} onChange={handleChange}></textarea>

        <h3>📞 Contact Information</h3>
        <div className="form-grid">
          <input name="telegram" placeholder="Telegram" value={newUser.telegram} onChange={handleChange} />
          <input name="wechat" placeholder="WeChat" value={newUser.wechat} onChange={handleChange} />
          <input name="phone" placeholder="Phone" value={newUser.phone} onChange={handleChange} />
          <input name="email" placeholder="Email" value={newUser.email} onChange={handleChange} />
        </div>

        <h3>🎯 Talents</h3>
        <textarea name="talents" placeholder="Comma separated list" value={newUser.talents} onChange={handleChange}></textarea>

        <div className="checkbox-group">
          <label><input type="checkbox" name="verified" checked={newUser.verified} onChange={handleChange}/> Verified</label>
          <label><input type="checkbox" name="online" checked={newUser.online} onChange={handleChange}/> Online</label>
        </div>

        <div className="upload-section">
          <label>📷 Upload Profile Image</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
        </div>

        <button type="submit" disabled={loading}>{loading ? "Saving..." : editId ? "Update Profile" : "Add Profile"}</button>
      </form>

      <h2>📋 All Profiles</h2>
      <div className="user-list">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <img src={user.photos?.[0] || "https://via.placeholder.com/100"} alt={user.name} />
            <div className="user-info">
              <h4>{user.name}</h4>
              <p>{user.age} yrs — {user.status}</p>
              <p>{user.price}</p>
            </div>
            <div className="user-actions">
              <button onClick={() => handleEdit(user)}>✏️ Edit</button>
              <button className="delete-btn" onClick={() => handleDelete(user.id)}>🗑 Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
