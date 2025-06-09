const express = require('express');
const { getFirestore, doc, getDoc, updateDoc } = require('firebase/firestore');

const app = express();
const db = getFirestore(); // Ensure your Firebase app is initialized

// Define the AdsGram reward endpoint
app.get('/reward', async (req, res) => {
    const userId = req.query.userid;
    const taskBonus = 10;

    if (!userId) {
        return res.status(400).send("UserId is required.");
    }

    try {
        const userRef = doc(db, 'telegramUsers', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return res.status(404).send("User not found.");
        }

        const userData = userDoc.data();
        const newBalance = (userData.balance || 0) + taskBonus;
        const newTaskPoints = (userData.taskPoints || 0) + taskBonus;

        await updateDoc(userRef, {
            balance: newBalance,
            taskPoints: newTaskPoints,
        });

        res.status(200).send("Reward received and processed.");
    } catch (error) {
        console.error("Error processing reward:", error);
        res.status(500).send("Error processing reward.");
    }
});