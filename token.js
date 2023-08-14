const axios = require('axios');
const basePath = process.cwd();
const { contractUrl, round } = require(`${basePath}/helper.js`);
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
  const formattedPnl = allPnl.map(o => ({
    address: o.address[0],
    profit: round(o.wethFinal, 2)
  }));
  console.table(formattedPnl);
  console.log(JSON.stringify(formattedPnl));
}


function filterOutWallets(allWallets) {
  return allWallets.filter(w => !['0x000000', '0x111111'].some(substring => w.includes(substring)));
}


async function getEtherscanData(tokenAddress) {
  console.time('TIME');

  let allWallets = await getTokenWallets(tokenAddress.address);
  allWallets = filterOutWallets(allWallets);

  let allPnl = [];
  for (var i = 0; i < 500; i++) {
    console.log('----------');
    console.log(i);
    const userAddresses = [allWallets[i]];
    console.log(allWallets[i]);
    const pnl = await getUserData(userAddresses, tokenAddress);
    allPnl.push(pnl);
  }

  allPnl = allPnl.sort((a, b) => b.wethFinal - a.wethFinal);
  formatPnlRanking(allPnl);

  console.timeEnd('TIME');
}


getEtherscanData(inputTokenAddress);
