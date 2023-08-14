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
  const shitInEth = 0.00000000097097; //pepe
  const ethInUsd = 1850;

  const pnlFormat = {... pnl};

  const shitFinalInEth = pnl.shitFinal * shitInEth;
  const pnlInEth = shitFinalInEth + pnl.wethFinal;
  const pnlInUsd = pnlInEth * ethInUsd;

  pnlFormat.wethFinal = formatValue(pnlFormat.wethFinal, 0);
  pnlFormat.wethFinalInUsd = formatValue(pnlFormat.wethFinal * ethInUsd, 0);
  pnlFormat.shitFinal = formatValue(pnlFormat.shitFinal, 0);
  pnlFormat.shitFinalInUsd = formatValue(shitFinalInEth * ethInUsd, 0);

  pnlFormat.pnlInEth = formatValue(pnlInEth, 0);
  pnlFormat.pnlInUsd = formatValue(pnlInUsd, 0);

  pnlFormat.wethOut = formatValue(pnlFormat.wethOut, 0);
  pnlFormat.wethIn = formatValue(pnlFormat.wethIn, 0);
  pnlFormat.shitOut = formatValue(pnlFormat.shitOut, 0);
  pnlFormat.shitIn = formatValue(pnlFormat.shitIn, 0);

  console.log('=================================')
  console.log(`ETH invested --> ${pnlFormat.wethOut} eth`);
  console.log(`ETH taken out --> ${pnlFormat.wethIn} eth`);
  console.log(`Shitcoins bought --> ${pnlFormat.shitIn}`);
  console.log(`Shitcoins sold --> ${pnlFormat.shitOut}`);
  console.log('---');
  console.log(`ETH PnL --> ${pnlFormat.wethFinal > 0 ? '+' : ''}${pnlFormat.wethFinal} eth ($${pnlFormat.wethFinalInUsd})`);
  console.log(`Shitcoin PnL --> ${pnlFormat.shitFinal > 0 ? '+' : ''}${pnlFormat.shitFinal} ($${pnlFormat.shitFinalInUsd})`);
  console.log('---');
  console.log(`PnL --> ${pnlInUsd > 0 ? '+' : ''}$${pnlFormat.pnlInUsd}`);
  console.log('=================================')
}


async function txsForSingleAddress(address, contractAddress) {

  let startblock = 0, endblock = 99999999;
  // shitcoin
  const erc20Transactions = ['erc20', undefined].includes(contractAddress?.type) ?
    await axios.get(accountUrl('tokentx', address, contractAddress?.address)).then(res => {
      const txs = res.data.result;
      txs.forEach(tx => tx.type = 'erc20')
      return txs;
    }) : [];
  if (contractAddress?.type === 'erc20') {
    const blockNumbers = erc20Transactions.map(o => Number(o.blockNumber));
    startblock = Math.min(...blockNumbers);
    endblock = Math.max(...blockNumbers);
  }
  console.log('erc20', erc20Transactions.length);
  // nft
  const erc721Transactions = ['erc721', undefined].includes(contractAddress?.type)
    ? await axios.get(accountUrl('tokennfttx', address, contractAddress?.address)).then(res => {
      const txs = res.data.result;
      txs.forEach(tx => tx.type = 'erc721')
      return txs;
    }) : [];
  // nft2
  const erc1155Transactions = ['erc1155', undefined].includes(contractAddress?.type)
    ? await axios.get(accountUrl('token1155tx', address, contractAddress?.address)).then(res => {
      const txs = res.data.result;
      txs.forEach(tx => tx.type = 'erc1155')
      return txs;
    }) : [];
  // nomral
  const normalTransactions = await axios.get(accountUrl('txlist', address, contractAddress?.address, startblock, endblock)).then(res => {
    const txs = res.data.result;
    txs.forEach(tx => tx.type = 'normal');
    return txs;
  });
  console.log('normal', normalTransactions.length);
  // smart contract interaction
  const internalTransactions = false
    ? await axios.get(accountUrl('txlistinternal', address, contractAddress?.address, startblock, endblock)).then(res => {
      const txs = res.data.result;
      txs.forEach(tx => tx.type = 'internal')
      return txs;
    }) : [];

  let transactions = [
    ...normalTransactions,
    ...internalTransactions,
    ...erc20Transactions,
    ...erc721Transactions,
    ...erc1155Transactions
  ];

  // group txs together via hash
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
  console.time('USER');
  let txArray = [];
  for (const userAddress of userAddresses) {
    const txArray1 = await txsForSingleAddress(userAddress, contractAddress);
    txArray = txArray.concat(txArray1);
  };
  // console.log('tx count1', txArray.length);

  if (transactionHash) txArray = txArray.filter(el => el.hash === transactionHash)
  txArray = filterContractAddress(txArray, contractAddress?.address);
  txArray = txArray.sort((b, a) => Number(b.timeStamp) - Number(a.timeStamp));
  // console.log('tx count2', txArray.length);

  const pnl = { address: userAddresses, wethOut: 0, wethIn: 0, shitOut: 0, shitIn: 0 };
  if (txArray.length > 0) {
    txArray.forEach(async tx => {
      const activityLog = await parseTx(tx, userAddresses, pnl);
      if (inputUserAddresses) console.log(activityLog);
    })
  }
  else console.log('NO TRANSACTIONS FOUND...!');

  pnl.wethFinal = pnl.wethIn - pnl.wethOut;
  pnl.shitFinal = pnl.shitIn - pnl.shitOut;
  if (inputUserAddresses) formatPnl(pnl);
  console.timeEnd('USER');
  return pnl;
}


if (inputUserAddresses) {
  getUserData(inputUserAddresses, inputContractAddress, inputTransactionHash);
}


module.exports = {
    getUserData: getUserData
}
