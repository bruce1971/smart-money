const axios = require('axios');
const basePath = process.cwd();
const { accountUrl, formatActivityLog, secondsToBlocks, groupTransactions } = require(`${basePath}/helper.js`);
const { getActivityLog, getTokenInfoObj } = require(`${basePath}/user.js`);
const argv = require('minimist')(process.argv.slice(2));
const addresses = require(`${basePath}/addresses.js`);

const inputTokenAddress = addresses.inputA[argv.a].address;
const inputTokenStartblock = addresses.inputA[argv.a].startblock;
const inputTokenEndblock = addresses.inputA[argv.a].endblock;

async function main(tokenAddress) {

  const sort = 'asc';
  let startblock, endblock;
  if (inputTokenStartblock && inputTokenEndblock) {
    startblock = inputTokenStartblock;
    endblock = inputTokenEndblock;
  }

  console.log('startblock', startblock);
  console.log('endblock', endblock);
  let responseLength = 10000;
  let lastTxBlock = 0;
  let erc20ContractTransactions = [];

  while (10000 <= responseLength) {
    let newTransactions = await axios.get(accountUrl('tokentx', null, tokenAddress, startblock, endblock, sort)).then(res => {
      const txs = res.data.result;
      txs.forEach(tx => tx.type = 'erc20')
      return txs;
    });
    responseLength = newTransactions.length;
    console.log('responseLength', responseLength);
    erc20ContractTransactions = [...erc20ContractTransactions, ...newTransactions];
    startblock = Number(erc20ContractTransactions[erc20ContractTransactions.length - 1].blockNumber) + 1;
    console.log('newStartblock', startblock);
  }


  erc20ContractTransactions = erc20ContractTransactions.filter(o => Number(o.blockNumber) < endblock);

  const userTransactions = {};
  let userAddresses = [];
  console.log('erc20ContractTransactions.length',erc20ContractTransactions.length);
  console.log('blocks scanning: ', endblock - startblock);
  for (var i = 0; i < erc20ContractTransactions.length; i++) {
    const userAddress = erc20ContractTransactions[i].to;
    // console.log('Blocks remaining: ', endblock - Number(erc20ContractTransactions[i].blockNumber));
    // console.log(userAddress);
    userAddresses.push(userAddress);
    // if (!userTransactions[userAddress]) {
    //   userTransactions[userAddress] = await axios.get(accountUrl('txlist', userAddress, tokenAddress, startblock, endblock, sort)).then(res => {
    //     const txs = res.data.result;
    //     txs.forEach(tx => tx.type = 'normal');
    //     return txs;
    //   });
    // }
  }
  userAddresses = [... new Set(userAddresses)];
  // console.log(JSON.stringify(userAddresses));
  console.log(userAddresses.length);

  // let normalTransactions = [];
  // Object.values(userTransactions).forEach(txArr => { normalTransactions = [...normalTransactions, ...txArr]});
  // let transactions = [...erc20ContractTransactions, ...normalTransactions];
  // const txArray = groupTransactions(transactions, erc20ContractTransactions);
  //
  // const pnl = { address: tokenAddress, wethOut: 0, wethIn: 0, shitOut: 0, shitIn: 0 };
  // const tokenInfoObj = await getTokenInfoObj(txArray);
  // let activityLog = await getActivityLog(txArray, tokenAddress, pnl, tokenInfoObj);
  // // activityLog = activityLog.filter(a => ['buy', 'sell', 'swap'].includes(a.type));
  // formatActivityLog(activityLog, true, true);
  // const userArray = [... new Set(activityLog.map(a => a.userWallet))];
  // console.log(userArray);
}

if (require.main === module) main(inputTokenAddress);
