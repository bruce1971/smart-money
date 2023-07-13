const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const ETHERSCAN_API_KEY="I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG";
const NEXT_PUBLIC_ETHERSCAN_API="https://api.etherscan.io/api";
let PARTICIPANT_ADDRESS = '0x70399b85054dd1d94f2264afc8704a3ee308abaf' //scribbs
// let PARTICIPANT_ADDRESS = '0x39E8c5F01F6314E0d8d5bA00F3D2e9569e45C05a' //me
// let PARTICIPANT_ADDRESS = '0xed2c5d18f772f834d8ec9f040ee73d1a17056d7f' //kucoin
PARTICIPANT_ADDRESS = PARTICIPANT_ADDRESS.toLowerCase();


async function getEtherscanData() {
  const baseUrl = NEXT_PUBLIC_ETHERSCAN_API;
  const API_KEY = ETHERSCAN_API_KEY;
  const url = `
    https://api.etherscan.io/api
     ?module=account
     &action=txlist
     &address=${PARTICIPANT_ADDRESS}
     &startblock=0
     &endblock=99999999
     &page=1
     &sort=desc
     &apikey=${ETHERSCAN_API_KEY}
  `.replace(/\s/g, '');
  axios
   .get(url)
   .then(function (response) {
     let value;
     let ins = 0;
     let outs = 0;
     const normalTransactions = response.data.result;
     normalTransactions.forEach(tx => {
       console.log('-----------------');
       if (tx.from.toLowerCase() === PARTICIPANT_ADDRESS && tx.functionName === '' && tx.input === '0x') {
         value = Number(tx.value)/10**18;
         outs = outs + value;
         console.log(`Send ${value}eth to ${tx.to}`);
       } else if (tx.to.toLowerCase() === PARTICIPANT_ADDRESS && tx.functionName === '') {
         value = Number(tx.value)/10**18;
         ins = ins + value;
         console.log(`Receive ${value}eth from ${tx.from}`);
       } else if (tx.to.toLowerCase() === '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'.toLowerCase() && tx.functionName.includes('commit')) {
         console.log(`Request to Register ENS Domain`);
       } else if (tx.to.toLowerCase() === '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'.toLowerCase() && tx.functionName.includes('registerWithConfig')) {
         console.log(`Register ENS Domain`);
       } else {
         console.log(tx);
       }
     });
     // console.log('INS',ins);
     // console.log('OUTS',outs);
     // const profit = outs - ins;
     // console.log('PROFIT', profit);
   });

  // const url2 = `
  //   https://api.etherscan.io/api
  //    ?module=account
  //    &action=txlistinternal
  //    &address=${PARTICIPANT_ADDRESS}
  //    &startblock=0
  //    &endblock=99999999
  //    &page=1
  //    &sort=desc
  //    &apikey=${ETHERSCAN_API_KEY}
  // `.replace(/\s/g, '');
  // axios
  //  .get(url2)
  //  .then(function (response) {
  //    const internalTransactions = response.data.result;
  //    console.log('int',internalTransactions.length);
  //  });
  //
  // const url3 = `
  //   https://api.etherscan.io/api
  //    ?module=account
  //    &action=tokentx
  //    &address=${PARTICIPANT_ADDRESS}
  //    &startblock=0
  //    &endblock=99999999
  //    &page=1
  //    &sort=desc
  //    &apikey=${ETHERSCAN_API_KEY}
  // `.replace(/\s/g, '');
  // axios
  //  .get(url3)
  //  .then(function (response) {
  //    const erc20Transactions = response.data.result;
  //    console.log('erc20',erc20Transactions.length);
  //  });
  //
  // const url4 = `
  //   https://api.etherscan.io/api
  //    ?module=account
  //    &action=tokennfttx
  //    &address=${PARTICIPANT_ADDRESS}
  //    &startblock=0
  //    &endblock=99999999
  //    &page=1
  //    &sort=desc
  //    &apikey=${ETHERSCAN_API_KEY}
  // `.replace(/\s/g, '');
  // axios
  //  .get(url4)
  //  .then(function (response) {
  //    const erc721Transactions = response.data.result;
  //    console.log('erc721',erc721Transactions.length);
  //  });
  //
  // const url5 = `
  //   https://api.etherscan.io/api
  //    ?module=account
  //    &action=token1155tx
  //    &address=${PARTICIPANT_ADDRESS}
  //    &startblock=0
  //    &endblock=99999999
  //    &page=1
  //    &sort=desc
  //    &apikey=${ETHERSCAN_API_KEY}
  // `.replace(/\s/g, '');
  // axios
  //  .get(url5)
  //  .then(function (response) {
  //    const erc1155Transactions = response.data.result;
  //    console.log('erc1155',erc1155Transactions.length);
  //  });
}

getEtherscanData()
