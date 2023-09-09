const axios = require('axios');
const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'.toLowerCase();
const fs = require('fs/promises');
const path = `./user/erc20.json`;


async function refreshErc20(){
  const tokenInfoObj = JSON.parse(await fs.readFile(path));
  const addressArray = Object.keys(tokenInfoObj);
  console.log(addressArray.length);

  console.log(`Getting ${addressArray.length} ERC20 token infos..`);
  for (var i = 0; i < addressArray.length; i++) {

    const address = addressArray[i].toLowerCase();
    const pauseSeconds = 5;
    await new Promise(resolve => setTimeout(resolve, pauseSeconds * 1000));
    const url = `https://api.geckoterminal.com/api/v2/networks/eth/tokens/${address}?include=top_pools`;
    const tokenInfo = await axios.get(url).then(res => res.data).catch(e => null);
    if (!tokenInfo) {
      tokenInfoObj[address] = {
        name: null,
        address: address,
        totalSupply: null,
        decimals: null,
        priceEth: null,
        priceUsd: null
      };
      continue;
    }
    const info = tokenInfo.data.attributes;
    const name = info.name === 'Wrapped Ether' ? 'ETH' : info.name;
    const decimals = info.decimals;
    const totalSupply = Math.ceil( Number(info.total_supply) / (10 ** decimals) );
    const priceInfo = tokenInfo.included[0]?.attributes;
    let priceUsd = 0;
    let priceEth = 0;
    if (priceInfo && Number(priceInfo.volume_usd.h24) > 0) {
      if (Number(priceInfo.base_token_price_native_currency) === 1 && address !== WETH_ADDRESS) { // if base is not WETH but other pair is WETH
        priceUsd = Number(priceInfo.quote_token_price_usd);
        priceEth = Number(priceInfo.quote_token_price_native_currency);
      } else {
        priceUsd = Number(priceInfo.base_token_price_usd);
        priceEth = Number(priceInfo.base_token_price_native_currency);
      }
    }
    console.log(i+1, name);
    tokenInfoObj[address] = {
      name,
      address,
      totalSupply,
      decimals,
      priceEth,
      priceUsd
    }
    if (i % 10 === 0 && i > 0) {
      console.log('temp saving...!');
      await fs.writeFile(path, JSON.stringify(tokenInfoObj, null, 2), 'utf8');
    }
  }

  // to finish
  await fs.writeFile(path, JSON.stringify(tokenInfoObj, null, 2), 'utf8');
  return tokenInfoObj;
}


(async () => {
  await refreshErc20();
})();
