import WebSocket from 'ws';
import { Server as SocketIOServer } from 'socket.io';

// Connect to the WebSocket server running on node 3000
const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => {
  console.log('Connected to 3000 via WebSocket');
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  if (message.newBlock) {
    console.log('New block received:', message.newBlock);
    addNewBlockToChain(message.newBlock); // Function to add the new block to the chain in 3001
  }
});

function addNewBlockToChain(newBlock) {
  // Your logic to add the block to the chain in node 3001
  console.log('Added new block to 3001:', newBlock);
}

export default ws;
