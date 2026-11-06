const fs = require('fs');

function checkEnv() {
  const envText = fs.readFileSync('.env', 'utf8');
  const env = {};
  for (const line of envText.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  console.log('BLOCKCHAIN_SIGNER_KEY present:', Boolean(env.BLOCKCHAIN_SIGNER_KEY));
  console.log('BLOCKCHAIN_RPC_URL present:', Boolean(env.BLOCKCHAIN_RPC_URL));
  console.log('BLOCKCHAIN_CONTRACT_ADDRESS present:', Boolean(env.BLOCKCHAIN_CONTRACT_ADDRESS));
  console.log('SMTP_HOST present:', Boolean(env.SMTP_HOST), env.SMTP_HOST ? `(${env.SMTP_HOST})` : '');
  console.log('SMTP_USER present:', Boolean(env.SMTP_USER), env.SMTP_USER ? `(${env.SMTP_USER})` : '');
  console.log('SMTP_PASS present:', Boolean(env.SMTP_PASS));
  console.log('RESEND_API_KEY present:', Boolean(env.RESEND_API_KEY));
}

checkEnv();

