// websocket.js
import WebSocket from 'ws';

const sockets = new Set();

export function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    sockets.add(ws);
    console.log('🔌 New WebSocket connection');

    ws.on('close', () => {
      sockets.delete(ws);
      console.log('❌ WebSocket disconnected');
    });
  });
}

export function broadcastTransaction(transaction) {
  const data = JSON.stringify({ type: 'new_transaction', transaction });

  sockets.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}
