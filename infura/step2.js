const axios = require('axios');
const moment = require('moment');
const etherscanApiKey = 'I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG';
const { getUser } = require(`../user.js`);
const { getErc20Info } = require(`../user/getErc20Info.js`);
const { parseTx } = require(`../transaction`);


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
  txArray = txArray.filter(o => Object.keys(o.txs).includes('erc20') && Object.keys(o.txs).includes('normal'))
  return txArray
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
    txs.forEach(tx => tx.type = 'erc20')
    return txs;
  })
  const firstTx = erc20Transactions[0];
  const lastTx = erc20Transactions[erc20Transactions.length - 1];
  const userAddresses = [... new Set(erc20Transactions.map(tx => tx.to))];

  let allNormalTransactions = [];
  for (let i = 0; i < userAddresses.length; i++) {
    console.log(`${i+1}/${userAddresses.length}`);
    let normalTransactions = await axios.get(`
      https://api.etherscan.io/api
       ?module=account
       &action=txlist
       &address=${userAddresses[i]}
       &contractaddress=${contractAddress}
       &startblock=${fromBlock}
       &endblock=${toBlock}
       &sort=asc
       &apikey=${etherscanApiKey}
    `.replace(/\s/g, '')).then(res => {
      const txs = res.data.result;
      txs.forEach(tx => tx.type = 'normal');
      return txs;
    });
    allNormalTransactions.push(normalTransactions);
  }
  allNormalTransactions = allNormalTransactions.flat(1);

  let txPool = [...allNormalTransactions, ...erc20Transactions ];

  const txArray = groupTransactions(txPool);

  const erc20InfoObj = await getErc20Info(txArray);
  if (txArray.length > 0) {
    for (let i = 0; i < txArray.length; i++) {
      const activityLog = await parseTx(txArray[i], txArray[i].userAddress, [], erc20InfoObj);
      console.log(activityLog);
    }
  }
}


async function intervalExecute(fromBlock, toBlock) {
  const tradingLaunchTransactions = await getTransactions('0xed4e879087ebd0e8a77d66870012b5e0dffd0fa4',fromBlock, toBlock);
}


// Main function to monitor new token launches
async function monitorTokenLaunches() {
  const currentBlock = await getLatestBlockNumber();
  console.log('Current block number:', currentBlock);
  const creationTransactions = await intervalExecute(
    currentBlock - 50,
    currentBlock + 50
  );

}


// Start monitoring new token launches
// monitorTokenLaunches();
const n = 18172866;
intervalExecute(n, n+50);
