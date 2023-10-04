const axios = require('axios');
const { Web3 }  = require('web3');
const ethereumNodeUrl = 'https://mainnet.infura.io/v3/482599a22821425bae631e1031e90e7e';
const etherscanApiKey = 'I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG';
const web3 = new Web3(ethereumNodeUrl);
const chainId = 1;
const fs = require('fs/promises');
const path = `./infura/data/db1.json`;
const { blockOfInterest } = require(`./config.js`);


module.exports = {
  main
}


// Function to fetch the latest block number
async function getLatestBlockNumber() {
  return Number(await web3.eth.getBlockNumber());
}


// Function to fetch token creation transactions
async function getTradingLaunch(fromBlock, toBlock) {
  try {
    const responseDeposit = await axios.get(`https://api.etherscan.io/api`, {
      params: {
        module: 'logs',
        action: 'getLogs',
        fromBlock: fromBlock,
        toBlock: toBlock,
        topic0: '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c',
        apiKey: etherscanApiKey,
      },
    });
    const depositTransactionHashes = responseDeposit.data.result.map(o => o.transactionHash);
    if (depositTransactionHashes.length >= 1000) {
      process.exit(1);
      console.log('STOOOP - too big interval for Depost!!');
    }

    const responseCreatePair = await axios.get(`https://api.etherscan.io/api`, {
      params: {
        module: 'logs',
        action: 'getLogs',
        fromBlock: fromBlock,
        toBlock: toBlock,
        topic0: '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9',
        apiKey: etherscanApiKey,
      },
    });
    const createPairTransactionHashes = responseCreatePair.data.result.map(o => o.transactionHash);
    if (createPairTransactionHashes.length >= 1000) {
      process.exit(1);
      console.log('STOOOP - too big interval for Create Pair!!');
    }

    const responseMint = await axios.get(`https://api.etherscan.io/api`, {
      params: {
        module: 'logs',
        action: 'getLogs',
        fromBlock: fromBlock,
        toBlock: toBlock,
        topic0: '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f',
        apiKey: etherscanApiKey,
      },
    });
    const mintTransactionHashes = responseMint.data.result.map(o => o.transactionHash);
    if (mintTransactionHashes.length >= 1000) {
      process.exit(1);
      console.log('STOOOP - too big interval for Create Pair!!');
    }


    const addLiquidityTransactions = responseCreatePair.data.result.filter(o => depositTransactionHashes.includes(o.transactionHash));
    if (addLiquidityTransactions.length >= 1000) console.log('STOOOP - too big interval!!');

    const formattedResult = addLiquidityTransactions.map(o => ({
      contractAddress: o.topics.filter(el => el.toLowerCase() != '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')[1].replace('000000000000000000000000','').toLowerCase(),
      pairAddress: o.data.replace('000000000000000000000000',''). slice(0, 42).toLowerCase(),
      transactionHash: o.transactionHash,
      blockNumber: Number(o.blockNumber),
      timeStamp: Number(o.timeStamp),
    }));
    return formattedResult;
  } catch (error) {
    console.error('Error fetching token creation transactions:', error);
  }
}


async function gecko(contractAddress){
  const url = `https://api.geckoterminal.com/api/v2/networks/eth/tokens/${contractAddress}?include=top_pools`;
  const info = await axios.get(url).then(res => res.data).catch(e => null);
  return info.data.attributes;
}


async function main(fromBlock, toBlock) {
  console.log(`main: ${fromBlock} - ${toBlock}`);
  const transactions = await getTradingLaunch(fromBlock, toBlock);
  const db1 = JSON.parse(await fs.readFile(path));
  for (let i = 0; i < transactions.length; i++) {
    const tokenInfo = await gecko(transactions[i].contractAddress);
    transactions[i].name = tokenInfo.name;
    transactions[i].decimals = tokenInfo.decimals;
    transactions[i].totalSupply = Math.ceil( Number(tokenInfo.total_supply) / (10 ** tokenInfo.decimals) );
    db1[transactions[i].contractAddress] = transactions[i];
  }
  await fs.writeFile(path, JSON.stringify(db1, null, 2), 'utf8');
  console.log(transactions);
  return transactions;
}


// Main function to monitor new token launches
async function monitorTokenLaunches() {
  const currentBlock = await getLatestBlockNumber();
  console.log('Current block number:', currentBlock);
  // for (let i = 10; i >= 0; i--) {
  //   const transactions = await main(currentBlock-(i+1)*10, 1+currentBlock-i*10);
  // }

  let lastProcessedBlock = currentBlock;
  setInterval(async () => {
    const newBlock = await getLatestBlockNumber();
    if (newBlock > lastProcessedBlock) {
      const creationTransactions = await main(
        lastProcessedBlock + 1,
        newBlock
      );
      lastProcessedBlock = newBlock;
    }
  }, 30000); // Check for new blocks every 60 seconds
}


if (require.main === module) {
  (async () => {
    // monitorTokenLaunches();
    main(blockOfInterest-5, blockOfInterest+5);
  })();
}
