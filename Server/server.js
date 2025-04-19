
require('dotenv').config({ path: './config.env' });


const { generateRiddle } = require('./GPT-riddler/gpt.js');

async function main() {
  const riddle = await generateRiddle("toronto");
  console.log("Generated riddle:", riddle);
}

main(); 
