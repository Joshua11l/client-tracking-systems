import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Import the storage module

const firebaseConfig = {
  apiKey: "AIzaSyD7nA9z-SixohZYEwGHCcakiYQKAMsMo9E",
  authDomain: "client-tracker-29433.firebaseapp.com",
  projectId: "client-tracker-29433",
  storageBucket: "client-tracker-29433.appspot.com",
  messagingSenderId: "499927985086",
  appId: "1:499927985086:web:9c6ba816dabd03afc367ef",
  measurementId: "G-QN152WQCJ6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app); // Initialize Firebase Storage