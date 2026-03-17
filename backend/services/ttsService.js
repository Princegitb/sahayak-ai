const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('crypto');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
// Rachel voice - clear female Hindi-friendly voice
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM';
const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

/**
 * Convert text to speech using ElevenLabs API
 * @param {string} text - Text to convert to speech
 * @returns {string} Public URL to the audio file
 */
async function textToSpeech(text) {
  try {
    console.log('🔊 Converting to speech with ElevenLabs...');

    const response = await axios({
      method: 'POST',
      url: API_URL,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      data: {
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true
        }
      },
      responseType: 'arraybuffer'
    });

    // Save audio file
    const filename = `response_${Date.now()}.mp3`;
    const audioDir = path.join(__dirname, '..', 'audio_output');
    const filePath = path.join(audioDir, filename);

    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    fs.writeFileSync(filePath, response.data);
    console.log('🔊 Audio saved:', filename);

    // Return the public URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    const audioUrl = `${baseUrl}/audio/${filename}`;
    return audioUrl;
  } catch (error) {
    console.error('❌ TTS Error:', error.message);
    throw new Error('Text-to-speech conversion failed: ' + error.message);
  }
}

/**
 * Simulate TTS for demo mode - returns a placeholder URL
 * @param {string} text
 * @returns {string}
 */
function simulateTTS(text) {
  console.log('🔊 [SIMULATED TTS] Would speak:', text);
  return `${process.env.BASE_URL || 'http://localhost:3001'}/audio/simulated.mp3`;
}

module.exports = { textToSpeech, simulateTTS };
