const axios = require('axios');
const moment = require('moment');
const etherscanApiKey = 'I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG';
const { getUser } = require(`../user.js`);
const { getErc20Info } = require(`../user/getErc20Info.js`);
const { parseTx } = require(`../transaction`);
const { decoder2 } = require(`../transaction/decoder.js`);
const fs = require('fs/promises');
const path = `./infura/data/db1.json`;
var { Web3 } = require("web3");
const APIKEY = '482599a22821425bae631e1031e90e7e';
var provider = `https://mainnet.infura.io/v3/${APIKEY}`;
var web3Provider = new Web3.providers.HttpProvider(provider);
var web3 = new Web3(web3Provider);


async function getTransactions(contractObject, fromBlock, toBlock) {
  let erc20Transactions = await axios.get(`
    https://api.etherscan.io/api
     ?module=account
     &action=tokentx
     &contractaddress=${contractObject.contractAddress}
     &startblock=${fromBlock}
     &endblock=${toBlock}
     &sort=asc
     &apikey=${etherscanApiKey}
  `.replace(/\s/g, '')).then(res => {
    const txs = res.data.result;
    const final = [];
    txs.forEach(tx => final.push({
      blockNumber: tx.blockNumber,
      timeStamp: tx.timeStamp,
      hash: tx.hash,
      from: tx.from,
      contractAddress: tx.contractAddress,
      to: tx.to,
      value: tx.value,
      tokenName: tx.tokenName,
      tokenSymbol: tx.tokenSymbol,
      tokenDecimal: tx.tokenDecimal,
      type: 'erc20'
    }))
    return final;
  });
  const toAddresses = [... new Set(erc20Transactions.map(tx => tx.to))];
  const fromAddresses = [... new Set(erc20Transactions.map(tx => tx.from))];
  let userAddresses = [...toAddresses, ...fromAddresses];
  userAddresses = userAddresses.filter(a => a !== contractObject.pairAddress);

  console.log('erc20Transactions',erc20Transactions.length);
  console.log('userAddresses',userAddresses.length);
  if (userAddresses.includes('0x70399b85054dd1d94f2264afc8704a3ee308abaf')) {
    console.log('SCRIIIIIIIIIIIIIIIIIIBS');
  }
  let buys = 0;
  let sells = 0;
  console.log(erc20Transactions[0].hash);
  const tx = await web3.eth.getTransaction(erc20Transactions[0].hash)
  // console.log(tx);
  erc20Transactions.forEach(o => {
    if (o.to === contractObject.pairAddress) {
      sells += 1;
      // console.log('SELL');
    }
    if (o.from === contractObject.pairAddress) {
      buys += 1;
      // console.log('BUY');
    }
    // console.log(o.hash);
    // console.log('-------');
  });
  console.log('buys', buys);
  console.log('sells', sells);
}


async function intervalExecute(contractObject) {
  let startBlock = contractObject.blockNumber;
  const minIncr = 1;
  const blockIncr = 6 * minIncr;
  for (let i = 0; i < 5; i++) {
    console.log('==========================================================================');
    console.log(i+1);
    const transactions = await getTransactions(
      contractObject,
      startBlock,
      startBlock + blockIncr
    );
    startBlock = startBlock + blockIncr + 1;
  }
}



// Start monitoring new token launches
if (require.main === module) {
  (async () => {
    const db1 = JSON.parse(await fs.readFile(path));
    const name = "AstroPepeX";
    // const name = "BatsNibblingBananas";
    const contractObject = Object.values(db1).find(o => o.name === name);
    intervalExecute(contractObject);
  })();
}
