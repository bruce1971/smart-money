const axios = require('axios');
const { contractUrl, roundSpec } = require(`../helper.js`);
const argv = require('minimist')(process.argv.slice(2));
const addresses = require(`../addresses.js`);
const inputTokenAddress = addresses.inputA[argv.a];
const { getUser } = require(`../user.js`);


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
    'Wallet': o.userAddresses[0],
    'Profit (eth)': roundSpec(o.profit),
    'ROI (x)': roundSpec(o.roi),
    'Put In (eth)': roundSpec(-o.buy),
    'Taken Out (eth)': roundSpec(o.sell),
    'Holding (eth)': roundSpec(o.current),
  }));
  console.table(formattedPnl);
}


function filterOutWallets(allWallets) {
  return allWallets.filter(w => !['0x000000', '0x111111'].some(substring => w.includes(substring)));
}


async function getEtherscanData(tokenAddress) {
  console.time('TIME');

  let allWallets = await getTokenWallets(tokenAddress.address);
  allWallets = filterOutWallets(allWallets);

  let allPnl = [];
  for (var i = 0; i < 2000; i++) {
    console.log('----------');
    console.log(i);
    const userAddresses = [allWallets[i]];
    const user = await getUser(userAddresses, tokenAddress, null, true);
    if (user.aPnl[0]) allPnl.push(user.aPnl[0]);
    if (i % 50 === 0) {
      allPnl = allPnl.sort((a, b) => b.profit - a.profit);
      formatPnlRanking(allPnl);
      allPnl = allPnl.sort((a, b) => b.roi - a.roi);
      formatPnlRanking(allPnl);
    }
  }

  allPnl = allPnl.sort((a, b) => b.profit - a.profit);
  formatPnlRanking(allPnl);
  allPnl = allPnl.sort((a, b) => b.roi - a.roi);
  formatPnlRanking(allPnl);

  console.timeEnd('TIME');
}


if (require.main === module) getEtherscanData(inputTokenAddress);
