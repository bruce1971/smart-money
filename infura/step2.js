const axios = require('axios');
const moment = require('moment');
const etherscanApiKey = 'I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG';
const { decoder } = require(`./decoder.js`);
const { mcapCalculator } = require(`./helper.js`);
const fs = require('fs/promises');
const path_db1 = `./infura/data/db1.json`;
const path_min5 = `./infura/data/min5.json`;
var { Web3 } = require("web3");
const APIKEY = '482599a22821425bae631e1031e90e7e';
var provider = `https://mainnet.infura.io/v3/${APIKEY}`;
var web3Provider = new Web3.providers.HttpProvider(provider);
var web3 = new Web3(web3Provider);
const ObjectsToCsv = require('objects-to-csv');
let allUserAddresses = [];


async function getTxsData(contractObject, fromBlock, toBlock) {
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
      tokenDecimal: tx.tokenDecimal
    }))
    return final;
  });
  const toAddresses = [... new Set(erc20Transactions.map(tx => tx.to))];
  const fromAddresses = [... new Set(erc20Transactions.map(tx => tx.from))];
  let userAddresses = [...toAddresses, ...fromAddresses];
  userAddresses = userAddresses.filter(a => a !== contractObject.pairAddress);

  const prevAllUserCount = allUserAddresses.length;
  allUserAddresses = [... new Set([...allUserAddresses, ...userAddresses])];
  const newUserCount = allUserAddresses.length - prevAllUserCount;

  if (userAddresses.includes('0x70399b85054dd1d94f2264afc8704a3ee308abaf')) {
    console.log('SCRIIIIIIIIIIIIIIIIIIBS');
  }

  // const mcapArray = [];
  // for (var i = 0; i < erc20Transactions.length; i++) {
  //   const txHash = erc20Transactions[i].hash;
  //   const parsedTx = await decoder(txHash);
  //   if (parsedTx?.type === 'execute') {
  //     mcapArray.push(mcapCalculator(parsedTx.txs[0].amountIn, parsedTx.txs[0].amountOut, contractObject.totalSupply, contractObject.decimals))
  //   }
  //   if (mcapArray.length === 3) break;
  // }
  // const medianMcap = mcapArray.sort((a, b) => a - b)[1];
  // console.log('median mcap', medianMcap);

  let buys = 0;
  let sells = 0;
  erc20Transactions.forEach(o => {
    if (o.to === contractObject.pairAddress) sells += 1;
    if (o.from === contractObject.pairAddress) buys += 1;
  });
  return {
    txCount: erc20Transactions.length,
    userCount: userAddresses.length,
    userCountAcc: allUserAddresses.length,
    newUserCount: newUserCount,
    buys: buys,
    sells: sells
  }
}


async function intervalExecute(contractObject) {
  const min5 = JSON.parse(await fs.readFile(path_min5));
  const caMin5 = [];
  let startBlock = contractObject.blockNumber;
  const minIncr = 5, nLoops = 12 * 3 * 1;
  // const minIncr = 1, nLoops = 30;
  const blockIncr = 5 * minIncr;
  for (let i = 0; i < nLoops; i++) {
    console.log('==========================================================================');
    console.log(`min ${minIncr*(i+1)}`);
    let txData = await getTxsData(
      contractObject,
      startBlock,
      startBlock + blockIncr,
    );
    txData = {
      startBlock: startBlock,
      endblock: startBlock + blockIncr,
      minIncr: minIncr,
      ...txData
    }
    console.log(txData);
    caMin5.push(txData);
    startBlock = startBlock + blockIncr + 1;
  }
  min5[contractObject.contractAddress] = caMin5;
  await fs.writeFile(path_min5, JSON.stringify(min5, null, 2), 'utf8');
  const csv = new ObjectsToCsv(caMin5);
  await csv.toDisk(`./infura/data/my.csv`);
}


if (require.main === module) {
  (async () => {
    const db1 = JSON.parse(await fs.readFile(path_db1));
    // const name = "Pepe";
    const name = "AstroPepeX";
    // const name = "BatsNibblingBananas";
    const contractObject = Object.values(db1).find(o => o.name === name);
    intervalExecute(contractObject);
  })();
}
