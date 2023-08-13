const axios = require('axios');
const basePath = process.cwd();
const { contractUrl } = require(`${basePath}/helper.js`);
const argv = require('minimist')(process.argv.slice(2));
const addresses = require(`${basePath}/addresses.js`);
const inputTokenAddress = addresses.inputA[argv.a];
const { getUserData } = require(`${basePath}/user.js`);


async function getTokenWallets(tokenAddress) {
  let i = 0;
  let txLength = 1;
  let startblock = 0;
  const allTransactions = [];
  while(i < 1) {
  // while(txLength > 0) {
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

  let allWallets = [];
  allTransactions.forEach(tx => {
    allWallets.push(tx.from);
    allWallets.push(tx.to);
  });
  allWallets = [...new Set(allWallets)];
  return allWallets;
}


function formatPnlRanking(allPnl) {
  allPnl.forEach((pnl, i) => {
    console.log('--------------------------------------------------------');
    console.log(`${i+1}. +${pnl.wethFinal} eth ${pnl.address}`);
  });
}


async function getEtherscanData(tokenAddress) {
  console.time('TIME');

  const allWallets = await getTokenWallets(tokenAddress.address);

  let allPnl = [];
  for (var i = 100; i < 200; i++) {
    console.log(i);
    const userAddresses = [allWallets[i]];
    const pnl = await getUserData(userAddresses, tokenAddress);
    allPnl.push(pnl);
  }

  allPnl = allPnl.sort((a, b) => b.wethFinal - a.wethFinal);
  formatPnlRanking(allPnl);

  console.timeEnd('TIME');
}


getEtherscanData(inputTokenAddress);
