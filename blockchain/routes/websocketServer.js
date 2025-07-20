import WebSocket from 'ws';

import Blockchain from '../blockchain.js'; // Assuming blockchain is being imported
const wss = new WebSocket.Server({ port: 3000 });


wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');

  // Send the current block to the connected client
    ws.send(JSON.stringify({ newBlock: Blockchain.latestBlock }));

  // Listen for messages from the client
  ws.on('message', (message) => {
    console.log('Received:', message);
    // Broadcast the new block to all connected clients if needed
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ newBlock: Blockchain.latestBlock }));
      }
    });
  });
});

export default wss;
