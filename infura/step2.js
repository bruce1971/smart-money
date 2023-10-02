const axios = require('axios');
const moment = require('moment');
const etherscanApiKey = 'I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG';
const { decoder } = require(`./decoder.js`);
const { mcapCalculator } = require(`./helper.js`);
const fs = require('fs/promises');
const path_db1 = `./infura/data/db1.json`;
const path_db2 = `./infura/data/db2.json`;
var { Web3 } = require("web3");
const APIKEY = '482599a22821425bae631e1031e90e7e';
var provider = `https://mainnet.infura.io/v3/${APIKEY}`;
var web3Provider = new Web3.providers.HttpProvider(provider);
var web3 = new Web3(web3Provider);
const ObjectsToCsv = require('objects-to-csv');


async function getData(contractObject, startBlock, endBlock) {
  let allData = [];
  const blockIncr = 1000;
  let currentBlock = startBlock;
  while (currentBlock < endBlock) {
    console.log('====');
    console.log(`Blocks remaining: ${endBlock-currentBlock} (~${Math.ceil((endBlock-currentBlock)/blockIncr)} loops)`);
    let erc20Transactions = await axios.get(`
      https://api.etherscan.io/api
       ?module=account
       &action=tokentx
       &contractaddress=${contractObject.contractAddress}
       &startblock=${currentBlock}
       &endblock=${currentBlock+blockIncr}
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
    console.log(`Tx count: ${erc20Transactions.length}`);
    if (erc20Transactions.length >= 10000) console.log('WARNING: reached 10000. Fix now!');
    allData = allData.concat(erc20Transactions);
    // while loop incr
    currentBlock = currentBlock + blockIncr + 1;
  }
  return allData;
}


function aggrData(data, contractObject) {
  const finalData = [];
  let allUserAddresses = [];
  const aggrSize = 5; //blocks
  let currentBlock = Number(data[0].blockNumber);
  const endBlock = Number(data[data.length - 1].blockNumber);
  while (currentBlock < (endBlock - 1*aggrSize)) {
    // filter on subset of data
    const subData = data.filter(o => currentBlock <= Number(o.blockNumber) && Number(o.blockNumber) <= currentBlock + aggrSize);

    // compute newUserCount
    const toAddresses = [... new Set(subData.map(tx => tx.to))];
    const fromAddresses = [... new Set(subData.map(tx => tx.from))];
    let userAddresses = [...toAddresses, ...fromAddresses];
    userAddresses = userAddresses.filter(a => a !== contractObject.pairAddress);
    const prevAllUserCount = allUserAddresses.length; //???
    allUserAddresses = [... new Set([...allUserAddresses, ...userAddresses])];
    const newUserCount = allUserAddresses.length - prevAllUserCount;

    // compute buys & sells
    let buys = 0, sells = 0;
    subData.forEach(o => {
      if (o.to === contractObject.pairAddress) sells += 1;
      if (o.from === contractObject.pairAddress) buys += 1;
    });

    // append to collector
    finalData.push({
      startBlock: currentBlock,
      endblock: currentBlock + aggrSize,
      txCount: subData.length,
      userCount: userAddresses.length,
      newUserCount: newUserCount,
      buys: buys,
      sells: sells
    });

    // while loop incr
    currentBlock = currentBlock + aggrSize + 1;
  }
  return finalData;
}


async function saveData(finalData, db2, contractObject, name) {
  db2[contractObject.contractAddress] = finalData;
  await fs.writeFile(path_db2, JSON.stringify(db2, null, 2), 'utf8');
  const csv = new ObjectsToCsv(finalData);
  await csv.toDisk(`./infura/data/csv/${name}.csv`);
}


async function intervalExecute(contractObject, name) {
  // 1) Determine blockrange of interest
  const db2 = JSON.parse(await fs.readFile(path_db2));
  let caDb2, startBlock;
  // if (db2[contractObject.contractAddress]) { // DOESNT WORK BECAUSE OF ALLUSERADDRESSES RESET
  if (false) {
    caDb2 = db2[contractObject.contractAddress];
    startBlock = caDb2[caDb2.length - 1].endblock + 1;
  } else {
    caDb2 = [];
    startBlock = contractObject.blockNumber;
  }
  const endBlock = startBlock + 10080; // next 10k blocks

  // 2) Get data for blockrange of interest
  const allData = await getData(contractObject, startBlock, endBlock);

  // 3) Group & aggr in buckets of 5 blocks
  const finalData = aggrData(allData, contractObject);

  // 4) Save data
  await saveData(finalData, db2, contractObject, name);
}


if (require.main === module) {
  (async () => {
    const db1 = JSON.parse(await fs.readFile(path_db1));
    // const name = "Pepe";
    // const name = "CUCK";
    // const name = "NiHao";
    // const name = "NicCageWaluigiElmo42069Inu";
    const name = "AstroPepeX";
    const contractObject = Object.values(db1).find(o => o.name === name);
    console.time('Timer');
    await intervalExecute(contractObject, name);
    console.timeEnd('Timer');
  })();
}
