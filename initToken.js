const axios = require('axios');
const basePath = process.cwd();
const { contractUrl, round } = require(`${basePath}/helper.js`);
const argv = require('minimist')(process.argv.slice(2));
const addresses = require(`${basePath}/addresses.js`);
const inputTokenAddress = addresses.inputA[argv.a];
const { getUserData, txsForSingleAddress } = require(`${basePath}/user.js`);
const { parseDecodedArray, parseTx } = require(`${basePath}/transaction.js`);




async function main(tokenAddress) {
  const txArray = await txsForSingleAddress(tokenAddress, null, 0, 99999999, 'asc');
  txArray.forEach(tx => {
    console.log(tx);
  });
}


if (require.main === module) main('0x6982508145454ce325ddbe47a25d4ec3d2311933');
