const axios = require('axios');
const { contractUrl, roundSpec } = require(`../helper.js`);
const argv = require('minimist')(process.argv.slice(2));
const addresses = require(`../addresses.js`);
const { getUser } = require(`../user.js`);
const { refreshErc20 } = require(`../user/refreshErc20.js`);
const fs = require('fs/promises');
const path = `./data/pnl.json`;
const saveEvery = 20;

const inputTokenAddress = argv.a ? addresses.inputA[argv.a] || { address: '0' + argv.a } : undefined;
const inputToggle = argv.t ? Number(argv.t) : 1;


async function getWallets(contractAddress) {
  console.log(`Fetching wallets...`);
  let i = 0;
  let txLength = 10000;
  let startblock = 0;
  const allTransactions = [];
  let maxLoops = 1;

  while(txLength >= 10000 && i < maxLoops) {
    let transactions = await axios.get(contractUrl(startblock, contractAddress)).then(res => res.data.result);
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
  let contractPnlValues = Object.values(contractPnl);
  contractPnlValues = contractPnlValues.sort((a,b) => b.profit - a.profit).slice(0, 50);
  const formattedPnl = contractPnlValues.map(o => ({
    'Wallet': o.userAddress.slice(0,8),
    'Profit (eth)': roundSpec(o.profit),
    'ROI (x)': roundSpec(o.roi),
    'Put In (eth)': roundSpec(-o.buy),
    'Taken Out (eth)': roundSpec(o.sell),
    'Holding (eth)': roundSpec(o.current),
  }));
  console.table(formattedPnl);
}


async function savePnl(contractPnl, allPnl, contractAddress) {
  allPnl[contractAddress] = contractPnl;
  await fs.writeFile(path, JSON.stringify(allPnl, null, 2), 'utf8');
}


function getTopAddresses(contractPnl) {
  const n = 100;
  const profitArray = Object.values(contractPnl).map(o => o.profit).sort((b, a) => b > a);
  const profitLimit = profitArray.length >= n ? profitArray[n-1] : profitArray[profitArray.length-1];
  const constractTopPnl = Object.values(contractPnl).filter(o => o.profit >= profitLimit);
  const constractTopPnlAddresses = constractTopPnl.map(o => o.userAddress)
  return constractTopPnlAddresses;
}


async function pnlLoop(addressArray, contractObject, contractPnl, allPnl) {
  for (let i = 0; i < addressArray.length; i++) {
    console.log('----------');
    console.log(i);
    const user = await getUser(addressArray[i], contractObject, null, true);
    if (user.aPnl[0]) contractPnl[addressArray[i]] = user.aPnl[0];
    if (i % saveEvery === 0 && i > 0) savePnl(contractPnl, allPnl, contractObject.address);
  }
}




async function getPnl(contractObject, toggle=1) {
  console.time('TIME');

  // refreshing given contractAddress data
  if (contractObject.type === 'erc20') await refreshErc20(contractObject.address);

  // get stored pnls
  const allPnl = JSON.parse(await fs.readFile(path));
  let contractPnl = allPnl[contractObject.address] ? allPnl[contractObject.address] : {};

  // get wallets that participated in token/nft
  let allWallets = await getWallets(contractObject.address);
  // console.log('scribbs?', allWallets.includes('0x70399b85054dd1d94f2264afc8704a3ee308abaf'));

  // CASE 1: display storage
  if (toggle === 1) {
    console.log('case 1');
    console.log('just display...');
  }
  // CASE 2: refresh top addresses only
  else if (toggle === 2) {
    console.log('case 2');
    const topPnl = getTopAddresses(contractPnl);
    await pnlLoop(topPnl, contractObject, contractPnl, allPnl);
  }
  // CASE 3: refresh only new ones
  else if (toggle === 3) {
    console.log('case 3');
    const alreadySavedAddresses = Object.keys(contractPnl);
    const notSavedAddresses = allWallets.filter(a => !alreadySavedAddresses.includes(a));
    await pnlLoop(notSavedAddresses, contractObject, contractPnl, allPnl);
  }
  // CASE 4: refresh everything
  else if (toggle === 4) {
    console.log('case 4');
    await pnlLoop(allWallets, contractObject, contractPnl, allPnl);
  }

  savePnl(contractPnl, allPnl, contractObject.address);
  formatPnlRanking(contractPnl);
  console.timeEnd('TIME');
}


if (require.main === module) getPnl(inputTokenAddress, inputToggle);
