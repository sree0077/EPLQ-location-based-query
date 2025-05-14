const { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} = require('firebase/auth');
const { 
  doc, 
  setDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs
} = require('firebase/firestore');
const { auth, db } = require('../firebase.config');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

class AuthService {
  async register(email, password, role = 'user') {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: role,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });

      // Generate JWT token
      const token = this.generateToken(user.uid, role);

      return {
        user: {
          id: user.uid,
          email: user.email,
          role: role
        },
        token
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user document from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      // Update last login
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        lastLogin: new Date().toISOString()
      }, { merge: true });

      // Generate JWT token
      const token = this.generateToken(user.uid, userData.role);

      return {
        user: {
          id: user.uid,
          email: user.email,
          role: userData.role
        },
        token
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getCurrentUser(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      return {
        id: uid,
        email: userData.email,
        role: userData.role
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async hasRole(uid, role) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        return false;
      }

      const userData = userDoc.data();
      return userData.role === role;
    } catch (error) {
      return false;
    }
  }

  generateToken(uid, role) {
    return jwt.sign(
      { uid, role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

module.exports = new AuthService(); 