const axios = require('axios');
const etherscanApiKey = "I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG";

module.exports = {
    getCurrent
}

async function getCurrent(userAddresses, pnl, tokenInfoObj, activityLog) {
  const address = userAddresses[0];
  console.log(address);
  const contractAddresses = Object.keys(tokenInfoObj);
  console.log(contractAddresses);
  for (var i = 0; i < contractAddresses.length; i++) {
    const url = `
      https://api.etherscan.io/api
       ?module=account
       &action=tokenbalance
       &contractaddress=${contractAddresses[i]}
       &address=${address}
       &tag=latest&apikey=${etherscanApiKey}
    `.replace(/\s/g, '');
    console.log('------------');
    console.log(tokenInfoObj[contractAddresses[i]].name);
    const tokenBalance = await axios.get(url).then(res => Number(res.data.result));
    console.log(tokenBalance);
    const url2 = `https://api.dexscreener.com/latest/dex/tokens/${contractAddresses[i]}`;
    console.log(url2);
    const tokenPriceInfo = await axios.get(url2).then(res => {
      return res.data.pairs ? res.data.pairs[0] : null;
    });
    const unitPriceEth = Number(tokenPriceInfo?.priceNative);
    console.log(unitPriceEth);
    const unitPriceUsd = Number(tokenPriceInfo?.priceUsd);
    console.log(unitPriceUsd);

    const totalEth = unitPriceEth * tokenBalance;
    console.log('totalEth', totalEth);
    const totalUsd = unitPriceUsd * tokenBalance;
    console.log('totalUsd', totalUsd);
  }
  return 'yooooo';
}
