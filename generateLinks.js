// generateLinks.js
const clients = require('./src/clients.json');

const baseUrl = 'https://your-vercel-domain.com/client';

clients.clients.forEach(client => {
  console.log(`${client.name}: ${baseUrl}/${client.id}`);
});
