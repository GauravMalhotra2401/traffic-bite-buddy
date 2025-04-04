import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// OLA API configuration
const OLA_API_KEY = '6__HlMOIQhfRj6Ia_sc2haj48oR';
const OLA_MAPS_API_BASE_URL = 'https://maps.olacabs.com/api/v1';

// Proxy endpoint for OLA Places API
app.post('/api/places/autocomplete', async (req, res) => {
  try {
    const response = await axios.post(
      `${OLA_MAPS_API_BASE_URL}/places/autocomplete`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OLA_API_KEY}`
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to OLA API:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error fetching data from OLA API',
      details: error.message
    });
  }
});

// Proxy endpoint for OLA Geocoding API
app.post('/api/geocode', async (req, res) => {
  try {
    const response = await axios.post(
      `${OLA_MAPS_API_BASE_URL}/geocode`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OLA_API_KEY}`
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to OLA API:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error fetching data from OLA API',
      details: error.message
    });
  }
});

// Proxy endpoint for OLA Directions API
app.post('/api/directions', async (req, res) => {
  try {
    const response = await axios.post(
      `${OLA_MAPS_API_BASE_URL}/directions`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OLA_API_KEY}`
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to OLA API:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error fetching data from OLA API',
      details: error.message
    });
  }
});

// Proxy endpoint for OLA Traffic Signals API
app.post('/api/traffic/signals', async (req, res) => {
  try {
    const response = await axios.post(
      `${OLA_MAPS_API_BASE_URL}/traffic/signals`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OLA_API_KEY}`
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to OLA API:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error fetching data from OLA API',
      details: error.message
    });
  }
});

// Serve static files from the React app
app.use(express.static('build'));

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});