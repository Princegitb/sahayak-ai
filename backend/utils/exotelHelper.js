/**
 * Build Exotel-compatible XML responses
 */

/**
 * Build XML response that plays an audio file
 * @param {string} audioUrl - URL to the audio file
 * @returns {string} XML string
 */
function buildPlayResponse(audioUrl) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${audioUrl}</Play>
</Response>`;
}

/**
 * Build XML response that speaks text (Say)
 * @param {string} text - Text to speak
 * @returns {string} XML string
 */
function buildSayResponse(text) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>${text}</Say>
</Response>`;
}

/**
 * Build XML response that records caller speech
 * @param {string} callbackUrl - URL to send recording to
 * @param {number} maxLength - Max recording length in seconds
 * @returns {string}
 */
function buildRecordResponse(callbackUrl, maxLength = 30) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Record action="${callbackUrl}" maxLength="${maxLength}" />
</Response>`;
}

/**
 * Build combined response: play audio then record
 * @param {string} audioUrl
 * @param {string} recordCallbackUrl
 * @returns {string}
 */
function buildPlayAndRecordResponse(audioUrl, recordCallbackUrl) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${audioUrl}</Play>
  <Record action="${recordCallbackUrl}" maxLength="30" />
</Response>`;
}

/**
 * Build fallback/error response
 * @returns {string}
 */
function buildErrorResponse() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>We are experiencing technical difficulties. Please stay on the line. Help is being dispatched to your location.</Say>
</Response>`;
}

module.exports = {
  buildPlayResponse,
  buildSayResponse,
  buildRecordResponse,
  buildPlayAndRecordResponse,
  buildErrorResponse
};
