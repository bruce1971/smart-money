const axios = require('axios');
const addresses = require(`../addresses.js`);
const etherscanApiKey = "I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG";
const argv = require('minimist')(process.argv.slice(2));


async function getUserPortfolio(userAddresses, tokenInfoObj) {
  const contractAddresses = Object.keys(tokenInfoObj);
  let current = {};
  for (var j = 0; j < userAddresses.length; j++) {
    const address = userAddresses[j];
    console.log(`Getting address balance info for ${address}. Scanning ${contractAddresses.length} tokens...`);
    for (var i = 0; i < contractAddresses.length; i++) {
      console.log(i+1);
      const url = `
        https://api.etherscan.io/api
        ?module=account
        &action=tokenbalance
        &contractaddress=${contractAddresses[i]}
        &address=${address}
        &tag=latest&apikey=${etherscanApiKey}
      `.replace(/\s/g, '');
      const tokenBalance = await axios.get(url).then(res => Number(res.data.result)/10**tokenInfoObj[contractAddresses[i]].decimals);
      const tokenPriceInfo = tokenInfoObj[contractAddresses[i]];
      const unitPriceEth = tokenPriceInfo.priceEth;
      // const unitPriceEth = tokenPriceInfo?.baseToken.symbol !== 'WETH' ? Number(tokenPriceInfo?.priceNative) : 1;
      const unitPriceUsd = tokenPriceInfo.priceUsd;
      const totalEth = unitPriceEth * tokenBalance || 0;
      const totalUsd = unitPriceUsd * tokenBalance || 0;
      if (current[contractAddresses[i]]) {
        current[contractAddresses[i]].totalCoin += tokenBalance;
        current[contractAddresses[i]].totalEth += totalEth;
        current[contractAddresses[i]].totalUsd += totalUsd;
      } else {
        current[contractAddresses[i]] = {
          name: tokenInfoObj[contractAddresses[i]].name,
          address: contractAddresses[i],
          totalCoin: tokenBalance,
          totalEth: totalEth,
          totalUsd: totalUsd
        }
      }
    }
  }
  current = Object.values(current).sort((a, b) => b.totalUsd - a.totalUsd);
  return current;
}

module.exports = {
    getUserPortfolio
}
