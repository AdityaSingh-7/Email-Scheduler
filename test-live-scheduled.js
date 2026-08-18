const https = require('https');

https.get('https://email-scheduler-production-44d1.up.railway.app/api/emails/scheduled', (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log('Scheduled Emails Response:', data);
  });
});
