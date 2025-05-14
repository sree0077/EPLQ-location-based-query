const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');
const { getStorage } = require('firebase/storage');

// Your web app's Firebase configuration
const firebaseConfig = {
  // Replace these with your Firebase config values
  apiKey: "AIzaSyCjWAGbYjJQ3eYmCkeJbhMBGZzfKeGSoX0",
  authDomain: "eplq-d5a42.firebaseapp.com",
  projectId: "eplq-d5a42",
  storageBucket: "eplq-d5a42.firebasestorage.app",
  messagingSenderId: "401595677762",
  appId: "1:401595677762:web:a90cd3ae2d34191bcb41db",
  measurementId: "G-3BRVRTXECT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

module.exports = {
  app,
  auth,
  db,
  storage
}; 