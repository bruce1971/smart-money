const TelegramBot = require('node-telegram-bot-api');
const TARGET_USER_ID = '2141149594';
const YOUR_API_TOKEN = '6087762788:AAGBTKeAyFBcZraRvQVacTVlOxqk2fPpQSQ';
const basePath = process.cwd();
const { getUserData } = require(`${basePath}/user.js`);
const addresses = require(`${basePath}/addresses.js`);


async function getMessages(userAddresses, secondsAgo=3600) {
  const userData = await getUserData(userAddresses, null, secondsAgo);
  return userData.activityLog;
}


async function sendTelegram(messages) {
  const bot = new TelegramBot(YOUR_API_TOKEN, { polling: true });
  bot.stopPolling();
  const targetUserId = TARGET_USER_ID;
  const sentMessages = [];
  for (let i = 0; i < messages.length; i++) {
    const message = `${messages[i].user} \n\n${messages[i].activity} \n\n${messages[i].tx}`;
    console.log(message);
    const sentMessage = await bot.sendMessage(targetUserId, message);
    sentMessages.push(sentMessage);
  }
  return sentMessages;
}


async function main(userArray) {
  let allMessages = [];
  for (var i = 0; i < userArray.length; i++) {
    const userMessages = await getMessages(addresses.inputU[userArray[i]]);
    userMessages.forEach(o => o.user = userArray[i]);
    allMessages = [...allMessages, ...userMessages];
  }
  const sentMessages = await sendTelegram(allMessages);
  return sentMessages;
}


module.exports = { main };


if (require.main === module) main(['scribbs', 'osf', 'artchick']);
