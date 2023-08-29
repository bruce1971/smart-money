const axios = require('axios');

async function getErc20Info(txArray){
  const tokenInfoObj = {};

  let addressArray = [];
  txArray.forEach(tx => {
    if (tx.txs.normal && tx.txs.erc20) addressArray.push(tx.txs.erc20.contractAddress);
  });
  addressArray.push('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'); // always get WETH
  addressArray = [...new Set(addressArray)];

  // GET SUPPLY INFO
  console.log(`Getting ${addressArray.length} ERC20 token infos..`);
  for (var i = 0; i < addressArray.length; i++) {
    console.log(i+1);
    const url = `https://api.ethplorer.io/getTokenInfo/${addressArray[i]}?apiKey=EK-4ryVp-8miebE7-m1Wmm`;
    const tokenInfo = await axios.get(url).then(res => res.data);
    tokenInfoObj[addressArray[i]] = {
      name: tokenInfo.name,
      totalSupply: Math.ceil(Number(tokenInfo.totalSupply)/10**Number(tokenInfo.decimals)),
      decimals: Number(tokenInfo.decimals)
    }
  }

  // GET PRICE INFO
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
      await new Promise(resolve => setTimeout(resolve, 10000));
      for (let i = 0; i < contractAddresses10.length; i++) {
        const dexUrl2 = `https://api.dexscreener.com/latest/dex/tokens/${contractAddresses10[i]}`;
        console.log(i);
        const tokenPriceInfo1 = await axios.get(dexUrl2).then(res => res.data.pairs);
        if (tokenPriceInfo1) tokenPriceInfos.push(...tokenPriceInfo1)
      }
    }
  }
  tokenPriceInfos = tokenPriceInfos.filter(o => o.quoteToken.symbol === 'WETH');
  for (let i = 0; i < contractAddresses.length; i++) {
    const info = tokenPriceInfos.filter(o => o.baseToken.address.toLowerCase() === contractAddresses[i].toLowerCase());
    tokenInfoObj[contractAddresses[i]].priceEth = info[0] ? Number(info[0].priceNative) : 0;
    tokenInfoObj[contractAddresses[i]].priceUsd = info[0] ? Number(info[0].priceUsd) : 0;
    tokenInfoObj[contractAddresses[i]].mcapUsd = tokenInfoObj[contractAddresses[i]].priceUsd * tokenInfoObj[contractAddresses[i]].totalSupply;
  }

  return tokenInfoObj;
}

module.exports = {
    getErc20Info
}
