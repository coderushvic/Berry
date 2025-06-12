import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firestore'; // Adjust the path as needed
import { collection, getDocs } from 'firebase/firestore';

const BroadcastPanel = () => {
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [isSending, setIsSending] = useState(false); // Track button state

  // Fetch all users from Firestore
  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'telegramUsers');
      const userSnapshot = await getDocs(usersRef);
      if (userSnapshot.empty) {
        setErrorMessage('No users found in the database.');
      } else {
        const fetchedUsers = userSnapshot.docs.map((doc) => ({
          id: doc.id, // This is the telegramUser.id (chat_id)
          ...doc.data(),
        }));
        setUsers(fetchedUsers);
        setErrorMessage('');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMessage('Error fetching users');
    }
  };

  // Send the broadcast message to all users via Telegram API
  const sendBroadcastMessage = async () => {
    if (!broadcastMessage.trim()) {
      setErrorMessage('Message cannot be empty');
      return;
    }

    setIsSending(true); // Disable button while sending
    setSuccessMessage('');
    setErrorMessage('');

    try {
      let successCount = 0;
      let failedCount = 0;

      for (let user of users) {
        const response = await sendTelegramMessage(user.id, broadcastMessage); // Use user.id as chat_id
        if (response.ok) {
          successCount++;
        } else {
          failedCount++;
        }
      }

      setSuccessMessage(
        `Message broadcasted successfully to ${successCount} users. Failed to send to ${failedCount} users.`
      );
      setBroadcastMessage(''); // Clear message input
    } catch (error) {
      console.error('Error broadcasting message:', error);
      setErrorMessage('Error broadcasting message');
    } finally {
      setIsSending(false); // Re-enable button
    }
  };

  // Send message via Telegram API
  const sendTelegramMessage = async (chatId, message) => {
    const apiUrl = `https://api.telegram.org/bot${process.env.REACT_APP_BOT_TOKEN}/sendMessage`; // Bot token from env

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify({
        chat_id: chatId, // chat_id from user.id
        text: message,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response;
  };

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={styles.broadcastPanel}>
      <h2>Broadcast Message</h2>
      <textarea
        placeholder="Enter your broadcast message here..."
        value={broadcastMessage}
        onChange={(e) => setBroadcastMessage(e.target.value)}
        rows="5"
        style={styles.messageInput}
        disabled={isSending} // Disable input while sending
      />
      <button
        onClick={sendBroadcastMessage}
        style={{
          ...styles.sendButton,
          ...(isSending ? styles.disabledButton : {}),
        }}
        disabled={isSending} // Disable button while sending
      >
        {isSending ? 'Sending...' : 'Send Broadcast'}
      </button>

      {successMessage && (
        <div style={styles.successPopup}>
          <p>{successMessage}</p>
          <button onClick={() => setSuccessMessage('')} style={styles.closeButton}>
            &times;
          </button>
        </div>
      )}
      {errorMessage && <p style={styles.errorMessage}>{errorMessage}</p>}
    </div>
  );
};

const styles = {
  broadcastPanel: {
    padding: '20px',
    maxWidth: '500px',
    margin: 'auto',
    background: '#f4f4f4',
    borderRadius: '8px',
  },
  messageInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginBottom: '10px',
  },
  sendButton: {
    backgroundColor: '#f5bb5f',
    color: '#000',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  successPopup: {
    position: 'fixed',
    top: '20%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#dff0d8',
    color: '#3c763d',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    textAlign: 'center',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#3c763d',
    fontSize: '1.5em',
    fontWeight: 'bold',
    cursor: 'pointer',
    position: 'absolute',
    top: '10px',
    right: '10px',
  },
  errorMessage: {
    color: 'red',
  },
};

export default BroadcastPanel;