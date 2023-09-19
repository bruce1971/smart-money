const axios = require('axios');
const { contractUrl, roundSpec } = require(`../helper.js`);
const argv = require('minimist')(process.argv.slice(2));
const addresses = require(`../addresses.js`);
const { getUser } = require(`../user.js`);
const fs = require('fs/promises');
const path = `./data/pnl.json`;

const inputTokenAddress = argv.a ? addresses.inputA[argv.a] || { address: '0' + argv.a } : undefined;
const inputIsImmediate = argv.i === 'true';


async function getWallets(tokenAddress, isImmediate=true) {
  console.log(`Fetching wallets...`);
  let i = 0;
  let txLength = 10000;
  let startblock = 0;
  const allTransactions = [];
  let maxLoops = 5;
  if (isImmediate) maxLoops = 1;

  while(txLength >= 10000 && i < maxLoops) {
    let transactions = await axios.get(contractUrl(startblock, tokenAddress)).then(res => res.data.result);
    txLength = transactions.length;
    const firstTx = transactions[0];
    console.log('first', firstTx.blockNumber);
    const lastTx = transactions[transactions.length - 1];
    console.log('last', lastTx.blockNumber);
    startblock = lastTx.blockNumber;
    i += 1;
    transactions = transactions.filter(tx => tx.hash !== lastTx.hash);
    allTransactions.push(...transactions);
    console.log(txLength);
    console.log('--------------');
  }

  let allWallets = [];
  allTransactions.forEach(tx => {
    allWallets.push(tx.from);
    allWallets.push(tx.to);
  });
  allWallets = [...new Set(allWallets)];
  allWallets = allWallets.filter(w => !['0x000000', '0x111111'].some(substring => w.includes(substring)));
  console.log(`Fetched ${allWallets.length} wallets...!`);
  return allWallets;
}


function formatPnlRanking(contractPnl) {
  contractPnl = contractPnl.slice(0, 50);
  const formattedPnl = contractPnl.map(o => ({
    'Wallet': o.userAddress,
    'Profit (eth)': roundSpec(o.profit),
    'ROI (x)': roundSpec(o.roi),
    'Put In (eth)': roundSpec(-o.buy),
    'Taken Out (eth)': roundSpec(o.sell),
    'Holding (eth)': roundSpec(o.current),
  }));
  console.table(formattedPnl);
}


async function savePnl(contractPnl, allPnl, tokenAddress) {
  contractPnl = contractPnl.sort((a, b) => b.profit - a.profit);
  formatPnlRanking(contractPnl);
  allPnl[tokenAddress.address] = contractPnl;
  await fs.writeFile(path, JSON.stringify(allPnl, null, 2), 'utf8');
}


function getTop100Wallets(contractPnl) {
  const profitArray = contractPnl.map(o => o.profit).sort((b,a) => b-a > 0);
  const profitLimit = profitArray.length >= 100 ? profitArray[99] : profitArray[profitArray-1];
  const constractPnl100 = contractPnl.filter(o => o.profit >= profitLimit);
  return constractPnl100;
}


async function getEtherscanData(tokenAddress, isImmediate=true) {
  console.time('TIME');
  const allPnl = JSON.parse(await fs.readFile(path));



  let allWallets = await getWallets(tokenAddress.address, isImmediate);
  // console.log('scribbs?', allWallets.includes('0x70399b85054dd1d94f2264afc8704a3ee308abaf'));

  // CASE 1: refresh top 100
  // CASE 2: refresh everything
  // CASE 3: refresh only new ones
  // CASE 3: display storage


  let contractPnl = [];
  const saveEvery = 20;
  if (allPnl[tokenAddress.address]) {
    contractPnl = allPnl[tokenAddress.address];
    const top100Pnl = getTop100Wallets(contractPnl);
    console.log(top100Pnl);
    if (!isImmediate) {
      const alreadySavedWallets = [... new Set(contractPnl.map(o => o.userAddress).flat(1))];
      for (let i = 0; i < allWallets.length; i++) {
        console.log('----------');
        console.log(i);
        const selectedWallet = allWallets[i];
        if (!alreadySavedWallets.includes(selectedWallet)) {
          const user = await getUser([selectedWallet], tokenAddress, null, true);
          // FIXME: will scan every time users with no aPNL...
          if (user.aPnl[0]) contractPnl.push(user.aPnl[0]);
        }
        if (i % saveEvery === 0 && i > 0) savePnl(contractPnl, allPnl, tokenAddress);
      }
    }
  }
  else {
    for (let i = 0; i < allWallets.length; i++) {
      console.log('----------');
      console.log(i);
      const userAddress = allWallets[i];
      const user = await getUser(userAddress, tokenAddress, null, true);
      if (user.aPnl[0]) contractPnl.push(user.aPnl[0]);
      if (i % saveEvery === 0 && i > 0) savePnl(contractPnl, allPnl, tokenAddress);
    }
  }

  savePnl(contractPnl, allPnl, tokenAddress);
  contractPnl = contractPnl.sort((a, b) => b.roi - a.roi);
  formatPnlRanking(contractPnl);
  console.timeEnd('TIME');
}


if (require.main === module) getEtherscanData(inputTokenAddress, inputIsImmediate);
