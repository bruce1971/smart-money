const axios = require('axios');
const { Web3 }  = require('web3');
const ethereumNodeUrl = 'https://mainnet.infura.io/v3/482599a22821425bae631e1031e90e7e';
const etherscanApiKey = 'I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG';
const web3 = new Web3(ethereumNodeUrl);
const chainId = 1;
const fs = require('fs/promises');
const path = `./infura/data/db1.json`;
const { blockOfInterest } = require(`./config.js`);
const MINT_TOPIC = '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f'
const DEPOSIT_TOPIC = '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c'
const PAIR_CREATED_TOPIC = '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'


// Function to fetch token creation transactions
async function getTradingLaunch(contractAddress) {

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
    console.log(tx);
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

    let response = await axios.get(url).then(res => res.data.result.find(o => o.transactionHash === addLiquidityTxHash));
    console.log(response);
    console.log('Pair Address',response?.address);
  }
}


if (require.main === module) {
  (async () => {
    getTradingLaunch('0xaaeE1A9723aaDB7afA2810263653A34bA2C21C7a');
  })();
}
