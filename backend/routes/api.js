const express = require('express');
const router = express.Router();
const Emergency = require('../models/Emergency');
const CallLog = require('../models/CallLog');

/**
 * GET /api/emergencies
 * Fetch all emergencies (latest first)
 */
router.get('/emergencies', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const emergencies = await Emergency.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, count: emergencies.length, data: emergencies });
  } catch (error) {
    console.error('API Error:', error.message);
    res.json({ success: true, count: 0, data: [] });
  }
});

/**
 * GET /api/emergencies/:id
 * Get single emergency detail
 */
router.get('/emergencies/:id', async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({ success: false, error: 'Emergency not found' });
    }
    res.json({ success: true, data: emergency });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/emergencies/:id/status
 * Update emergency status
 */
router.patch('/emergencies/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'dispatched', 'en_route', 'resolved'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: {
          actions: {
            type: 'status_update',
            description: `Status changed to ${status}`,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    if (!emergency) {
      return res.status(404).json({ success: false, error: 'Emergency not found' });
    }

    res.json({ success: true, data: emergency });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/calls
 * Fetch all call logs
 */
router.get('/calls', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const calls = await CallLog.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('emergencyId');

    res.json({ success: true, count: calls.length, data: calls });
  } catch (error) {
    console.error('API Error:', error.message);
    res.json({ success: true, count: 0, data: [] });
  }
});

/**
 * GET /api/stats
 * Dashboard statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const [totalEmergencies, pending, dispatched, resolved, totalCalls] = await Promise.all([
      Emergency.countDocuments(),
      Emergency.countDocuments({ status: 'pending' }),
      Emergency.countDocuments({ status: 'dispatched' }),
      Emergency.countDocuments({ status: 'resolved' }),
      CallLog.countDocuments()
    ]);

    // Get severity breakdown
    const severityBreakdown = await Emergency.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    // Get emergency type breakdown
    const typeBreakdown = await Emergency.aggregate([
      { $group: { _id: '$emergencyType', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalEmergencies,
        pending,
        dispatched,
        resolved,
        totalCalls,
        severityBreakdown: Object.fromEntries(
          severityBreakdown.map(s => [s._id, s.count])
        ),
        typeBreakdown: Object.fromEntries(
          typeBreakdown.map(t => [t._id, t.count])
        )
      }
    });
  } catch (error) {
    res.json({
      success: true,
      data: {
        totalEmergencies: 0, pending: 0, dispatched: 0, resolved: 0, totalCalls: 0,
        severityBreakdown: {}, typeBreakdown: {}
      }
    });
  }
});

module.exports = router;
