const axios = require('axios');
const addresses = require(`../addresses.js`);
const etherscanApiKey = "I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG";
const argv = require('minimist')(process.argv.slice(2));


async function getUserPortfolio(participation, erc20InfoObj ) {
  let current = {};
  const participationErc20 = participation.filter(o => o.type === 'erc20');
  console.log(`Getting ${participationErc20.length} portfolio Erc20 infos...`);
  for (let i = 0; i < participationErc20.length; i++) {
    console.log(i+1);
    const { contractAddress, userAddresses } = participationErc20[i];
    for (let j = 0; j < userAddresses.length; j++) {
      if (!erc20InfoObj[contractAddress]) continue;
      const url = `
        https://api.etherscan.io/api
        ?module=account
        &action=tokenbalance
        &contractaddress=${contractAddress}
        &address=${userAddresses[j]}
        &tag=latest
        &apikey=${etherscanApiKey}
      `.replace(/\s/g, '');
      const tokenBalance = await axios.get(url).then(res => Number(res.data.result)/10**erc20InfoObj[contractAddress].decimals);
      const tokenInfo = erc20InfoObj[contractAddress];
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
          name: erc20InfoObj[contractAddress].name,
          address: contractAddress,
          totalCoin: tokenBalance,
          totalEth: totalEth,
          totalUsd: totalUsd
        }
      }
    }
  }

  const participationErc721 = participation.filter(o => o.type === 'erc721');
  console.log(participationErc721);
  current = Object.values(current).sort((a, b) => b.totalUsd - a.totalUsd);
  return current;
}

module.exports = {
    getUserPortfolio
}
