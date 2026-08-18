const https = require('https');

console.log('📡 Fetching Sent Emails from Live Railway API...');

https.get('https://email-scheduler-production-44d1.up.railway.app/api/emails/sent', (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log('Response:', data);
  });
});
