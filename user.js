const axios = require('axios');
const argv = require('minimist')(process.argv.slice(2));
const basePath = process.cwd();
const addresses = require(`${basePath}/addresses.js`);
const { parseTx } = require(`${basePath}/transaction`);
const { accountUrl, blockUrl, formatActivityLog, formatPnl, secondsToBlocks } = require(`${basePath}/helper.js`);
const { txsForSingleAddress } = require(`./transaction/getTransactions.js`);

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


async function getErc20InfoObj(txArray){
  const tokenInfoObj = {};
  let addressArray = [];
  txArray.forEach(tx => {
    if (tx.txs.normal && tx.txs.erc20) addressArray.push(tx.txs.erc20.contractAddress);
  });
  addressArray.push('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'); // always get WETH
  addressArray = [...new Set(addressArray)];
  console.log(`Getting ${addressArray.length} tokenInfos..`);
  for (var i = 0; i < addressArray.length; i++) {
    console.log(i+1);
    // https://www.dextools.io/app/en/ether/pair-explorer/0x72e4f9f808c49a2a61de9c5896298920dc4eeea9
    const url = `https://api.ethplorer.io/getTokenInfo/${addressArray[i]}?apiKey=EK-4ryVp-8miebE7-m1Wmm`;
    const tokenInfo = await axios.get(url).then(res => res.data);
    tokenInfoObj[addressArray[i]] = {
      name: tokenInfo.name,
      totalSupply: Math.ceil(Number(tokenInfo.totalSupply)/10**Number(tokenInfo.decimals))
    }
  }
  return tokenInfoObj;
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


async function getUserData(userAddresses, contractAddress, secondsAgo=null) {
  console.time('USER');
  console.log('start');

  // secondsAgo = 3600 * 24 * 70;

  let currentBlock = secondsAgo ? await axios.get(blockUrl(Math.floor(Date.now()/1000))).then(res => res.data.result) : null;
  const blocksAgo = secondsAgo ? secondsToBlocks(secondsAgo)+1 : null;

  let endblock = currentBlock ? currentBlock : 99999999;
  let startblock = currentBlock ? endblock - blocksAgo : 0;
  // startblock = 17894626
  // endblock = 17894626

  let txArray = [];
  for (const userAddress of userAddresses) {
    const txArray1 = await txsForSingleAddress(userAddress, contractAddress, startblock, endblock);
    txArray = txArray.concat(txArray1);
  };
  console.log('done with getting tx data..');

  const tokenNames = []
  txArray.forEach(tx => {
    if (tx.txs.normal && tx.txs.erc20) tokenNames.push(tx.txs.erc20.tokenName);
    else if (tx.txs.normal && tx.txs.erc721) tokenNames.push(tx.txs.erc721.tokenName);
  });
  console.log('NAMES',[... new Set(tokenNames)]);

  const tokenInfoObj = await getErc20InfoObj(txArray);

  txArray = filterContractAddress(txArray, contractAddress?.address);
  txArray = txArray.sort((b, a) => Number(b.timeStamp) - Number(a.timeStamp));

  const pnl = { address: userAddresses, wethOut: 0, wethIn: 0, shitOut: 0, shitIn: 0 };
  let activityLog = getActivityLog(txArray, userAddresses, pnl, tokenInfoObj);
  activityLog = activityLog.filter(a => ['buy', 'sell', 'swap'].includes(a.type));

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
    getActivityLog,
    getErc20InfoObj
}
