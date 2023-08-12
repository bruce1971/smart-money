const axios = require('axios');
const argv = require('minimist')(process.argv.slice(2));
const basePath = process.cwd();
const addresses = require(`${basePath}/addresses.js`);
const { parseDecodedArray, parseTx } = require(`${basePath}/transaction.js`);
const { accountUrl, formatValue } = require(`${basePath}/helper.js`);


const inputUserAddresses = addresses.inputU[argv.u];
const inputContractAddress = addresses.inputA[argv.a];
const inputTransactionHash = addresses.inputH[argv.h];


function filterContractAddress(array, contractAddress) {
  if (!contractAddress) return array;
  const finalArray = [];
  array.forEach(el => {
    const contractAddresses = Object.values(el.txs).map(x => x.contractAddress);
    if (contractAddresses.includes(contractAddress)) finalArray.push(el);
  });
  return finalArray;
}


function formatPnl(pnl) {
  // const shitInEth = 0.00002254; //bitcoin
  const shitInEth = 0.00000000097097; //pepe
  const ethInUsd = 1850;

  const wethFinal = pnl.wethIn - pnl.wethOut;
  pnl.wethFinal = formatValue(wethFinal, 0);
  pnl.wethFinalInUsd = formatValue(wethFinal * ethInUsd, 0);

  const shitFinal = pnl.shitIn - pnl.shitOut;
  pnl.shitFinal = formatValue(shitFinal, 0);
  const shitFinalInEth = shitFinal * shitInEth;
  pnl.shitFinalInUsd = formatValue(shitFinalInEth * ethInUsd, 0);

  const pnlInEth = shitFinalInEth + wethFinal;
  const pnlInUsd = pnlInEth * ethInUsd;
  pnl.pnlInEth = formatValue(pnlInEth, 0);
  pnl.pnlInUsd = formatValue(pnlInUsd, 0);

  pnl.wethOut = formatValue(pnl.wethOut, 0);
  pnl.wethIn = formatValue(pnl.wethIn, 0);
  pnl.shitOut = formatValue(pnl.shitOut, 0);
  pnl.shitIn = formatValue(pnl.shitIn, 0);

  console.log('=================================')
  console.log(`ETH invested --> ${pnl.wethOut} eth`);
  console.log(`ETH taken out --> ${pnl.wethIn} eth`);
  console.log(`Shitcoins bought --> ${pnl.shitIn}`);
  console.log(`Shitcoins sold --> ${pnl.shitOut}`);
  console.log('---');
  console.log(`ETH PnL --> ${pnl.wethFinal > 0 ? '+' : ''}${pnl.wethFinal} eth ($${pnl.wethFinalInUsd})`);
  console.log(`Shitcoin PnL --> ${pnl.shitFinal > 0 ? '+' : ''}${pnl.shitFinal} ($${pnl.shitFinalInUsd})`);
  console.log('---');
  console.log(`PnL --> ${pnlInUsd > 0 ? '+' : ''}$${pnl.pnlInUsd}`);
  console.log('=================================')
}


async function txsForSingleAddress(address) {
  const normalTransactions = await axios.get(accountUrl('txlist', address)).then(res => {
    const txs = res.data.result;
    txs.forEach(tx => tx.type = 'normal');
    return txs;
  });
  const internalTransactions = await axios.get(accountUrl('txlistinternal', address)).then(res => {
    const txs = res.data.result;
    txs.forEach(tx => tx.type = 'internal')
    return txs;
  });
  const erc20Transactions = await axios.get(accountUrl('tokentx', address)).then(res => {
    const txs = res.data.result;
    txs.forEach(tx => tx.type = 'erc20')
    return txs;
  });
  const erc721Transactions = await axios.get(accountUrl('tokennfttx', address)).then(res => {
    const txs = res.data.result;
    txs.forEach(tx => tx.type = 'erc721')
    return txs;
  });
  const erc1155Transactions = await axios.get(accountUrl('token1155tx', address)).then(res => {
    const txs = res.data.result;
    txs.forEach(tx => tx.type = 'erc1155')
    return txs;
  });

  let transactions = [
    ...normalTransactions,
    ...internalTransactions,
    ...erc20Transactions,
    ...erc721Transactions,
    ...erc1155Transactions
  ];

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

  return txArray;
}


async function getUserData(userAddresses, contractAddress, transactionHash=null) {
  let txArray = [];
  for (const userAddress of userAddresses) {
    const txArray1 = await txsForSingleAddress(userAddress);
    txArray = txArray.concat(txArray1);
  };

  if (transactionHash) txArray = txArray.filter(el => el.hash === transactionHash)
  txArray = filterContractAddress(txArray, contractAddress);
  txArray = txArray.sort((b, a) => Number(b.timeStamp) - Number(a.timeStamp));

  const pnl = { wethOut: 0, wethIn: 0, shitOut: 0, shitIn: 0 }
  if (txArray.length > 0) txArray.forEach(tx => parseTx(tx, userAddresses, pnl));
  else console.log('NO TRANSACTIONS FOUND...!');
  formatPnl(pnl);
}


if (inputUserAddresses) {
  getUserData(inputUserAddresses, inputContractAddress, inputTransactionHash);
}


module.exports = {
    getUserData: getUserData
}
