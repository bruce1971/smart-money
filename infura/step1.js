const axios = require('axios');
const { Web3 }  = require('web3');
const ethereumNodeUrl = 'https://mainnet.infura.io/v3/482599a22821425bae631e1031e90e7e';
const etherscanApiKey = 'I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG';
const web3 = new Web3(ethereumNodeUrl);
const chainId = 1;
const fs = require('fs/promises');
const path = `./infura/data/ca.json`;


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
      ownerAddress: o.data,
      contractAddress: o.topics.filter(el => el.toLowerCase() != '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')[1].replace('000000000000000000000000',''),
      transactionHash: o.transactionHash,
      blockNumber: o.blockNumber,
      timeStamp: o.timeStamp,
    }));
    return formattedResult;
  } catch (error) {
    console.error('Error fetching token creation transactions:', error);
  }
}


async function intervalExecute(fromBlock, toBlock) {
  const transactions = await getTradingLaunch(fromBlock, toBlock);
  const ca = JSON.parse(await fs.readFile(path));
  transactions.forEach(tx => ca[tx.contractAddress] = tx);
  await fs.writeFile(path, JSON.stringify(ca, null, 2), 'utf8');
  console.log(transactions);
  return transactions;
}


// Main function to monitor new token launches
async function monitorTokenLaunches() {
  const currentBlock = await getLatestBlockNumber();
  console.log('Current block number:', currentBlock);
  for (let i = 10; i >= 0; i--) {
    const transactions = await intervalExecute(currentBlock-(i+1)*10, 1+currentBlock-i*10);
  }

  // let lastProcessedBlock = currentBlock;
  // setInterval(async () => {
  //   const newBlock = await getLatestBlockNumber();
  //   if (newBlock > lastProcessedBlock) {
  //     const creationTransactions = await intervalExecute(
  //       lastProcessedBlock + 1,
  //       newBlock
  //     );
  //     lastProcessedBlock = newBlock;
  //   }
  // }, 10000); // Check for new blocks every 60 seconds
}


// Start monitoring new token launches
monitorTokenLaunches();
// const n = 18172865;
// intervalExecute(n-50, n+50);
