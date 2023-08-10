const axios = require('axios');
const basePath = process.cwd();
const { contractUrl, formatTimestamp } = require(`${basePath}/helper.js`);
const argv = require('minimist')(process.argv.slice(2));
const addresses = require(`${basePath}/addresses.js`);
const tokenAddress = addresses.inputA[argv.a];


async function getEtherscanData() {
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

  console.log(allWallets);
  console.log(allWallets.length);


  // TODO:
  // 1. collect all wallets in a unique array
  // 2. get pnl of all wallets
  // 3. rank them

}


getEtherscanData()




// function mode(arr){
//     return arr.sort((a,b) =>
//           arr.filter(v => v===a).length
//         - arr.filter(v => v===b).length
//     ).pop();
// }

// const txHashes = allTransactions.map(tx => tx.hash);
// const modeHash = mode(txHashes);
// console.log(modeHash);
// console.log(allTransactions.filter(tx => tx.hash === modeHash));
// const txHashes2 = [...new Set(txHashes)];
// console.log(txHashes.length);
// console.log(txHashes2.length);

// if (transactions.length > 0) {
//   const first = transactions[0];
//   formatTimestamp(first.timeStamp);
//   console.log(`https://etherscan.io/tx/${first.hash}`);
//   console.log('first',first);
//
//   const last = transactions[transactions.length - 1];
//   formatTimestamp(last.timeStamp);
//   console.log(`https://etherscan.io/tx/${last.hash}`);
//   console.log('last',last);
//
//   console.log(transactions.length);
// } else { console.log('NO TRANSACTIONS') }
