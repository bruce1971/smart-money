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


async function save(db2, contractObject, caDb2, name, minIncr, nLoops) {
  db2[contractObject.contractAddress] = caDb2;
  await fs.writeFile(path_db2, JSON.stringify(db2, null, 2), 'utf8');
  const csv = new ObjectsToCsv(caDb2);
  await csv.toDisk(`./infura/data/csv/${name}.csv`);
}


async function intervalExecute(contractObject, name) {
  const db2 = JSON.parse(await fs.readFile(path_db2));
  let caDb2, iStart;
  if (db2[contractObject.contractAddress]) {
    caDb2 = db2[contractObject.contractAddress];
    iStart = caDb2.length;
  } else {
    caDb2 = [];
    iStart = 0;
  }
  let startBlock = contractObject.blockNumber;
  const nLoops = 60 * 24 * 7 * 3;
  const minIncr = 1;
  const blockIncr = 5 * minIncr;
  for (let i = iStart; i < nLoops; i++) {
    console.log('==========================================================================');
    console.log(`min ${minIncr*(i+1)}/${minIncr*nLoops}`);
    let txData = await getTxsData(
      contractObject,
      startBlock,
      startBlock + blockIncr,
    );
    txData = {
      min: minIncr*(i+1),
      startBlock: startBlock,
      endblock: startBlock + blockIncr,
      minIncr: minIncr,
      ...txData
    }
    console.log(txData);
    caDb2.push(txData);
    startBlock = startBlock + blockIncr + 1;
    if (i % 100 === 0) await save(db2, contractObject, caDb2, name, minIncr, nLoops);
  }

  await save(db2, contractObject, caDb2, name, minIncr, nLoops);
}


if (require.main === module) {
  (async () => {
    const db1 = JSON.parse(await fs.readFile(path_db1));
    // const name = "Pepe";
    // const name = "CUCK";
    // const name = "NiHao";
    const name = "NicCageWaluigiElmo42069Inu";
    const contractObject = Object.values(db1).find(o => o.name === name);
    intervalExecute(contractObject, name);
  })();
}
