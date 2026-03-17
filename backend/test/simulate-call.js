/**
 * Sahayak AI — Call Simulation Test
 * Run: node test/simulate-call.js
 *
 * Sends a simulated emergency call to the backend and prints the full response.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

const testCases = [
  {
    name: '🚗 Road Accident (Hinglish)',
    text: 'Mera accident ho gaya hai, MG Road pe. Ek car ne meri bike ko takkar maar di. Main bahut zakhmi hoon, please jaldi ambulance bhejo.',
    callerNumber: '+91-9876543210'
  },
  {
    name: '❤️ Cardiac Emergency (Hindi)',
    text: 'Mere papa ko dil ka daura pad gaya hai. Wo gir gaye hain aur ab bol nahi pa rahe. Please jaldi aao, hum Sector 15 mein hain.',
    callerNumber: '+91-9876543211'
  },
  {
    name: '🔥 Fire (Hinglish)',
    text: 'Building mein aag lag gayi hai! Third floor pe dhuan aa raha hai. Bohot log andar fase hain. Connaught Place, Block C.',
    callerNumber: '+91-9876543212'
  }
];

async function runTest(testCase) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST: ${testCase.name}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Input: "${testCase.text}"\n`);

  try {
    const response = await fetch(`${BASE_URL}/voice/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: testCase.text,
        callerNumber: testCase.callerNumber
      })
    });

    const data = await response.json();

    console.log('📋 Result:');
    console.log(`   Emergency Type: ${data.aiAnalysis?.emergencyType}`);
    console.log(`   Severity: ${data.aiAnalysis?.severity}`);
    console.log(`   Location: ${data.aiAnalysis?.location?.description}`);
    console.log(`   People: ${data.aiAnalysis?.peopleInvolved}`);
    console.log(`   AI Response: ${data.aiAnalysis?.responseMessage}`);
    console.log(`   Actions: ${data.actions?.map(a => a.type).join(', ')}`);
    console.log(`   Emergency ID: ${data.emergency?.id}`);
    console.log(`   Audio URL: ${data.audioUrl}`);
    console.log(`   ✅ PASSED`);

    return true;
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🧪 Sahayak AI — Call Simulation Tests');
  console.log(`🌐 Target: ${BASE_URL}\n`);

  // Check if server is running
  try {
    await fetch(`${BASE_URL}/`);
  } catch (e) {
    console.error('❌ Cannot reach server. Make sure backend is running on', BASE_URL);
    process.exit(1);
  }

  let passed = 0;
  for (const tc of testCases) {
    const result = await runTest(tc);
    if (result) passed++;
    // Small delay between tests
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Results: ${passed}/${testCases.length} passed`);
  console.log(`${'='.repeat(60)}\n`);
}

main();
