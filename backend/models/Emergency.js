const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  callSid: { type: String, index: true },
  callerNumber: { type: String },
  transcript: { type: String },
  emergencyType: {
    type: String,
    enum: ['accident', 'cardiac_arrest', 'fire', 'natural_disaster', 'crime', 'breathing_difficulty', 'injury', 'other', 'unknown'],
    default: 'unknown'
  },
  location: {
    description: { type: String, default: 'Unknown' },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'unknown'],
    default: 'unknown'
  },
  peopleInvolved: { type: Number, default: 0 },
  aiResponse: { type: String },
  status: {
    type: String,
    enum: ['pending', 'dispatched', 'en_route', 'resolved'],
    default: 'pending'
  },
  actions: [{
    type: { type: String },
    description: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Emergency', emergencySchema);
