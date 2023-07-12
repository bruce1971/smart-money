const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const ETHERSCAN_API_KEY="I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG";
const NEXT_PUBLIC_ETHERSCAN_API="https://api.etherscan.io/api";
const PARTICIPANT_ADDRESS = '0x70399b85054dd1d94f2264afc8704a3ee308abaf' //bayc



async function getEtherscanData() {
  const baseUrl = NEXT_PUBLIC_ETHERSCAN_API;
  const API_KEY = ETHERSCAN_API_KEY;
  const url = `https://api.etherscan.io/api?module=logs&action=getLogs&address=${PARTICIPANT_ADDRESS}&fromBlock=17290516&toBlock=17293516&apikey=${API_KEY}`;
  axios
   .get(url)
   .then(function (response) {
     console.log(response.data);
   });
}

getEtherscanData()
