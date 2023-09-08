const axios = require('axios');
const addresses = require(`../addresses.js`);
const etherscanApiKey = "I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG";
const argv = require('minimist')(process.argv.slice(2));


async function getUserPortfolio(participation, tokenInfoObj ) {
  let current = {};
  participation = participation.filter(o => o.type === 'erc20');
  console.log(`Getting ${participation.length} portfolio token infos...`);
  for (var i = 0; i < participation.length; i++) {
    console.log(i+1);
    const { contractAddress, userAddresses } = participation[i];
    for (var j = 0; j < userAddresses.length; j++) {
      if (!tokenInfoObj[contractAddress]) continue;
      const url = `
        https://api.etherscan.io/api
        ?module=account
        &action=tokenbalance
        &contractaddress=${contractAddress}
        &address=${userAddresses[j]}
        &tag=latest&apikey=${etherscanApiKey}
      `.replace(/\s/g, '');
      const tokenBalance = await axios.get(url).then(res => Number(res.data.result)/10**tokenInfoObj[contractAddress].decimals);
      const tokenInfo = tokenInfoObj[contractAddress];
      const unitPriceEth = tokenInfo.priceEth;
      const unitPriceUsd = tokenInfo.priceUsd;
      const totalEth = unitPriceEth * tokenBalance || 0;
      const totalUsd = unitPriceUsd * tokenBalance || 0;
      if (current[contractAddress]) {
        current[contractAddress].totalCoin += tokenBalance;
        current[contractAddress].totalEth += totalEth;
        current[contractAddress].totalUsd += totalUsd;
      } else {
        current[contractAddress] = {
          name: tokenInfoObj[contractAddress].name,
          address: contractAddress,
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
