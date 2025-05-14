const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authService = require('./services/auth.service');
const poiService = require('./services/poi.service');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const result = await authService.register(email, password, role);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    await authService.logout();
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user.uid);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POI routes
app.post('/api/pois', authenticateToken, async (req, res) => {
  try {
    const poi = await poiService.addPOI(req.body, req.user.uid);
    res.json(poi);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/pois/bulk', authenticateToken, async (req, res) => {
  try {
    const { pois } = req.body;
    const result = await poiService.bulkAddPOIs(pois, req.user.uid);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/pois/:id', authenticateToken, async (req, res) => {
  try {
    const poi = await poiService.updatePOI(req.params.id, req.body, req.user.uid);
    res.json(poi);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/pois/:id', authenticateToken, async (req, res) => {
  try {
    const result = await poiService.deletePOI(req.params.id, req.user.uid);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/pois', authenticateToken, async (req, res) => {
  try {
    const { pageSize, lastDoc } = req.query;
    const result = await poiService.getAllPOIs(
      req.user.uid,
      parseInt(pageSize) || 10,
      lastDoc
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Search routes
app.post('/api/search', authenticateToken, async (req, res) => {
  try {
    const results = await poiService.searchPOIs(req.body, req.user.uid);
    res.json(results);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/search/history', authenticateToken, async (req, res) => {
  try {
    const history = await poiService.getSearchHistory(req.user.uid);
    res.json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 