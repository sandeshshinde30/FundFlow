import fs from 'fs';
import path from 'path';

const storagePath = path.resolve('blockchain_data.json');

function loadData() {
  try {
    if (fs.existsSync(storagePath)) {
      const raw = fs.readFileSync(storagePath);
      return JSON.parse(raw);
    }
    return { chain: [], transactions: [] };
  } catch (err) {
    console.error('Error reading storage:', err.message);
    return { chain: [], transactions: [] };
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(storagePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing storage:', err.message);
  }
}

export { loadData, saveData };
