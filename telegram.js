const TelegramBot = require('node-telegram-bot-api');
const TARGET_USER_ID = '2141149594';
const YOUR_API_TOKEN = '6087762788:AAGBTKeAyFBcZraRvQVacTVlOxqk2fPpQSQ';
const basePath = process.cwd();
const { getUserData } = require(`${basePath}/user.js`);
const addresses = require(`${basePath}/addresses.js`);


async function getMessages() {
  const secondsAgo = 3600 * 24 * 3;
  const userData = await getUserData(addresses.inputU['scribbs'], null, secondsAgo);
  return userData.activityLog;
}

async function sendTelegram(messages) {
  const bot = new TelegramBot(YOUR_API_TOKEN, { polling: true });
  bot.stopPolling();
  const targetUserId = TARGET_USER_ID;
  for (let i = 0; i < messages.length; i++) {
    const message = `${messages[i].activity} \n ${messages[i].tx}`;
    console.log(message);
    await bot.sendMessage(targetUserId, message)
  }
}

async function main() {
  const messages = await getMessages();
  sendTelegram(messages);
}

main();
