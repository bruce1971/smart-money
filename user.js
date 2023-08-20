const axios = require('axios');
const argv = require('minimist')(process.argv.slice(2));
const basePath = process.cwd();
const addresses = require(`${basePath}/addresses.js`);
const { parseTx } = require(`${basePath}/transaction.js`);
const { accountUrl, blockUrl, formatActivityLog, formatPnl, secondsToBlocks, groupTransactions } = require(`${basePath}/helper.js`);

const inputUserAddresses = addresses.inputU[argv.u];
const inputContractAddress = addresses.inputA[argv.a];


function filterContractAddress(array, contractAddress) {
  if (!contractAddress) return array;
  const finalArray = [];
  array.forEach(el => {
    const contractAddresses = Object.values(el.txs).map(x => x.contractAddress);
    if (contractAddresses.includes(contractAddress)) finalArray.push(el);
  });
  return finalArray;
}


async function txsForSingleAddress(address, contractAddress, startblock, endblock, sort='desc') {

  // shitcoin
  const erc20Transactions = ['erc20', undefined].includes(contractAddress?.type)
    ? await axios.get(accountUrl('tokentx', address, contractAddress?.address, startblock, endblock, sort)).then(res => {
      const txs = res.data.result;
      txs.forEach(tx => tx.type = 'erc20')
      return txs;
    }) : [];
  if (contractAddress?.type === 'erc20') {
    const blockNumbers = erc20Transactions.map(o => Number(o.blockNumber));
    startblock = Math.min(...blockNumbers);
    endblock = Math.max(...blockNumbers);
  }
  // shitcoin2
  const erc20ContractTransactions = false
    ? await axios.get(accountUrl('tokentx', null, address, startblock, startblock, sort)).then(res => {
      const txs = res.data.result;
      txs.forEach(tx => tx.type = 'erc20c')
      return txs;
    }) : [];
  // nft
  const erc721Transactions = false //['erc721', undefined].includes(contractAddress?.type)
    ? await axios.get(accountUrl('tokennfttx', address, contractAddress?.address, startblock, endblock, sort)).then(res => {
      const txs = res.data.result;
      txs.forEach(tx => tx.type = 'erc721')
      return txs;
    }) : [];
  // nft2
  const erc1155Transactions = false //['erc1155', undefined].includes(contractAddress?.type)
    ? await axios.get(accountUrl('token1155tx', address, contractAddress?.address, startblock, endblock, sort)).then(res => {
      const txs = res.data.result;
      txs.forEach(tx => tx.type = 'erc1155')
      return txs;
    }) : [];
  // nomral
  const normalTransactions = await axios.get(accountUrl('txlist', address, contractAddress?.address, startblock, endblock, sort)).then(res => {
    const txs = res.data.result;
    txs.forEach(tx => tx.type = 'normal');
    return txs;
  });
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
    ...erc20ContractTransactions,
    ...erc721Transactions,
    ...erc1155Transactions
  ];

  const txArray = groupTransactions(transactions, transactions);
  return txArray;
}

async function getTotalSupplyObj(txArray){
  const totalSupplyObj = {};
  let addressArray = [];
  txArray.forEach(tx => {
    if (tx.txs.erc20) addressArray.push(tx.txs.erc20.contractAddress);
  });
  addressArray = [...new Set(addressArray)];
  console.log(`Getting ${addressArray.length} tokenInfos..`);
  for (var i = 0; i < addressArray.length; i++) {
    console.log(i);
    // https://www.dextools.io/app/en/ether/pair-explorer/0x72e4f9f808c49a2a61de9c5896298920dc4eeea9
    const url = `https://api.ethplorer.io/getTokenInfo/${addressArray[i]}?apiKey=freekey`;
    const tokenInfo = await axios.get(url).then(res => res.data);
    await(new Promise((resolve) => {setTimeout(resolve, 600)})); // 0.6 sec timeout
    totalSupplyObj[addressArray[i]] = Math.ceil(Number(tokenInfo.totalSupply)/10**Number(tokenInfo.decimals));
  }
  return totalSupplyObj;
}


function getActivityLog(txArray, userAddresses, pnl, totalSupplyObj) {
  let activityLogArray = [];
  if (txArray.length > 0) {
    txArray.forEach(tx => {
      const activityLog = parseTx(tx, userAddresses, pnl, totalSupplyObj);
      if (activityLog) activityLogArray.push(activityLog);
    })
  } else console.log('No txs..');
  return activityLogArray;
}


async function getUserData(userAddresses, contractAddress, secondsAgo=null) {
  console.time('USER');
  console.log('start');

  secondsAgo = 3600 * 24 * 30;

  let currentBlock = secondsAgo ? await axios.get(blockUrl(Math.floor(Date.now()/1000))).then(res => res.data.result) : null;
  const blocksAgo = secondsAgo ? secondsToBlocks(secondsAgo)+1 : null;

  let endblock = currentBlock ? currentBlock : 99999999;
  let startblock = currentBlock ? endblock - blocksAgo : 0;
  // startblock = 17915951
  // endblock = 17915951

  let txArray = [];
  for (const userAddress of userAddresses) {
    const txArray1 = await txsForSingleAddress(userAddress, contractAddress, startblock, endblock);
    txArray = txArray.concat(txArray1);
  };
  console.log('done with getting data..');

  const totalSupplyObj = await getTotalSupplyObj(txArray);

  txArray = filterContractAddress(txArray, contractAddress?.address);
  txArray = txArray.sort((b, a) => Number(b.timeStamp) - Number(a.timeStamp));

  const pnl = { address: userAddresses, wethOut: 0, wethIn: 0, shitOut: 0, shitIn: 0 };
  const activityLog = getActivityLog(txArray, userAddresses, pnl, totalSupplyObj);

  pnl.wethFinal = pnl.wethIn - pnl.wethOut;
  pnl.shitFinal = pnl.shitIn - pnl.shitOut;
  const output = { pnl, activityLog };
  console.timeEnd('USER');
  return output;
}


if (require.main === module) {
  (async () => {
    const user = await getUserData(inputUserAddresses, inputContractAddress);
    formatActivityLog(user.activityLog, false, true);
    formatPnl(user.pnl);
  })();
}


module.exports = {
    getUserData,
    txsForSingleAddress,
    getActivityLog
}
