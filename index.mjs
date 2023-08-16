import { main } from './telegram.js';

export const handler = async (event) => {
  main();
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda 4!'),
  };
  return response;
};

console.log('yaaa');
