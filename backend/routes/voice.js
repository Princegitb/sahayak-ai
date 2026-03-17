const express = require('express');
const router = express.Router();
const { simulateTranscription, transcribeAudio } = require('../services/sttService');
const { processEmergency } = require('../services/aiService');
const { textToSpeech, simulateTTS } = require('../services/ttsService');
const { executeActions } = require('../services/decisionEngine');
const { buildPlayResponse, buildSayResponse, buildErrorResponse } = require('../utils/exotelHelper');
const CallLog = require('../models/CallLog');

/**
 * POST /voice
 * Main Exotel webhook endpoint
 * Handles incoming calls and orchestrates the STT → GPT → TTS pipeline
 */
router.post('/', async (req, res) => {
  const startTime = Date.now();

  try {
    console.log('\n📞 ==============================');
    console.log('📞 INCOMING EMERGENCY CALL');
    console.log('📞 ==============================\n');

    // Extract call data from Exotel webhook
    const callSid = req.body.CallSid || req.body.callSid || `CALL-${Date.now()}`;
    const callerNumber = req.body.From || req.body.from || 'Unknown';
    const recordingUrl = req.body.RecordingUrl || req.body.recordingUrl || null;
    const simulatedText = req.body.transcript || req.body.text || null;

    console.log(`📱 Call SID: ${callSid}`);
    console.log(`📱 Caller: ${callerNumber}`);

    // Log call
    try {
      await CallLog.create({
        callSid,
        callerNumber,
        direction: 'incoming',
        status: 'in-progress',
        recordingUrl
      });
    } catch (e) {
      console.warn('⚠️  Could not log call to DB');
    }

    // Step 1: Speech-to-Text
    let transcript;
    if (recordingUrl) {
      // Real audio from Exotel recording
      // Download and transcribe
      const axios = require('axios');
      const fs = require('fs');
      const path = require('path');

      const audioPath = path.join(__dirname, '..', 'audio_output', `input_${callSid}.wav`);
      const audioResponse = await axios({ url: recordingUrl, responseType: 'stream' });
      const writer = fs.createWriteStream(audioPath);
      audioResponse.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      transcript = await transcribeAudio(audioPath);
    } else {
      // Simulated / demo mode — use provided text or default
      transcript = simulateTranscription(simulatedText);
    }

    // Step 2: AI Processing
    const aiResult = await processEmergency(transcript);

    // Step 3: Decision Engine — execute actions
    const { actions, emergency } = await executeActions(aiResult, {
      callSid,
      callerNumber,
      transcript
    });

    // Step 4: Text-to-Speech
    let audioUrl;
    const responseText = aiResult.responseMessage || 'Madad aa rahi hai. Kripya apni jagah par rahein.';

    try {
      audioUrl = await textToSpeech(responseText);
    } catch (ttsError) {
      console.warn('⚠️  TTS failed, using Say fallback');
      audioUrl = null;
    }

    // Update call log
    try {
      await CallLog.findOneAndUpdate(
        { callSid },
        {
          status: 'completed',
          duration: Math.floor((Date.now() - startTime) / 1000),
          emergencyId: emergency._id
        }
      );
    } catch (e) {
      console.warn('⚠️  Could not update call log');
    }

    const processingTime = Date.now() - startTime;
    console.log(`\n⏱️  Total processing time: ${processingTime}ms`);

    // Return Exotel XML
    res.set('Content-Type', 'application/xml');

    if (audioUrl) {
      return res.send(buildPlayResponse(audioUrl));
    } else {
      return res.send(buildSayResponse(responseText));
    }

  } catch (error) {
    console.error('❌ Voice Pipeline Error:', error);

    res.set('Content-Type', 'application/xml');
    return res.send(buildErrorResponse());
  }
});

/**
 * POST /voice/simulate
 * Simulation endpoint for testing without Exotel
 * Accepts JSON body with transcript text
 */
router.post('/simulate', async (req, res) => {
  try {
    const { text, callerNumber } = req.body;

    if (!text) {
      return res.status(400).json({
        error: 'Missing "text" field in request body'
      });
    }

    console.log('\n🧪 ==============================');
    console.log('🧪 SIMULATED EMERGENCY CALL');
    console.log('🧪 ==============================\n');

    const callSid = `SIM-${Date.now()}`;

    // STT (simulated)
    const transcript = simulateTranscription(text);

    // AI Processing
    const aiResult = await processEmergency(transcript);

    // Decision Engine
    const { actions, emergency } = await executeActions(aiResult, {
      callSid,
      callerNumber: callerNumber || '+91-SIMULATED',
      transcript
    });

    // TTS (simulated for speed)
    let audioUrl;
    try {
      audioUrl = await textToSpeech(aiResult.responseMessage);
    } catch (e) {
      audioUrl = simulateTTS(aiResult.responseMessage);
    }

    res.json({
      success: true,
      callSid,
      transcript,
      aiAnalysis: aiResult,
      actions,
      emergency: {
        id: emergency._id,
        status: emergency.status
      },
      audioUrl
    });

  } catch (error) {
    console.error('❌ Simulation Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
