import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseApp } from "./firestore"; // ✅ Correct import path

// Initialize Firebase Storage
const storage = getStorage(firebaseApp);

// Upload profile image
export const uploadProfileImage = async (file, userId) => {
  const imageRef = ref(storage, `profileImages/${userId}/${file.name}`);
  await uploadBytes(imageRef, file);
  const downloadURL = await getDownloadURL(imageRef);
  return downloadURL;
};

// Upload gallery image
export const uploadGalleryImage = async (file, userId) => {
  const imageRef = ref(storage, `galleryImages/${userId}/${file.name}`);
  await uploadBytes(imageRef, file);
  const downloadURL = await getDownloadURL(imageRef);
  return downloadURL;
};

// ✅ Export the storage instance
export { storage };
