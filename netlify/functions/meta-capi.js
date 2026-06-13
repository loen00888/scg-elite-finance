const https = require('https');
const crypto = require('crypto');

const PIXEL_ID = '1565047858381586';
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

exports.handler = async function(event, context) {
  const headers = {
      'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
              'Content-Type': 'application/json'
                };

                  if (event.httpMethod === 'OPTIONS') {
                      return { statusCode: 200, headers, body: '' };
                        }

                          if (event.httpMethod !== 'POST') {
                              return { statusCode: 405, headers, body: 'Method Not Allowed' };
                                }

                                  let body;
                                    try {
                                        body = JSON.parse(event.body);
                                          } catch (e) {
                                              return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
                                                }

                                                  const { eventName, eventSourceUrl, clientIpAddress, clientUserAgent, fbp, fbc, email, phone } = body;

                                                    function hashData(data) {
                                                        if (!data) return undefined;
                                                            return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
                                                              }

                                                                const userData = {
                                                                    client_ip_address: clientIpAddress,
                                                                        client_user_agent: clientUserAgent,
                                                                          };
                                                                            if (fbp) userData.fbp = fbp;
                                                                              if (fbc) userData.fbc = fbc;
                                                                                if (email) userData.em = hashData(email);
                                                                                  if (phone) userData.ph = hashData(phone);

                                                                                    const payload = JSON.stringify({
                                                                                        data: [{
                                                                                              event_name: eventName || 'PageView',
                                                                                                    event_time: Math.floor(Date.now() / 1000),
                                                                                                          event_source_url: eventSourceUrl || 'https://scgfinanceplan.com',
                                                                                                                action_source: 'website',
                                                                                                                      user_data: userData
                                                                                                                          }]
                                                                                                                            });
                                                                                                                            
                                                                                                                              return new Promise((resolve) => {
                                                                                                                                  const options = {
                                                                                                                                        hostname: 'graph.facebook.com',
                                                                                                                                              path: `/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
                                                                                                                                                    method: 'POST',
                                                                                                                                                          headers: {
                                                                                                                                                                  'Content-Type': 'application/json',
                                                                                                                                                                          'Content-Length': Buffer.byteLength(payload)
                                                                                                                                                                                }
                                                                                                                                                                                    };
                                                                                                                                                                                    
                                                                                                                                                                                        const req = https.request(options, (res) => {
                                                                                                                                                                                              let data = '';
                                                                                                                                                                                                    res.on('data', (chunk) => { data += chunk; });
                                                                                                                                                                                                          res.on('end', () => {
                                                                                                                                                                                                                  resolve({ statusCode: res.statusCode, headers, body: data });
                                                                                                                                                                                                                        });
                                                                                                                                                                                                                            });
                                                                                                                                                                                                                            
                                                                                                                                                                                                                                req.on('error', (e) => {
                                                                                                                                                                                                                                      resolve({ statusCode: 500, headers, body: JSON.stringify({ error: e.message }) });
                                                                                                                                                                                                                                          });
                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                              req.write(payload);
                                                                                                                                                                                                                                                  req.end();
                                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                                    };
