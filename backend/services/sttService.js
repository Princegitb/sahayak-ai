const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Transcribe audio file using OpenAI Whisper API
 * @param {string} audioFilePath - Path to the audio file
 * @returns {string} Transcribed text
 */
async function transcribeAudio(audioFilePath) {
  try {
    console.log('🎤 Transcribing audio with Whisper...');

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: 'whisper-1',
      language: 'hi',  // Hint for Hindi/Hinglish
      prompt: 'This is an emergency call in Hindi or Hinglish. The caller may be panicked.'
    });

    console.log('📝 Transcript:', transcription.text);
    return transcription.text;
  } catch (error) {
    console.error('❌ STT Error:', error.message);
    throw new Error('Speech transcription failed: ' + error.message);
  }
}

/**
 * Simulate transcription for demo/testing when no audio is available
 * @param {string} simulatedText - Text to use as simulated transcription
 * @returns {string}
 */
function simulateTranscription(simulatedText) {
  console.log('🎤 [SIMULATED] Transcript:', simulatedText);
  return simulatedText || 'Mera accident ho gaya hai, please jaldi ambulance bhejo, main MG Road pe hoon';
}

module.exports = { transcribeAudio, simulateTranscription };
