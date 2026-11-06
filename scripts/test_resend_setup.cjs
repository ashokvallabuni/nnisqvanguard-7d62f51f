const { Resend } = require('resend');
const fs = require('fs');

function testResendSetup() {
  console.log('=== RESEND SETUP & CREDENTIALS CHECK ===\n');

  const envText = fs.readFileSync('.env', 'utf8');
  const env = {};
  for (const line of envText.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }

  const apiKey = env.RESEND_API_KEY;
  console.log('1. Checking RESEND_API_KEY in .env:');
  console.log(`- Present: ${Boolean(apiKey)}`);
  if (apiKey) {
    console.log(`- Format: ${apiKey.startsWith('re_') ? 'Valid Resend Key Format (starts with re_)' : 'Invalid Format'}`);
  } else {
    console.log('- Notice: RESEND_API_KEY is not yet added to .env');
  }

  console.log('\n2. Testing SDK instantiation:');
  try {
    const resend = new Resend(apiKey || 're_dummy_test_key_for_instantiation');
    console.log('✓ Resend SDK successfully imported and instantiated.');
  } catch (err) {
    console.error('SDK instantiation error:', err);
  }
}

testResendSetup();

