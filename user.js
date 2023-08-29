const axios = require('axios');
const argv = require('minimist')(process.argv.slice(2));
const addresses = require(`./addresses.js`);
const { parseTx } = require(`./transaction`);
const { accountUrl, blockUrl, formatActivityLog, secondsToBlocks, formatTimestamp, finalPnl } = require(`./helper.js`);
const { getUserPortfolio } = require(`./user/getUserPortfolio.js`);
const { getErc20Info } = require(`./user/getErc20Info.js`);
const { txsForSingleAddress } = require(`./transaction/getTransactions.js`);

const inputUserAddresses = addresses.inputU[argv.u];
const inputContractAddress = argv.a ? addresses.inputA[argv.a] || { address: '0' + argv.a } : undefined;


function filterContractAddress(array, contractAddress) {
  if (!contractAddress) return array;
  const finalArray = [];
  array.forEach(el => {
    const contractAddresses = Object.values(el.txs).map(x => x.contractAddress);
    if (contractAddresses.includes(contractAddress)) finalArray.push(el);
  });
  return finalArray;
}


function getActivityLog(txArray, userAddresses, pnl, tokenInfoObj) {
  let activityLogArray = [];
  if (txArray.length > 0) {
    txArray.forEach(tx => {
      const activityLog = parseTx(tx, userAddresses, pnl, tokenInfoObj);
      if (activityLog) activityLogArray.push(activityLog);
    })
  } else console.log('No txs..');
  return activityLogArray;
}


function getParticipation(txArray) {
  txArray = txArray.sort((a,b) => Number(b.timeStamp) - Number(a.timeStamp));
  let participation = {};
  txArray.forEach(tx => {
    if (tx.txs.normal && tx.txs.erc20) participation[tx.txs.erc20.contractAddress] = tx.txs.erc20;
    else if (tx.txs.normal && tx.txs.erc721) participation[tx.txs.erc721.contractAddress] = tx.txs.erc721;
    else if (tx.txs.normal && tx.txs.erc1155) participation[tx.txs.erc1155.contractAddress] = tx.txs.erc1155;
  });
  participation = Object.values(participation);
  participation = participation.sort((a,b) => Number(b.timeStamp) - Number(a.timeStamp));
  participation = participation.map(o => ({
    tokenName: o.tokenName,
    type: o.type,
    ago: formatTimestamp(o.timeStamp),
    contractAddress: o.contractAddress,
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


async function getUserData(userAddresses, contractAddress, secondsAgo=null) {

  secondsAgo = 3600 * 24 * 20;

  let currentBlock = secondsAgo ? await axios.get(blockUrl(Math.floor(Date.now()/1000))).then(res => res.data.result) : null;
  const blocksAgo = secondsAgo ? secondsToBlocks(secondsAgo)+1 : null;

  let endblock = currentBlock ? currentBlock : 99999999;
  let startblock = currentBlock ? endblock - blocksAgo : 0;
  // startblock = 11873602
  // endblock = 11873602

  let txArray = [];
  for (const userAddress of userAddresses) {
    const txArray1 = await txsForSingleAddress(userAddress, contractAddress, startblock, endblock);
    txArray = txArray.concat(txArray1);
  };

  const participation = getParticipation(txArray);

  const tokenInfoObj = await getErc20Info(txArray);

  txArray = filterContractAddress(txArray, contractAddress?.address);
  txArray = txArray.sort((b, a) => Number(b.timeStamp) - Number(a.timeStamp));

  const pnl = [];
  const activityLog = getActivityLog(txArray, userAddresses, pnl, tokenInfoObj);

  const currentPortfolio = await getUserPortfolio(userAddresses, tokenInfoObj);

  return {
    pnl,
    activityLog,
    currentPortfolio,
    participation
  }
}


if (require.main === module) {
  (async () => {
    const user = await getUserData(inputUserAddresses, inputContractAddress);
    formatActivityLog(user.activityLog, false, true);
    // console.log(user.currentPortfolio);
    // console.log(user.participation);
    finalPnl(user.participation, user.currentPortfolio, user.pnl);
  })();
}


module.exports = {
    getUserData,
    txsForSingleAddress,
    getActivityLog
}
