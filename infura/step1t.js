const axios = require('axios');
const { Web3 }  = require('web3');
const ethereumNodeUrl = 'https://mainnet.infura.io/v3/482599a22821425bae631e1031e90e7e';
const etherscanApiKey = 'I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG';
const web3 = new Web3(ethereumNodeUrl);
const fs = require('fs/promises');
const path = `./infura/data/db1.json`;
const { contractAddressOfInterest } = require(`./config.js`);
const MINT_TOPIC = '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f'
const DEPOSIT_TOPIC = '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c'
const PAIR_CREATED_TOPIC = '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'


module.exports = {
  main
}


async function gecko(contractAddress){
  const url = `https://api.geckoterminal.com/api/v2/networks/eth/tokens/${contractAddress}?include=top_pools`;
  const info = await axios.get(url).then(res => res.data).catch(e => null);
  return info.data.attributes;
}


async function main(contractAddress) {

  // 1) get creator address
  let creatorObject = await axios.get(`
   https://api.etherscan.io/api
    ?module=contract
    &action=getcontractcreation
    &contractaddresses=${contractAddress}
    &apikey=${etherscanApiKey}
  `.replace(/\s/g, '')).then(res => res.data.result[0]);
  console.log(creatorObject);

  // 2) get liq supply block
  let normalObject = await axios.get(`
    https://api.etherscan.io/api
     ?module=account
     &action=txlist
     &address=${creatorObject.contractCreator}
     &startblock=0
     &endblock=99999999
     &apikey=${etherscanApiKey}
  `.replace(/\s/g, '')).then(res => res.data.result);
  const liquidityTxs = normalObject.filter(o => o.functionName.includes('addLiquidity'));

  if (liquidityTxs.length > 0) {
    const tx = liquidityTxs[0];
    const addLiquidityTxHash = tx.hash;
    const addLiquidityBlock = Number(tx.blockNumber);
    console.log('addLiquidityBlock', addLiquidityBlock);

    // 3) get liq pair address
    const url = `
      https://api.etherscan.io/api
      ?module=logs
      &action=getLogs
      &fromBlock=${addLiquidityBlock},
      &toBlock=${addLiquidityBlock},
      &topic0=${MINT_TOPIC}
      &apikey=${etherscanApiKey}
    `.replace(/\s/g, '');

    let logObject = await axios.get(url).then(res => res.data.result.find(o => o.transactionHash === addLiquidityTxHash));

    const finalObject = {
      contractAddress: contractAddress,
      pairAddress: logObject.address,
      transactionHash: logObject.transactionHash,
      blockNumber: Number(logObject.blockNumber),
      timeStamp: Number(logObject.timeStamp),
    }

    const db1 = JSON.parse(await fs.readFile(path));
    const tokenInfo = await gecko(contractAddress);
    finalObject.name = tokenInfo.name;
    finalObject.decimals = tokenInfo.decimals;
    finalObject.totalSupply = Math.ceil( Number(tokenInfo.total_supply) / (10 ** tokenInfo.decimals) );
    console.log(finalObject);

    db1[contractAddress] = finalObject;
    await fs.writeFile(path, JSON.stringify(db1, null, 2), 'utf8');
    return finalObject;
  }
}


if (require.main === module) {
  (async () => {
    main(contractAddressOfInterest);
  })();
}
