const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
  callSid: { type: String, index: true },
  callerNumber: { type: String },
  direction: { type: String, default: 'incoming' },
  duration: { type: Number, default: 0 },
  recordingUrl: { type: String },
  status: {
    type: String,
    enum: ['ringing', 'in-progress', 'completed', 'failed'],
    default: 'ringing'
  },
  emergencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Emergency' }
}, { timestamps: true });

module.exports = mongoose.model('CallLog', callLogSchema);
