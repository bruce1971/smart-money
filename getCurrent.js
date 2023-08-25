const axios = require('axios');
const etherscanApiKey = "I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG";

module.exports = {
    getCurrent
}

async function getCurrent(userAddresses, pnl, tokenInfoObj, activityLog) {
  let current = [];
  for (var j = 0; j < userAddresses.length; j++) {
    const address = userAddresses[j];
    const contractAddresses = Object.keys(tokenInfoObj);
    console.log(`getting current portfolio. scanning ${contractAddresses.length} coins...`);
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
      const url2 = `https://api.dexscreener.com/latest/dex/tokens/${contractAddresses[i]}`;
      const tokenPriceInfo = await axios.get(url2).then(res => {
        return res.data.pairs ? res.data.pairs[0] : null;
      });
      const unitPriceEth = tokenPriceInfo?.baseToken.symbol !== 'WETH' ? Number(tokenPriceInfo?.priceNative) : 1;
      const unitPriceUsd = Number(tokenPriceInfo?.priceUsd);
      const totalEth = unitPriceEth * tokenBalance || 0;
      const totalUsd = unitPriceUsd * tokenBalance || 0;
      current.push({
        name: tokenInfoObj[contractAddresses[i]].name,
        contractAddress: contractAddresses[i],
        totalCoin: tokenBalance,
        totalEth: totalEth,
        totalUsd: totalUsd
      })
    }
  }
  current = current.sort((a, b) => b.totalUsd - a.totalUsd)
  return current;
}
