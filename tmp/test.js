const https = require('https');

https.get('https://vxhoaqghvajsrtsvhksb.supabase.co/functions/v1/make-server-a70c1202/health', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Response:', data, 'Status:', res.statusCode));
}).on('error', (err) => console.error('Error:', err.message));

const options = {
  hostname: 'vxhoaqghvajsrtsvhksb.supabase.co',
  port: 443,
  path: '/functions/v1/make-server-a70c1202/setup-admin',
  method: 'POST'
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Setup Admin Response:', data, 'Status:', res.statusCode));
});

req.on('error', (e) => {
  console.error('Setup Admin Error:', e);
});
req.end();
