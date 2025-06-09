import React, { useState } from "react"; 
import { useUser } from "../../context/userContext"; 
import { FaStar } from "react-icons/fa"; 
import { createInvoice } from "../controllers/paymentHandler"; // Adjust import path

const TelegramPaymentButton = () => {
  const { id } = useUser();
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const starOptions = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

  const handlePurchase = async (price) => {
    try {
      setLoading(true);
      const botToken = process.env.REACT_APP_BOT_TOKEN;  // Access the bot token from environment variables
      const providerToken = process.env.REACT_APP_PROVIDER_TOKEN;  // Access the provider token from environment variables

      const invoiceLink = await createInvoice(
        "BoostPoints For NewCats",
        price,
        id,
        botToken,
        providerToken
      );

      window.open(invoiceLink, "_blank");
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert(error.message || "Failed to generate invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.outerContainer}>
      <div>
        <div style={styles.listItem}>
          <div style={styles.media}>
            <FaStar style={styles.starIcon} />
          </div>
          <div style={styles.body}>
            <span style={styles.title}>Boost Your Points with Stars</span>
            <div style={styles.footer}>1 Star = 100 NEWCATS Points</div>
          </div>
          <div style={styles.buttonContainer}>
            <button
              onClick={() => setShowPopup(true)}
              disabled={loading}
              style={styles.boostButton}
            >
              {loading ? "Processing..." : "Boost"}
            </button>
          </div>
        </div>

        {showPopup && (
          <div style={styles.popupOverlay}>
            <div style={styles.popupContent}>
              <h2 style={styles.popupTitle}>Select Your Stars</h2>
              <p style={styles.popupDescription}>
                Tap an amount to proceed with boosting.
              </p>
              <div style={styles.starGrid}>
                {starOptions.map((stars) => (
                  <button
                    key={stars}
                    onClick={() => {
                      setShowPopup(false);
                      handlePurchase(stars);
                    }}
                    style={styles.starButton}
                  >
                    <div>
                      <span style={styles.starsText}>{stars} Stars</span>
                    </div>
                    <span style={styles.pointsText}>
                      +{stars * 100} Points
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowPopup(false)}
                style={styles.closeCircle}
              >
                &times;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
    outerContainer: {
      backgroundColor: "#f9f9f9",
      border: "1px solid #ddd",
      borderRadius: "8px",
      width: "100%",
      padding: "16px",
      position: "relative",
    },
    listItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    media: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      backgroundColor: "#fff8e1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    starIcon: {
      fontSize: "20px",
      color: "gold",
    },
    body: {
      flex: 1,
      marginLeft: "12px",
    },
    title: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#333",
    },
    footer: {
      fontSize: "14px",
      fontWeight: "400",
      color: "#666",
    },
    buttonContainer: {
      display: "flex",
      alignItems: "center",
    },
    boostButton: {
      backgroundColor: "#000",
      color: "#fff",
      padding: "10px 20px",
      borderRadius: "20px",
      fontSize: "14px",
      fontWeight: "600",
      border: "none",
      cursor: "pointer",
    },
    popupOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999,
    },
    popupContent: {
      backgroundColor: "#fff",
      borderRadius: "8px",
      padding: "20px",
      width: "90%",
      maxWidth: "400px",
      position: "relative",
    },
    popupTitle: {
      fontSize: "20px",
      fontWeight: "700",
      marginBottom: "10px",
      textAlign: "center",
    },
    popupDescription: {
      fontSize: "14px",
      color: "#555",
      marginBottom: "20px",
      textAlign: "center",
    },
    starGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
      gap: "10px",
    },
    starButton: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "10px",
      borderRadius: "8px",
      backgroundColor: "#f5f5f5",
      border: "1px solid #ddd",
      cursor: "pointer",
      textAlign: "center",
    },
    starsText: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#333",
    },
    pointsText: {
      fontSize: "12px",
      fontWeight: "500",
      color: "green", // Distinct green color for Points Amount
    },
    closeCircle: {
      position: "absolute",
      top: "-10px",
      right: "-10px",
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      backgroundColor: "#ffffff",
      color: "#000",
      fontSize: "16px",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    },
  };
  
export default TelegramPaymentButton;
