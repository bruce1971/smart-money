const axios = require('axios');
const moment = require('moment');
const etherscanApiKey = 'I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG';
const { getUser } = require(`../user.js`);
const { getErc20Info } = require(`../user/getErc20Info.js`);
const { parseTx } = require(`../transaction`);
const fs = require('fs/promises');
const path = `./infura/data/db1.json`;


function groupTransactions(txPool) {
  const txHashes = [...new Set(txPool.map(tx => tx.hash))];
  let txArray = [];
  txHashes.forEach(hash => {
    const txs = txPool.filter(tx => tx.hash === hash);
    const txsObject = {};
    txs.forEach(tx => txsObject[tx.type] = tx);
    const timeStamp = Number(txs[0].timeStamp);
    const blockNumber = Number(txs[0].blockNumber);
    let userAddress = txs.find(o => o.type === 'normal')?.from;
    txArray.push({
      blockNumber: blockNumber,
      timeStamp: timeStamp,
      dateTime: moment(timeStamp * 1000).format("YYYY/MM/DD HH:mm:ss"),
      hash: hash,
      userAddress: userAddress,
      txs: txsObject
    })
  });
  txArray = txArray.sort((a, b) => a.blockNumber - b.blockNumber);
  // txArray = txArray.filter(o => Object.keys(o.txs).includes('erc20') && Object.keys(o.txs).includes('normal'))
  txArray = txArray.filter(o => Object.keys(o.txs).includes('erc20'))
  return txArray;
}


async function getTransactions(contractAddress, fromBlock, toBlock) {
  let erc20Transactions = await axios.get(`
    https://api.etherscan.io/api
     ?module=account
     &action=tokentx
     &contractaddress=${contractAddress}
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
      tokenName: tx.tokenName,
      tokenSymbol: tx.tokenSymbol,
      tokenDecimal: tx.tokenDecimal,
      type: 'erc20'
    }))
    return final;
  })
  const userAddresses = [... new Set(erc20Transactions.map(tx => tx.to))];
  console.log('==========================================================================');
  console.log('erc20Transactions.length',erc20Transactions.length);
  console.log('userAddresses.length',userAddresses.length);
  console.log(erc20Transactions);

  // let allNormalTransactions = [];
  // for (let i = 0; i < userAddresses.length; i++) {
  //   console.log(`${i+1}/${userAddresses.length}`);
  //   let normalTransactions = await axios.get(`
  //     https://api.etherscan.io/api
  //      ?module=account
  //      &action=txlist
  //      &address=${userAddresses[i]}
  //      &contractaddress=${contractAddress}
  //      &startblock=${fromBlock}
  //      &endblock=${toBlock}
  //      &sort=asc
  //      &apikey=${etherscanApiKey}
  //   `.replace(/\s/g, '')).then(res => {
  //     const txs = res.data.result;
  //     txs.forEach(tx => tx.type = 'normal');
  //     return txs;
  //   });
  //   allNormalTransactions.push(normalTransactions);
  // }
  // allNormalTransactions = allNormalTransactions.flat(1);
  //
  // let txPool = [...allNormalTransactions, ...erc20Transactions ];
  //
  // const txArray = groupTransactions(txPool);
  //
  // const erc20InfoObj = await getErc20Info(txArray);
  // if (txArray.length > 0) {
  //   for (let i = 0; i < txArray.length; i++) {
  //     console.log(txArray[i]);
  //     const activityLog = await parseTx(txArray[i], txArray[i].userAddress, [], erc20InfoObj);
  //     console.log(activityLog);
  //     console.log('==================');
  //   }
  // }
}


async function intervalExecute(contractObject) {
  let startBlock = contractObject.blockNumber;
  const blockIncr = 10;
  for (let i = 0; i < 5; i++) {
    console.log(i);
    const transactions = await getTransactions(
      contractObject.contractAddress,
      startBlock,
      startBlock + blockIncr
    );
    startBlock = startBlock + blockIncr;
  }
}



// Start monitoring new token launches
if (require.main === module) {
  (async () => {
    const db1 = JSON.parse(await fs.readFile(path));
    // const name = "AstroPepeX";
    const name = "BatsNibblingBananas";
    const contractObject = Object.values(db1).find(o => o.name === name);
    intervalExecute(contractObject);
  })();
}
