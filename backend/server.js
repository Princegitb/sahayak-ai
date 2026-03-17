require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const voiceRoutes = require('./routes/voice');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure audio output directory exists
const audioDir = path.join(__dirname, 'audio_output');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/audio', express.static(audioDir));

// Routes
app.use('/voice', voiceRoutes);
app.use('/api', apiRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    service: 'Sahayak AI',
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Connect to MongoDB and start server
async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sahayak-ai');
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.warn('⚠️  MongoDB not available — running without database. Data will not persist.');
    console.warn('   To use MongoDB, install and start it, or set MONGODB_URI in .env');
  }

  app.listen(PORT, () => {
    console.log(`\n🚑 Sahayak AI Backend running on http://localhost:${PORT}`);
    console.log(`📞 Voice webhook: POST http://localhost:${PORT}/voice`);
    console.log(`📊 Dashboard API: GET http://localhost:${PORT}/api/emergencies`);
    console.log('');
  });
}

start();
