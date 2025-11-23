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
import ImageUploader from "../../Component/ImageUploader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminPage.css";

const AdminPage = () => {
  const { t } = useTranslation();

  const [users, setUsers] = useState([]);
  const [ads, setAds] = useState([]);

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

  const [newAd, setNewAd] = useState({ imageUrl: "", link: "", order: 0 });
  const [editAdId, setEditAdId] = useState(null);

  const [loading, setLoading] = useState(false);

  /** FETCH USERS **/
  const fetchUsers = useCallback(async () => {
    try {
      const usersQuery = query(collection(db, "users"), orderBy("name"));
      const snap = await getDocs(usersQuery);
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      toast.error(t("failedToLoadUsers"));
    }
  }, [t]);

  /** FETCH ADS **/
  const fetchAds = useCallback(async () => {
    try {
      const adsQuery = query(collection(db, "ads"), orderBy("order", "asc"));
      const snap = await getDocs(adsQuery);
      setAds(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      toast.error(t("failedToLoadAds"));
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
    fetchAds();
  }, [fetchUsers, fetchAds]);

  /** INPUT HANDLING **/
  const handleChange = (e, isAd = false) => {
    const { name, value, type, checked } = e.target;

    if (isAd)
      setNewAd((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    else
      setNewUser((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  /** USER IMAGE UPLOAD **/
  const onUserImageUploaded = (url) => {
    setNewUser((prev) => ({ ...prev, photos: [url, ...(prev.photos || [])] }));
    setUserImagePreview(url);
    toast.success(t("profileImageUploaded"));
  };

  /** GALLERY IMAGE UPLOAD FOR USERS **/
  const onGalleryImageUploaded = (url, userId) => {
    const userDocRef = doc(db, "users", userId);
    const userToUpdate = users.find(u => u.id === userId);
    const updatedPhotos = [...(userToUpdate.photos || []), url];

    updateDoc(userDocRef, { photos: updatedPhotos })
      .then(() => {
        toast.success(t("galleryImageUploaded"));
        fetchUsers(); // refresh users to show updated gallery
      })
      .catch(err => {
        console.error(err);
        toast.error(t("failedToUploadGallery"));
      });
  };

  /** SUBMIT USER **/
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
        photos: newUser.photos.filter(Boolean),
      };

      if (editUserId) await updateDoc(doc(db, "users", editUserId), userData);
      else await addDoc(collection(db, "users"), userData);

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
      toast.success(editUserId ? t("userUpdated") : t("userAdded"));
    } catch (err) {
      console.error(err);
      toast.error(t("failedToSaveUser"));
    }

    setLoading(false);
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
    if (!window.confirm(t("confirmDelete"))) return;
    try {
      await deleteDoc(doc(db, "users", id));
      fetchUsers();
      toast.success(t("userDeleted"));
    } catch (err) {
      toast.error(t("failedToDeleteUser"));
    }
  };

  /** SUBMIT AD **/
  const handleAdSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const adData = { ...newAd, order: Number(newAd.order) };

      if (editAdId) await updateDoc(doc(db, "ads", editAdId), adData);
      else await addDoc(collection(db, "ads"), adData);

      setNewAd({ imageUrl: "", link: "", order: 0 });
      setEditAdId(null);
      fetchAds();
      toast.success(editAdId ? t("adUpdated") : t("adAdded"));
    } catch (err) {
      console.error(err);
      toast.error(t("failedToSaveAd"));
    }

    setLoading(false);
  };

  /** EDIT AD **/
  const handleAdEdit = (ad) => {
    setEditAdId(ad.id);
    setNewAd({
      imageUrl: ad.imageUrl || "",
      link: ad.link || "",
      order: ad.order || 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** DELETE AD **/
  const handleAdDelete = async (id) => {
    if (!window.confirm(t("confirmDelete"))) return;
    try {
      await deleteDoc(doc(db, "ads", id));
      fetchAds();
      toast.success(t("adDeleted"));
    } catch (err) {
      toast.error(t("failedToDeleteAd"));
    }
  };

  return (
    <div className="admin-wrapper">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <header className="admin-header">
        <h1>{t("adminDashboard")}</h1>
        <p>{t("adminSubtitle")}</p>
      </header>

      {/* USER FORM */}
      <section className="admin-section card">
        <h2>{editUserId ? t("editUserProfile") : t("addNewUser")}</h2>

        <form className="form-grid" onSubmit={handleUserSubmit}>
          <div className="grid-2">
            <input
              name="name"
              placeholder={t("fullName")}
              value={newUser.name}
              onChange={handleChange}
              required
            />
            <input
              name="age"
              placeholder={t("age")}
              value={newUser.age}
              onChange={handleChange}
            />
            <input
              name="height"
              placeholder={t("height")}
              value={newUser.height}
              onChange={handleChange}
            />
            <input
              name="weight"
              placeholder={t("weight")}
              value={newUser.weight}
              onChange={handleChange}
            />
            <input
              name="chestCircumference"
              placeholder={t("chestCircumference")}
              value={newUser.chestCircumference}
              onChange={handleChange}
            />
            <input
              name="price"
              placeholder={t("price")}
              value={newUser.price}
              onChange={handleChange}
            />
            <input
              name="address"
              placeholder={t("address")}
              value={newUser.address}
              onChange={handleChange}
            />
          </div>

          <textarea
            name="about"
            placeholder={t("about")}
            value={newUser.about}
            onChange={handleChange}
          />

          <h3>{t("contactInfo")}</h3>

          <div className="grid-2">
            <input
              name="telegram"
              placeholder={t("telegram")}
              value={newUser.telegram}
              onChange={handleChange}
            />
            <input
              name="wechat"
              placeholder={t("wechat")}
              value={newUser.wechat}
              onChange={handleChange}
            />
            <input
              name="phone"
              placeholder={t("phone")}
              value={newUser.phone}
              onChange={handleChange}
            />
            <input
              name="email"
              placeholder={t("email")}
              value={newUser.email}
              onChange={handleChange}
            />
          </div>

          <textarea
            name="talents"
            placeholder={t("talentsCommaSeparated")}
            value={newUser.talents}
            onChange={handleChange}
          />

          <div className="checkbox-row">
            <label>
              <input
                type="checkbox"
                name="verified"
                checked={newUser.verified}
                onChange={handleChange}
              />{" "}
              {t("verified")}
            </label>

            <label>
              <input
                type="checkbox"
                name="online"
                checked={newUser.online}
                onChange={handleChange}
              />{" "}
              {t("online")}
            </label>
          </div>

          <div className="uploader-box">
            <label>{t("profileImage")}</label>
            <ImageUploader
              initialImage={userImagePreview}
              onUploaded={onUserImageUploaded}
              prominent={true}
              buttonText={t("uploadProfile")}
            />
          </div>

          <button className="submit-btn" disabled={loading}>
            {loading ? t("saving") : editUserId ? t("updateUser") : t("addUser")}
          </button>
        </form>
      </section>

      {/* USER LIST */}
      <section className="admin-section card">
        <h2>{t("allUsers")}</h2>

        <div className="list-grid">
          {users.map((u) => (
            <div key={u.id} className="list-card">
              <img src={u.photos?.[0] || ""} alt={u.name} className="list-photo" />
              <h4>{u.name}</h4>
              <p>
                {u.age} {t("years")} • {u.status}
              </p>

              {/* Gallery uploader */}
              <div className="gallery-uploader">
                <ImageUploader
                  initialImage=""
                  onUploaded={(url) => onGalleryImageUploaded(url, u.id)}
                  prominent={false}
                  buttonText={t("uploadGallery")}
                />
              </div>

              <div className="actions-row">
                <button className="edit-btn" onClick={() => handleUserEdit(u)}>
                  {t("edit")}
                </button>
                <button className="delete-btn" onClick={() => handleUserDelete(u.id)}>
                  {t("delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ADS FORM */}
      <section className="admin-section card">
        <h2>{editAdId ? t("editAd") : t("addNewAd")}</h2>

        <form className="form-grid" onSubmit={handleAdSubmit}>
          <div className="uploader-box">
            <label>{t("adImage")}</label>
            <ImageUploader
              initialImage={newAd.imageUrl}
              onUploaded={(url) => setNewAd(prev => ({ ...prev, imageUrl: url }))}
              prominent={true}
              buttonText={t("uploadAd")}
            />
          </div>

          <input
            type="text"
            name="link"
            placeholder={t("adLink")}
            value={newAd.link}
            onChange={(e) => handleChange(e, true)}
          />

          <input
            type="number"
            name="order"
            placeholder={t("order")}
            value={newAd.order}
            onChange={(e) => handleChange(e, true)}
          />

          <button className="submit-btn" disabled={loading}>
            {loading ? t("saving") : editAdId ? t("updateAd") : t("addAd")}
          </button>
        </form>
      </section>

      {/* ADS LIST */}
      <section className="admin-section card">
        <h2>{t("manageAds")}</h2>

        <div className="list-grid">
          {ads.map((ad) => (
            <div key={ad.id} className="list-card">
              <img src={ad.imageUrl} alt="Ad" className="list-photo" />

              <p>
                <strong>{t("order")}:</strong> {ad.order}
              </p>

              <a href={ad.link} target="_blank" rel="noreferrer">
                {ad.link}
              </a>

              <div className="actions-row">
                <button className="edit-btn" onClick={() => handleAdEdit(ad)}>
                  {t("edit")}
                </button>
                <button className="delete-btn" onClick={() => handleAdDelete(ad.id)}>
                  {t("delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminPage;
