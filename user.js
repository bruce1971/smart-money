const axios = require('axios');
const argv = require('minimist')(process.argv.slice(2));
const addresses = require(`./addresses.js`);
const { parseTx } = require(`./transaction`);
const { accountUrl, blockUrl, formatActivityLog, secondsToBlocks, formatTimestamp, aggrPnl, formatPnl, getParticipation } = require(`./helper.js`);
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


async function getUser(userAddresses, contractAddress, daysAgo=null, quick=false) {
  console.time('USER');

  const secondsAgo = 3600 * 24 * daysAgo;
  let currentBlock = secondsAgo ? await axios.get(blockUrl(Math.floor(Date.now()/1000))).then(res => res.data.result) : null;
  const blocksAgo = secondsAgo ? secondsToBlocks(secondsAgo)+1 : null;

  let endblock = currentBlock ? currentBlock : 99999999;
  let startblock = currentBlock ? endblock - blocksAgo : 0;
  // startblock = 17710514
  // endblock = startblock

  let txArray = [];
  for (const userAddress of userAddresses) {
    const txArrayTemp = await txsForSingleAddress(userAddress, contractAddress, startblock, endblock, quick);
    txArray = txArray.concat(txArrayTemp);
  };

  let participation = getParticipation(txArray);
  // participation = participation.filter(o => o.type === 'erc721');

  const erc20InfoObj = await getErc20Info(txArray);
  const erc721InfoObj = await getErc721Info(participation);

  txArray = filterContractAddress(txArray, contractAddress?.address);
  txArray = txArray.sort((b, a) => Number(b.timeStamp) - Number(a.timeStamp));

  const pnl = [];
  const activityLog = await getActivityLog(txArray, userAddresses, pnl, erc20InfoObj);

  const currentPortfolio = await getUserPortfolio(participation, erc20InfoObj, erc721InfoObj, userAddresses);
  const aPnl = aggrPnl(participation, currentPortfolio, pnl);

  console.timeEnd('USER');
  return {
    aPnl,
    activityLog,
    currentPortfolio,
    participation
  }
}


if (require.main === module) {
  (async () => {
    const user = await getUser(inputUserAddresses, inputContractAddress, inputDaysAgo, false);
    // formatActivityLog(user.activityLog, false, true);
    formatPnl(user.aPnl);
  })();
}


module.exports = {
  getUser,
  txsForSingleAddress,
  getActivityLog
}
