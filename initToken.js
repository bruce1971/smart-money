const axios = require('axios');
const basePath = process.cwd();
const { accountUrl, contractUrl, formatActivityLog } = require(`${basePath}/helper.js`);
const argv = require('minimist')(process.argv.slice(2));
const addresses = require(`${basePath}/addresses.js`);
const inputTokenAddress = addresses.inputA[argv.a];
const { getUserData, txsForSingleAddress, getActivityLog } = require(`${basePath}/user.js`);
const { parseDecodedArray, parseTx } = require(`${basePath}/transaction.js`);


async function main(tokenAddress) {
  startblock = 17054600
  endblock = 17054610
  sort = 'desc'

  const erc20ContractTransactions = await axios.get(accountUrl('tokentx', null, tokenAddress, startblock, endblock, sort)).then(res => {
    const txs = res.data.result;
    txs.forEach(tx => tx.type = 'erc20')
    return txs;
  });

  const userTransactions = {};
  for (var i = 0; i < erc20ContractTransactions.length; i++) {
    const userAddress = erc20ContractTransactions[i].to;
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
