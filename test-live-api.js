const https = require('https');

const postData = JSON.stringify({
  recipients: ['live-demo@outboxlabs.com', 'lead2@reachinbox.ai'],
  subject: 'Live Production Email Test',
  body: 'Testing live Railway backend scheduling API',
  delayBetween: 2000,
});

const options = {
  hostname: 'email-scheduler-production-44d1.up.railway.app',
  port: 443,
  path: '/api/emails/schedule',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
};

console.log('📡 Sending POST request to live Railway API...');

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log('Response Body:', data);
  });
});

req.on('error', (e) => {
  console.error('Request Error:', e);
});

req.write(postData);
req.end();
