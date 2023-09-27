const axios = require('axios');
const { Web3 }  = require('web3');
const ethereumNodeUrl = 'https://mainnet.infura.io/v3/482599a22821425bae631e1031e90e7e';
const etherscanApiKey = 'I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG';
const web3 = new Web3(ethereumNodeUrl);
const chainId = 1;
const fs = require('fs/promises');
const path = `./infura/data/db1.json`;


// Function to fetch the latest block number
async function getLatestBlockNumber() {
  return Number(await web3.eth.getBlockNumber());
}


// Function to fetch token creation transactions
async function getTradingLaunch(fromBlock, toBlock) {
  try {
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
    const addLiquidityTransactions = responseCreatePair.data.result.filter(o => depositTransactionHashes.includes(o.transactionHash));
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



async function intervalExecute(fromBlock, toBlock) {
  console.log(`intervalExecute: ${fromBlock} - ${toBlock}`);
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
  //   const transactions = await intervalExecute(currentBlock-(i+1)*10, 1+currentBlock-i*10);
  // }

  let lastProcessedBlock = currentBlock;
  setInterval(async () => {
    const newBlock = await getLatestBlockNumber();
    if (newBlock > lastProcessedBlock) {
      const creationTransactions = await intervalExecute(
        lastProcessedBlock + 1,
        newBlock
      );
      lastProcessedBlock = newBlock;
    }
  }, 30000); // Check for new blocks every 60 seconds
}


// monitorTokenLaunches();
const n = 18187248;
intervalExecute(n-50, n+50);
