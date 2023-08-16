import { main } from './telegram.js';

export const handler = async (event) => {
  console.log('INIT LAMBDA...');
  const sentMessages = await main();
  const response = {
    statusCode: 200,
    body: JSON.stringify(sentMessages.map(m => m.text)),
  };
  return response;
};

handler();
