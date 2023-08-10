const axios = require('axios');
const basePath = process.cwd();
const { contractUrl, formatTimestamp } = require(`${basePath}/helper.js`);
const argv = require('minimist')(process.argv.slice(2));
const addresses = require(`${basePath}/addresses.js`);
const tokenAddress = addresses.inputA[argv.a];


async function getWallets () {
  let i = 0;
  let txLength = 1;
  let startblock = 0;
  const allTransactions = [];
  while(i < 1) {
  // while(txLength > 0) {
    console.log(i);
    let transactions = await axios.get(contractUrl(startblock, tokenAddress)).then(res => res.data.result);
    txLength = transactions.length;
    const firstTx = transactions[0];
    console.log('first',firstTx.blockNumber);
    const lastTx = transactions[transactions.length - 1];
    console.log('last',lastTx.blockNumber);
    startblock = lastTx.blockNumber;
    i += 1;
    transactions = transactions.filter(tx => tx.hash !== lastTx.hash);
    allTransactions.push(...transactions)
    console.log('---------------------------');
  }

  // for (var j = 300; j < 315; j++) {
  //   console.log(j);
  //   console.log(`https://etherscan.io/tx/${allTransactions[j].hash}`);
  //   console.log(allTransactions[j]);
  // }

  let allWallets = [];
  allTransactions.forEach(tx => {
    allWallets.push(tx.from);
    allWallets.push(tx.to);
  });
  allWallets = [...new Set(allWallets)];
  return allWallets;
}


async function getEtherscanData(tokenAddress) {

  // TODO:
  // 1. collect all wallets in a unique array
  // 2. get pnl of all wallets
  // 3. rank them

  const allWallets = await getWallets(tokenAddress);

  console.log(allWallets[0]);

  // allWallets.forEach(wallet => {
  //   console.log(wallet);
  // });


}


getEtherscanData(tokenAddress);
