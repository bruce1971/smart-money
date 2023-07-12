const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const ETHERSCAN_API_KEY="I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG";
const NEXT_PUBLIC_ETHERSCAN_API="https://api.etherscan.io/api";
const SHITCOIN_TOKEN_ADDRESS = '0x6982508145454ce325ddbe47a25d4ec3d2311933' //pepe
const SHITCOIN_TOKEN_ADDRESS = '0xa35923162c49cf95e6bf26623385eb431ad920d3' //turbo



async function getEtherscanData() {
  const baseUrl = NEXT_PUBLIC_ETHERSCAN_API;
  const API_KEY = ETHERSCAN_API_KEY;
  const url = `https://api.etherscan.io/api?module=logs&action=getLogs&address=${SHITCOIN_TOKEN_ADDRESS}&fromBlock=17290516&toBlock=17293516&apikey=${API_KEY}`;
  axios
   .get(url)
   .then(function (response) {
     console.log(response.data);
   });
}

getEtherscanData()
