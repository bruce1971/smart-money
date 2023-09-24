const axios = require('axios');
const { Web3 }  = require('web3');
const ethereumNodeUrl = 'https://mainnet.infura.io/v3/482599a22821425bae631e1031e90e7e';
const etherscanApiKey = 'I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG';
const web3 = new Web3(ethereumNodeUrl);
const chainId = 1;


// Function to fetch the latest block number
async function getLatestBlockNumber() {
  return Number(await web3.eth.getBlockNumber());
}


// Function to fetch token creation transactions
async function getTokenCreationTransactions(fromBlock, toBlock) {
  try {
    const response = await axios.get(`https://api.etherscan.io/api`, {
      params: {
        module: 'logs',
        action: 'getLogs',
        fromBlock: fromBlock,
        toBlock: toBlock,
        topic0: '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0', // ERC-20 contract creation topic
        apiKey: etherscanApiKey,
      },
    });
    const filteredResult = response.data.result.filter(o => o.topics[1] === '0x0000000000000000000000000000000000000000000000000000000000000000');

    const formattedResult = filteredResult.map(o => ({
      contractAddress: o.address,
      ownerAddress: o.topics[2].replace('000000000000000000000000',''),
      transactionHash: o.transactionHash
    }));

    console.log('response.data.result', formattedResult);

    return formattedResult;
  } catch (error) {
    console.error('Error fetching token creation transactions:', error);
  }
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
    return addLiquidityTransactions;
  } catch (error) {
    console.error('Error fetching token creation transactions:', error);
  }
}


async function intervalExecute(fromBlock, toBlock) {
  // const creationTransactions = await getTokenCreationTransactions(fromBlock, toBlock);
  const tradingLaunchTransactions = await getTradingLaunch(fromBlock, toBlock);
}


// Main function to monitor new token launches
async function monitorTokenLaunches() {
  const currentBlock = await getLatestBlockNumber();
  console.log('Current block number:', currentBlock);
  const creationTransactions = await intervalExecute(
    currentBlock - 50,
    currentBlock + 50
  );

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
