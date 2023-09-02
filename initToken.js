const axios = require('axios');
const basePath = process.cwd();
const { accountUrl, formatActivityLog, secondsToBlocks } = require(`${basePath}/helper.js`);
const { groupTransactions } = require(`./transaction/getTransactions.js`);
const { getActivityLog } = require(`./user.js`);
const { getErc20Info } = require(`./user/getErc20Info.js`);
const argv = require('minimist')(process.argv.slice(2));
const addresses = require(`${basePath}/addresses.js`);

const inputTokenAddress = argv.a ? addresses.inputA[argv.a] || ['0' + argv.a] : undefined;
const inputTokenStartblock = addresses.inputA[argv.a]?.startblock;
const inputTokenEndblock = addresses.inputA[argv.a]?.endblock;
const INITIAL_HOURS = 2;

async function main(tokenAddress) {

  const sort = 'asc';
  let startblock, endblock;
  let erc20ContractTransactions = await axios.get(accountUrl('tokentx', null, tokenAddress, startblock, endblock, sort)).then(res => {
    const txs = res.data.result;
    txs.forEach(tx => tx.type = 'erc20')
    return txs;
  });

  const firstTx = erc20ContractTransactions[0];
  startblock = Number(firstTx.blockNumber)
  endblock = startblock + secondsToBlocks(3600 * INITIAL_HOURS);
  console.log('startblock', startblock);
  console.log('endblock', endblock);

  // erc20ContractTransactions = erc20ContractTransactions.filter(o => Number(o.blockNumber) < endblock);
  erc20ContractTransactions = erc20ContractTransactions.slice(0, 50);

  const userTransactions = {};
  console.log('erc20ContractTransactions.length',erc20ContractTransactions.length);
  console.log('blocks scanning: ', endblock - startblock);
  for (var i = 0; i < erc20ContractTransactions.length; i++) {
    const userAddress = erc20ContractTransactions[i].to;
    console.log(`${i+1}/${erc20ContractTransactions.length}`);
    if (!userTransactions[userAddress]) {
      userTransactions[userAddress] = await axios.get(accountUrl('txlist', userAddress, tokenAddress, startblock, endblock, sort)).then(res => {
        const txs = res.data.result;
        txs.forEach(tx => tx.type = 'normal');
        return txs;
      });
    }
  }


  let normalTransactions = [];
  Object.values(userTransactions).forEach(txArr => { normalTransactions = [...normalTransactions, ...txArr]});
  let transactions = [...erc20ContractTransactions, ...normalTransactions];
  const txArray = groupTransactions(transactions, erc20ContractTransactions);

  const pnl = { address: tokenAddress, wethOut: 0, wethIn: 0, shitOut: 0, shitIn: 0 };
  const tokenInfoObj = await getErc20Info(txArray);
  let activityLog = await getActivityLog(txArray, tokenAddress, pnl, tokenInfoObj);
  // activityLog = activityLog.filter(a => ['buy', 'sell', 'swap'].includes(a.type));
  formatActivityLog(activityLog, true, true);
}

if (require.main === module) main(inputTokenAddress);
