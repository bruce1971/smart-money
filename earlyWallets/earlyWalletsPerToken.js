  const axios = require('axios');
const basePath = process.cwd();
const { accountUrl } = require(`../helper.js`);
const argv = require('minimist')(process.argv.slice(2));
const addresses = require(`../addresses.js`);
const fs = require('fs/promises');
const path = `./earlyWallets/wallets.json`;

const inputTokenAddress = addresses.inputA[argv.a].address;
const inputTokenStartblock = addresses.inputA[argv.a].startblock;
const inputTokenEndblock = addresses.inputA[argv.a].endblock;

async function main(tokenAddress) {
  tokenAddress = tokenAddress.toLowerCase();

  const sort = 'asc';
  let startblock, endblock;
  if (inputTokenStartblock && inputTokenEndblock) {
    startblock = inputTokenStartblock;
    endblock = inputTokenEndblock;
  }

  let responseLength = 10000;
  let erc20ContractTransactions = [];

  while (10000 <= responseLength) {
    let newTransactions = await axios.get(accountUrl('tokentx', null, tokenAddress, startblock, endblock, sort)).then(res => {
      const txs = res.data.result;
      txs.forEach(tx => tx.type = 'erc20')
      return txs;
    });
    responseLength = newTransactions.length;
    erc20ContractTransactions = [...erc20ContractTransactions, ...newTransactions];
    startblock = Number(erc20ContractTransactions[erc20ContractTransactions.length - 1].blockNumber) + 1;
    console.log('newStartblock', startblock);
  }

  let userAddresses = [];
  console.log('transactions:',erc20ContractTransactions.length);
  erc20ContractTransactions.forEach(tx => userAddresses.push(tx.to.toLowerCase())); // FIXME: and from?
  userAddresses = [... new Set(userAddresses)];

  const wallets = JSON.parse(await fs.readFile(path));
  wallets[tokenAddress] = userAddresses;
  await fs.writeFile(path, JSON.stringify(wallets, null, 2), 'utf8');
  // console.log(JSON.stringify(userAddresses));
  console.log('wallets:', userAddresses.length);
}

if (require.main === module) main(inputTokenAddress);
