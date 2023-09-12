const TARGET_USER_ID = '2141149594';
const YOUR_API_TOKEN = '6087762788:AAGBTKeAyFBcZraRvQVacTVlOxqk2fPpQSQ';

import TelegramBot from 'node-telegram-bot-api';
const basePath = process.cwd();
import { getUser } from './user.js';
import addresses from './addresses.js';


async function getMessages(userAddresses, daysAgo=1/24) {
  const userData = await getUser(userAddresses, null, daysAgo);
  const activityLog = userData.activityLog.filter(a => ['buy', 'sell', 'swap'].includes(a.type));
  return activityLog;
}


async function sendTelegram(messages) {
  const bot = new TelegramBot(YOUR_API_TOKEN, { polling: true });
  bot.stopPolling();
  const targetUserId = TARGET_USER_ID;
  const sentMessages = [];
  if (messages.length === 0) {
    console.log('No new txs..');
    // const sentMessage = await bot.sendMessage(targetUserId, 'No new txs...');
    // sentMessages.push(sentMessage);
  } else {
    for (let i = 0; i < messages.length; i++) {
      const message = `${messages[i].user} \n\n${messages[i].activity} \n\n${messages[i].tx}`;
      const sentMessage = await bot.sendMessage(targetUserId, message);
      sentMessages.push(sentMessage);
    }
  }
  return sentMessages;
}


async function sendAll(userArray) {
  let allMessages = [];
  for (var i = 0; i < userArray.length; i++) {
    const userMessages = await getMessages(addresses.inputU[userArray[i]]);
    userMessages.forEach(o => o.user = userArray[i]);
    allMessages = [...allMessages, ...userMessages];
  }
  const sentMessages = await sendTelegram(allMessages);
  return sentMessages;
}


export const handler = async (event) => {
  console.time('TELEGRAM')
  const sentMessages = await sendAll(['scribbs', 'osf', 'artchick', 'grow', 'left', 'judge', 'me']);
  const response = { statusCode: 200, body: JSON.stringify(sentMessages.map(m => m.text)) };
  console.timeEnd('TELEGRAM')
  return response;
};


// handler();
