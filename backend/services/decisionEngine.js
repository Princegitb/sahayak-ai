const Emergency = require('../models/Emergency');

/**
 * Dispatch ambulance to location
 * @param {string} location - Location description
 * @param {string} severity - Severity level
 * @returns {Object} Dispatch result
 */
async function dispatchAmbulance(location, severity) {
  console.log(`\n🚑 ===== AMBULANCE DISPATCH =====`);
  console.log(`📍 Location: ${location}`);
  console.log(`⚠️  Severity: ${severity}`);
  console.log(`🕐 Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);

  // In production: integrate with ambulance dispatch API
  // For demo: simulate dispatch
  const dispatchId = `AMB-${Date.now()}`;
  const eta = severity === 'critical' ? '5-8 minutes' : '10-15 minutes';

  console.log(`📋 Dispatch ID: ${dispatchId}`);
  console.log(`⏱️  ETA: ${eta}`);
  console.log(`================================\n`);

  return {
    type: 'ambulance_dispatch',
    dispatchId,
    location,
    severity,
    eta,
    status: 'dispatched',
    timestamp: new Date()
  };
}

/**
 * Notify nearest hospital
 * @param {Object} details - Emergency details
 * @returns {Object}
 */
async function notifyHospital(details) {
  console.log(`\n🏥 ===== HOSPITAL NOTIFICATION =====`);
  console.log(`📞 Notifying nearest hospital...`);
  console.log(`🆘 Emergency Type: ${details.emergencyType}`);
  console.log(`📍 Location: ${details.location}`);
  console.log(`👥 People Involved: ${details.peopleInvolved}`);
  console.log(`====================================\n`);

  return {
    type: 'hospital_notification',
    hospital: 'Nearest Available Hospital',
    notified: true,
    emergencyType: details.emergencyType,
    timestamp: new Date()
  };
}

/**
 * Dispatch fire brigade
 * @param {string} location
 * @returns {Object}
 */
async function dispatchFireBrigade(location) {
  console.log(`\n🚒 ===== FIRE BRIGADE DISPATCH =====`);
  console.log(`📍 Location: ${location}`);
  console.log(`🕐 Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  console.log(`=====================================\n`);

  return {
    type: 'fire_brigade_dispatch',
    dispatchId: `FIRE-${Date.now()}`,
    location,
    status: 'dispatched',
    timestamp: new Date()
  };
}

/**
 * Dispatch police
 * @param {string} location
 * @returns {Object}
 */
async function dispatchPolice(location) {
  console.log(`\n🚔 ===== POLICE DISPATCH =====`);
  console.log(`📍 Location: ${location}`);
  console.log(`🕐 Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  console.log(`================================\n`);

  return {
    type: 'police_dispatch',
    dispatchId: `POL-${Date.now()}`,
    location,
    status: 'dispatched',
    timestamp: new Date()
  };
}

/**
 * Log emergency to database
 * @param {Object} data - Full emergency data
 * @returns {Object} Saved emergency record
 */
async function logEmergency(data) {
  try {
    const emergency = new Emergency({
      callSid: data.callSid || `SIM-${Date.now()}`,
      callerNumber: data.callerNumber || 'Unknown',
      transcript: data.transcript,
      emergencyType: data.emergencyType,
      location: {
        description: data.location?.description || data.location || 'Unknown',
        coordinates: data.location?.coordinates || {}
      },
      severity: data.severity,
      peopleInvolved: data.peopleInvolved || 0,
      aiResponse: data.responseMessage,
      status: 'pending',
      actions: data.actions || []
    });

    const saved = await emergency.save();
    console.log('💾 Emergency logged to DB:', saved._id);
    return saved;
  } catch (error) {
    console.error('❌ DB Log Error:', error.message);
    // Return a mock object if DB is unavailable
    return {
      _id: `MOCK-${Date.now()}`,
      ...data,
      status: 'pending',
      createdAt: new Date()
    };
  }
}

/**
 * Execute actions based on AI recommendations
 * @param {Object} aiResult - Parsed AI analysis
 * @param {Object} callData - Call metadata
 * @returns {Object} Action results
 */
async function executeActions(aiResult, callData = {}) {
  const actions = [];
  const recommended = aiResult.actionsRecommended || [];
  const location = aiResult.location?.description || 'Unknown';

  for (const action of recommended) {
    let result;
    switch (action) {
      case 'dispatch_ambulance':
        result = await dispatchAmbulance(location, aiResult.severity);
        actions.push(result);
        break;
      case 'notify_hospital':
        result = await notifyHospital({
          emergencyType: aiResult.emergencyType,
          location,
          peopleInvolved: aiResult.peopleInvolved
        });
        actions.push(result);
        break;
      case 'dispatch_fire_brigade':
        result = await dispatchFireBrigade(location);
        actions.push(result);
        break;
      case 'dispatch_police':
        result = await dispatchPolice(location);
        actions.push(result);
        break;
    }
  }

  // Log to database
  const emergency = await logEmergency({
    ...callData,
    transcript: callData.transcript,
    emergencyType: aiResult.emergencyType,
    location: aiResult.location,
    severity: aiResult.severity,
    peopleInvolved: aiResult.peopleInvolved,
    responseMessage: aiResult.responseMessage,
    actions
  });

  return { actions, emergency };
}

module.exports = {
  dispatchAmbulance,
  notifyHospital,
  dispatchFireBrigade,
  dispatchPolice,
  logEmergency,
  executeActions
};
