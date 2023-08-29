const axios = require('axios');
const addresses = require(`./addresses.js`);
const etherscanApiKey = "I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG";
const argv = require('minimist')(process.argv.slice(2));


async function getUserPortfolio(userAddresses, tokenInfoObj) {
  const contractAddresses = Object.keys(tokenInfoObj);

  let tokenPriceInfos = [];
  const contractAddressesReduceable = Object.keys(tokenInfoObj);
  while (contractAddressesReduceable.length > 0) {
    const contractAddresses10 = contractAddressesReduceable.splice(0, 8);
    const jointContractAddresses = contractAddresses10.join(",");
    console.log(`Getting price info for ${contractAddresses10.length} tokens...`);
    const dexUrl = `https://api.dexscreener.com/latest/dex/tokens/${jointContractAddresses}`;
    const tokenPriceInfo = await axios.get(dexUrl).then(res => res.data.pairs);
    console.log(tokenPriceInfo?.length);
    if (!tokenPriceInfo) continue;
    if (tokenPriceInfo?.length < 30) { // go all of them!
      tokenPriceInfos.push(...tokenPriceInfo)
    } else { // surely cut off some.. iterate over all
      await new Promise(resolve => setTimeout(resolve, 5000));
      for (let i = 0; i < contractAddresses10.length; i++) {
        const dexUrl2 = `https://api.dexscreener.com/latest/dex/tokens/${contractAddresses10[i]}`;
        console.log(i);
        const tokenPriceInfo1 = await axios.get(dexUrl2).then(res => res.data.pairs);
        if (tokenPriceInfo1) tokenPriceInfos.push(...tokenPriceInfo1)
      }
    }
  }

  tokenPriceInfos = tokenPriceInfos.filter(o => o.quoteToken.symbol === 'WETH');
  const tokenPriceInfoObj = {}
  for (let i = 0; i < contractAddresses.length; i++) {
    const info = tokenPriceInfos.filter(o => o.baseToken.address.toLowerCase() === contractAddresses[i].toLowerCase());
    tokenPriceInfoObj[contractAddresses[i]] = info[0] ? info[0] : null;
  }

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
      const tokenPriceInfo = tokenPriceInfoObj[contractAddresses[i]];
      const unitPriceEth = tokenPriceInfo?.baseToken.symbol !== 'WETH' ? Number(tokenPriceInfo?.priceNative) : 1;
      const unitPriceUsd = Number(tokenPriceInfo?.priceUsd);
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
