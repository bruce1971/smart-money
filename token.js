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


async function getEtherscanData(tokenAddress) {
  console.time('TIME');

  const allWallets = await getTokenWallets(tokenAddress.address);

  for (var i = 100; i < 110; i++) {
    const userAddresses = [allWallets[i]];
    console.log(userAddresses);
    await getUserData(userAddresses, tokenAddress)
  }

  // await getUserData([ '0xf5c0cdb9e18a4af157fdd369540ec9f4912b5edf' ], tokenAddress)
  // await getUserData([ '0x1298652974068e0d3a7bcdd6e29d6409101833ac' ], tokenAddress)
  // await getUserData(['0x8e5ca1872062bee63b8a46493f6de36d4870ff88'], tokenAddress)
  console.timeEnd('TIME');
}


getEtherscanData(inputTokenAddress);


// WHAT CAN BE OPTIMIZED?
// 1. NUMBER OF WALLETS PNL CHECKED?
// 2. NUMBER OF REQUESTS PER WALLET
// 3. FILTER PARAMS ON EACH REQUEST
