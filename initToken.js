const axios = require('axios');
const basePath = process.cwd();
const { accountUrl, contractUrl, formatActivityLog } = require(`${basePath}/helper.js`);
const argv = require('minimist')(process.argv.slice(2));
const addresses = require(`${basePath}/addresses.js`);
const inputTokenAddress = addresses.inputA[argv.a];
const { getUserData, txsForSingleAddress, getActivityLog } = require(`${basePath}/user.js`);
const { parseDecodedArray, parseTx } = require(`${basePath}/transaction.js`);


async function main(tokenAddress) {
  // startblock = 17054500
  // endblock = 17054610
  let startblock, endblock;
  const sort = 'asc';

  let erc20ContractTransactions = await axios.get(accountUrl('tokentx', null, tokenAddress, startblock, endblock, sort)).then(res => {
    const txs = res.data.result;
    txs.forEach(tx => tx.type = 'erc20')
    return txs;
  });

  const firstTx = erc20ContractTransactions[0];
  startblock = Number(firstTx.blockNumber);
  endblock = startblock + 1700;

  erc20ContractTransactions = erc20ContractTransactions.filter(o => Number(o.blockNumber) < endblock);

  console.log(startblock, endblock);

  const userTransactions = {};
  for (var i = 0; i < erc20ContractTransactions.length; i++) {
    const userAddress = erc20ContractTransactions[i].to;
    console.log('Block diff: ', Number(erc20ContractTransactions[i].blockNumber) - startblock);
    console.log(userAddress);
    if (!userTransactions[userAddress]) {
      userTransactions[userAddress] = await axios.get(accountUrl('txlist', userAddress, tokenAddress, startblock, endblock, sort)).then(res => {
        const txs = res.data.result;
        txs.forEach(tx => tx.type = 'normal');
        return txs;
      });
    }
  }

  let normalTransactions = [];
  Object.values(userTransactions).forEach(txArr => {
    normalTransactions = [...normalTransactions, ...txArr];
  });

  let transactions = [
    ...erc20ContractTransactions,
    ...normalTransactions
  ];

  // group txs together via hash
  const txHashes = [...new Set(transactions.map(tx => tx.hash))];
  const txArray = [];
  txHashes.forEach(hash => {
    const txs = transactions.filter(tx => tx.hash === hash);
    const txsObject = {};
    txs.forEach(tx => txsObject[tx.type] = tx);
    const timeStamp = Number(txs[0].timeStamp);
    txArray.push({
      hash: hash,
      timeStamp: timeStamp,
      txs: txsObject
    })
  });

  const pnl = { address: tokenAddress, wethOut: 0, wethIn: 0, shitOut: 0, shitIn: 0 };
  const activityLog = await getActivityLog(txArray, tokenAddress, pnl);
  formatActivityLog(activityLog);
}


if (require.main === module) main('0x6982508145454ce325ddbe47a25d4ec3d2311933');
