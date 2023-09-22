const axios = require('axios');
const { contractUrl, secondsToBlocks, formatActivityLog } = require(`../helper.js`);
const argv = require('minimist')(process.argv.slice(2));
const addresses = require(`../addresses.js`);
const { getUser } = require(`../user.js`);

const inputTokenAddress = addresses.inputA[argv.a].address;


async function main(contractAddress) {
  let transactions = await axios.get(contractUrl(contractAddress)).then(res => res.data.result);
  const firstTx = transactions[0];
  const lastBlock = Number(firstTx.blockNumber) + secondsToBlocks(60 * 30);
  transactions = transactions.filter(tx => Number(tx.blockNumber) < lastBlock)
  const wallets = [... new Set(transactions.map(tx => tx.to))];
  let activityArray = [];
  console.log('wallets.length', wallets.length);
  for (let i = 0; i < wallets.length; i++) {
    console.log(i);
    const user = await getUser(wallets[i], { address: contractAddress }, null, true);
    activityArray.push(user.activityLog);
  }
  activityArray = activityArray.flat(1);
  activityArray = activityArray.filter(a => a.block <= lastBlock);
  activityArray = activityArray.sort((a,b) => a.block - b.block);
  formatActivityLog(activityArray, true, true, false);
}

if (require.main === module) main(inputTokenAddress);
