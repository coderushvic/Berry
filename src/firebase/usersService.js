// src/firebase/usersService.js
import { db } from './firestore';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

export async function saveUserToFirestore(userData) {
  try {
    const usersRef = collection(db, 'users');
    const docRef = await addDoc(usersRef, userData);
    return { id: docRef.id, ...userData };
  } catch (err) {
    console.error('saveUserToFirestore error:', err);
    throw err;
  }
}

export async function updateUserInFirestore(userId, userData) {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, userData);
    return { id: userId, ...userData };
  } catch (err) {
    console.error('updateUserInFirestore error:', err);
    throw err;
  }
}