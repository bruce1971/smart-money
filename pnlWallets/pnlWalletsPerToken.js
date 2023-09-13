const axios = require('axios');
const { contractUrl, roundSpec } = require(`../helper.js`);
const argv = require('minimist')(process.argv.slice(2));
const addresses = require(`../addresses.js`);
const { getUser } = require(`../user.js`);
const fs = require('fs/promises');
const path = `./data/pnl.json`;

const inputTokenAddress = addresses.inputA[argv.a];
const inputIsImmediate = argv.i === 'true';


async function getTokenWallets(tokenAddress) {
  console.log(`Fetching wallets...`);
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


async function savePnl(allPnl, contractPnls, tokenAddress) {
  allPnl = allPnl.sort((a, b) => b.profit - a.profit);
  formatPnlRanking(allPnl);
  contractPnls[tokenAddress.address] = allPnl;
  await fs.writeFile(path, JSON.stringify(contractPnls, null, 2), 'utf8');
}


async function getEtherscanData(tokenAddress, isImmediate=true) {
  console.log(isImmediate);
  console.time('TIME');
  const contractPnls = JSON.parse(await fs.readFile(path));

  let allWallets = await getTokenWallets(tokenAddress.address);
  allWallets = filterOutWallets(allWallets);

  let allPnl = [];
  const onlyNew = true;
  if (contractPnls[tokenAddress.address] && isImmediate) allPnl = contractPnls[tokenAddress.address];
  else if (contractPnls[tokenAddress.address] && onlyNew) {
    allPnl = contractPnls[tokenAddress.address];
    const existingWallets = allPnl.map(o => o.userAddresses[0]);
    for (var i = 0; i < 2000; i++) {
      console.log('----------');
      console.log(i);
      const selectedWallet = allWallets[i];
      if (!existingWallets.includes(selectedWallet)) {
        const user = await getUser([selectedWallet], tokenAddress, null, true);
        // FIXME: will scan every time users with no aPNL...
        if (user.aPnl[0]) allPnl.push(user.aPnl[0]);
      }
      if (i % 50 === 0) savePnl(allPnl, contractPnls, tokenAddress);
    }
  }
  else {
    for (var i = 0; i < 2000; i++) {
      console.log('----------');
      console.log(i);
      const userAddresses = [allWallets[i]];
      const user = await getUser(userAddresses, tokenAddress, null, true);
      if (user.aPnl[0]) allPnl.push(user.aPnl[0]);
      if (i % 10 === 0) savePnl(allPnl, contractPnls, tokenAddress);
    }
  }

  savePnl(allPnl, contractPnls, tokenAddress);
  allPnl = allPnl.sort((a, b) => b.roi - a.roi);
  formatPnlRanking(allPnl);
  console.timeEnd('TIME');
}


if (require.main === module) getEtherscanData(inputTokenAddress, inputIsImmediate);
