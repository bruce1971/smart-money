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


// Main function to monitor new token launches
async function monitorTokenLaunches() {
  const currentBlock = await getLatestBlockNumber();
  console.log('Current block number:', currentBlock);

  let lastProcessedBlock = currentBlock;

  setInterval(async () => {
    const newBlock = await getLatestBlockNumber();

    if (newBlock > lastProcessedBlock) {
      const creationTransactions = await getTokenCreationTransactions(
        lastProcessedBlock + 1,
        newBlock
      );

      if (creationTransactions.length > 0) {
        console.log('New token(s) launched!');
        console.log('Creation transactions:', creationTransactions);
      }

      lastProcessedBlock = newBlock;
    }
  }, 10000); // Check for new blocks every 60 seconds
}


// Start monitoring new token launches
// monitorTokenLaunches();
// const n = 18172865;
const n = 18205661;
getTokenCreationTransactions(n-1, n+100);
