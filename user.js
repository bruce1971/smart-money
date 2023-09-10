const axios = require('axios');
const argv = require('minimist')(process.argv.slice(2));
const addresses = require(`./addresses.js`);
const { parseTx } = require(`./transaction`);
const { accountUrl, blockUrl, formatActivityLog, secondsToBlocks, formatTimestamp, finalPnl } = require(`./helper.js`);
const { getUserPortfolio } = require(`./user/getUserPortfolio.js`);
const { getErc20Info } = require(`./user/getErc20Info.js`);
const { getErc721Info } = require(`./user/getErc721Info.js`);
const { txsForSingleAddress } = require(`./transaction/getTransactions.js`);

const inputUserAddresses = argv.u ? addresses.inputU[argv.u] || ['0' + argv.u] : undefined;
const inputContractAddress = argv.a ? addresses.inputA[argv.a] || { address: '0' + argv.a } : undefined;
const inputDaysAgo = argv.d ? Number(argv.d) : undefined;


function filterContractAddress(array, contractAddress) {
  if (!contractAddress) return array;
  const finalArray = [];
  array.forEach(el => {
    const contractAddresses = Object.values(el.txs).map(x => x.contractAddress);
    if (contractAddresses.includes(contractAddress)) finalArray.push(el);
  });
  return finalArray;
}


async function getActivityLog(txArray, userAddresses, pnl, erc20InfoObj) {
  let activityLogArray = [];
  if (txArray.length > 0) {
    for (let i = 0; i < txArray.length; i++) {
      const activityLog = await parseTx(txArray[i], userAddresses, pnl, erc20InfoObj);
      if (activityLog) activityLogArray.push(activityLog);
    }
  } else console.log('No txs..');
  return activityLogArray;
}


function getParticipation(txArray) {
  txArray = txArray.sort((a,b) => Number(b.timeStamp) - Number(a.timeStamp));
  let participation = {};
  txArray.forEach(tx => {
    if (tx.txs.normal && tx.txs.erc20) {
      const contractAddress = tx.txs.erc20.contractAddress
      if (participation[contractAddress]) participation[contractAddress].userAddresses.push(tx.userWallet);
      else participation[contractAddress] = {...tx.txs.erc20, userAddresses: [tx.userWallet]};
      participation[contractAddress].userAddresses = [...new Set(participation[contractAddress].userAddresses)]
    }
    else if (tx.txs.normal && tx.txs.erc721) {
      const contractAddress = tx.txs.erc721.contractAddress
      if (participation[contractAddress]) participation[contractAddress].userAddresses.push(tx.userWallet);
      else participation[contractAddress] = {...tx.txs.erc721, userAddresses: [tx.userWallet]};
      participation[contractAddress].userAddresses = [...new Set(participation[contractAddress].userAddresses)]
    }
    else if (tx.txs.normal && tx.txs.erc1155) {
      const contractAddress = tx.txs.erc1155.contractAddress
      if (participation[contractAddress]) participation[contractAddress].userAddresses.push(tx.userWallet);
      else participation[contractAddress] = {...tx.txs.erc1155, userAddresses: [tx.userWallet]};
      participation[contractAddress].userAddresses = [...new Set(participation[contractAddress].userAddresses)]
    }
  });
  participation = Object.values(participation);
  participation = participation.sort((a,b) => Number(b.timeStamp) - Number(a.timeStamp));
  participation = participation.map(o => ({
    tokenName: o.tokenName,
    type: o.type,
    ago: formatTimestamp(o.timeStamp),
    contractAddress: o.contractAddress,
    userAddresses: o.userAddresses,
    aTxHash: `https://etherscan.io/tx/${o.hash}`
  }))
  const displayFormatted = false;
  if (displayFormatted) {
    const participationErc20 = participation.filter(o => o.type === 'erc20')
    console.log('========================================= SHITCOIN ============================================');
    participationErc20.forEach(o => console.log(o));
    const participationErc721 = participation.filter(o => o.type === 'erc721')
    console.log('============================================ NFT ==============================================');
    participationErc721.forEach(o => console.log(o));
    const participationErc1155 = participation.filter(o => o.type === 'erc1155')
    console.log('========================================== NIFTY ==============================================');
    participationErc1155.forEach(o => console.log(o));
  }
  return participation;
}


async function getUserData(userAddresses, contractAddress, daysAgo=null) {
  console.time('USER');

  const secondsAgo = 3600 * 24 * daysAgo;
  let currentBlock = secondsAgo ? await axios.get(blockUrl(Math.floor(Date.now()/1000))).then(res => res.data.result) : null;
  const blocksAgo = secondsAgo ? secondsToBlocks(secondsAgo)+1 : null;

  let endblock = currentBlock ? currentBlock : 99999999;
  let startblock = currentBlock ? endblock - blocksAgo : 0;
  // startblock = 13610913
  // endblock = 13610913

  let txArray = [];
  for (const userAddress of userAddresses) {
    const txArray1 = await txsForSingleAddress(userAddress, contractAddress, startblock, endblock);
    txArray = txArray.concat(txArray1);
  };

  let participation = getParticipation(txArray);
  // const filterType = 'erc721';
  // participation = participation.filter(o => o.type === filterType);

  const erc20InfoObj = await getErc20Info(txArray);
  const erc721InfoObj = await getErc721Info(participation);

  txArray = filterContractAddress(txArray, contractAddress?.address);
  txArray = txArray.sort((b, a) => Number(b.timeStamp) - Number(a.timeStamp));

  const pnl = [];
  const activityLog = await getActivityLog(txArray, userAddresses, pnl, erc20InfoObj);

  const currentPortfolio = await getUserPortfolio(participation, erc20InfoObj, erc721InfoObj);

  console.timeEnd('USER');
  return {
    pnl,
    activityLog,
    currentPortfolio,
    participation
  }
}


if (require.main === module) {
  (async () => {
    const user = await getUserData(inputUserAddresses, inputContractAddress, inputDaysAgo);
    // formatActivityLog(user.activityLog, false, true);
    finalPnl(user.participation, user.currentPortfolio, user.pnl);
  })();
}


module.exports = {
  getUserData,
  txsForSingleAddress,
  getActivityLog
}
