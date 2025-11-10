import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use useMemo to memoize the demoUser so it doesn't change on every render
  const demoUser = useMemo(() => ({
    id: id || 'CDC043',
    name: 'Nanyu',
    age: 24,
    height: '170cm',
    weight: '50kg',
    chestCircumference: '88cm',
    status: 'Available',
    price: '8-14w',
    address: 'High-Tech Zone, Nanmen, Shiyangchang, Shanghai',
    contactInfo: {
      telegram: '@NanyuOfficial',
      wechat: 'Nanyu_2024',
      phone: '+86 138 0013 8000',
      email: 'nanyu@example.com'
    },
    talents: [
      'Multi-lingual (English, Mandarin, Japanese)',
      'Professional Dancer',
      'Certified Masseuse',
      'Cooking Expert',
      'Photography Skills',
      'Musical Instrument (Piano)'
    ],
    online: true,
    verified: true,
    about: 'Professional and friendly companion with 3 years of experience. Fluent in English, Mandarin, and Japanese. Passionate about arts, music, and creating memorable experiences.',
    photos: [
      'https://via.placeholder.com/400x500/667eea/ffffff?text=Main+Photo',
      'https://via.placeholder.com/400x500/764ba2/ffffff?text=Gallery+1',
      'https://via.placeholder.com/400x500/10b981/ffffff?text=Gallery+2',
      'https://via.placeholder.com/400x500/f59e0b/ffffff?text=Gallery+3',
      'https://via.placeholder.com/400x500/ef4444/ffffff?text=Gallery+4',
      'https://via.placeholder.com/400x500/8b5cf6/ffffff?text=Gallery+5'
    ]
  }), [id]); // Only recreate when id changes

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        
        if (id) {
          const userDocRef = doc(db, 'users', id);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUser({ id: userDoc.id, ...userDoc.data() });
          } else {
            // If user not found in Firestore, use demo data with the ID from URL
            setUser({ ...demoUser, id });
          }
        } else {
          setUser(demoUser);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(demoUser);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, demoUser]); // Now demoUser is stable and can be included in dependencies

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error-container">
          <h2>User not found</h2>
          <button onClick={handleBackClick} className="back-button">
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header with Back Button */}
      <div className="profile-header">
        <button className="back-button" onClick={handleBackClick}>
          <span className="back-icon">←</span>
          Back to Users
        </button>
        <div className="header-actions">
          <button className="action-btn favorite">❤</button>
          <button className="action-btn share">↗</button>
        </div>
      </div>

      {/* Profile Hero Section */}
      <div className="profile-hero">
        <div className="profile-image-container">
          <img
            src={user.photos[0]}
            alt={user.name}
            className="profile-main-image"
          />
          <div className="profile-badges">
            {user.online && (
              <div className="status-badge online">
                <div className="pulse-dot"></div>
                Online Now
              </div>
            )}
            {user.verified && (
              <div className="status-badge verified">
                ✓ Verified
              </div>
            )}
          </div>
        </div>

        <div className="profile-overview">
          <div className="name-section">
            <h1 className="profile-name">{user.name}</h1>
            <div className="id-tag">ID: {user.id}</div>
          </div>
          
          {/* Physical Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{user.age}</div>
              <div className="stat-label">Age</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user.height}</div>
              <div className="stat-label">Height</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user.weight}</div>
              <div className="stat-label">Weight</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{user.chestCircumference}</div>
              <div className="stat-label">Chest</div>
            </div>
          </div>

          {/* Status and Price */}
          <div className="status-price-section">
            <div className="status-display">
              <span className="status-label">Status:</span>
              <span className={`status-value ${user.status.toLowerCase()}`}>
                {user.status}
              </span>
            </div>
            <div className="income-section">
              <div className="income-label">Annual Income</div>
              <div className="income-amount">${user.price}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          📋 Information
        </button>
        <button 
          className={`tab-button ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          📸 Gallery ({user.photos.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'info' && (
          <div className="info-content">
            {/* About Section */}
            <div className="content-card">
              <h3 className="card-title">About Me</h3>
              <p className="about-text">{user.about}</p>
            </div>

            {/* Contact Information */}
            <div className="content-card">
              <h3 className="card-title">📞 Contact Information</h3>
              <div className="contact-grid">
                <div className="contact-item">
                  <span className="contact-label">Telegram:</span>
                  <span className="contact-value">{user.contactInfo.telegram}</span>
                </div>
                <div className="contact-item">
                  <span className="contact-label">WeChat:</span>
                  <span className="contact-value">{user.contactInfo.wechat}</span>
                </div>
                <div className="contact-item">
                  <span className="contact-label">Phone:</span>
                  <span className="contact-value">{user.contactInfo.phone}</span>
                </div>
                <div className="contact-item">
                  <span className="contact-label">Email:</span>
                  <span className="contact-value">{user.contactInfo.email}</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="content-card">
              <h3 className="card-title">📍 Address</h3>
              <div className="location-section">
                <div className="location-icon">🏠</div>
                <div className="location-details">
                  <p className="address-text">{user.address}</p>
                  <div className="location-meta">
                    <span className="area-tag">Downtown Area</span>
                    <span className="access-tag">Easy Access</span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Talents */}
            <div className="content-card">
              <h3 className="card-title">🌟 Talents & Skills</h3>
              <div className="talents-grid">
                {user.talents.map((talent, index) => (
                  <div key={index} className="talent-item">
                    <span className="talent-icon">✨</span>
                    <span className="talent-text">{talent}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="content-grid">
              <div className="content-card">
                <h3 className="card-title">📊 Availability</h3>
                <div className="availability-info">
                  <div className="availability-item">
                    <span className="availability-label">Current Status:</span>
                    <span className="availability-value available">Available</span>
                  </div>
                  <div className="availability-item">
                    <span className="availability-label">Response Time:</span>
                    <span className="availability-value">Within 1 hour</span>
                  </div>
                  <div className="availability-item">
                    <span className="availability-label">Working Hours:</span>
                    <span className="availability-value">10:00 - 22:00</span>
                  </div>
                </div>
              </div>

              <div className="content-card">
                <h3 className="card-title">ℹ️ Additional Info</h3>
                <div className="additional-info">
                  <div className="info-item">
                    <span className="info-label">Languages:</span>
                    <span className="info-value">English, Mandarin, Japanese</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Experience:</span>
                    <span className="info-value">3 years</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Education:</span>
                    <span className="info-value">University Graduate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="gallery-content">
            <div className="gallery-grid">
              {user.photos.map((photo, index) => (
                <div key={index} className="gallery-item">
                  <img 
                    src={photo} 
                    alt={`${user.name} ${index + 1}`}
                    loading="lazy"
                  />
                  <div className="photo-overlay">
                    <span className="photo-number">{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Action Bar */}
      <div className="action-bar">
        <button className="message-button">
          <span className="button-icon">💬</span>
          Send Message
        </button>
        <button className="book-button">
          <span className="button-icon">⭐</span>
          Book Session
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;