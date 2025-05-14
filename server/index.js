const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const app = express();

// Initialize Firebase Admin
const serviceAccount = require('./path-to-your-firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(cors());
app.use(express.json());

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Create user in Firebase
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });

    // Create custom token
    const token = await admin.auth().createCustomToken(userRecord.uid);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 