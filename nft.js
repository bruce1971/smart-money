const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const ETHERSCAN_API_KEY="I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG";
const NEXT_PUBLIC_ETHERSCAN_API="https://api.etherscan.io/api";
// const NFT_TOKEN_ADDRESS = '0xd774557b647330c91bf44cfeab205095f7e6c367' //nakamigos
// const NFT_TOKEN_ADDRESS = '0x34eecedc405006afe0b39c570b906e4417770825' //foreverpunks
const NFT_TOKEN_ADDRESS = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d' //bayc



async function getEtherscanData() {
  const baseUrl = NEXT_PUBLIC_ETHERSCAN_API;
  const API_KEY = ETHERSCAN_API_KEY;
  const url = `https://api.etherscan.io/api?module=logs&action=getLogs&address=${NFT_TOKEN_ADDRESS}&fromBlock=17290516&toBlock=17293516&apikey=${API_KEY}`;
  axios
   .get(url)
   .then(function (response) {
     console.log(response.data);
   });
}

getEtherscanData()
