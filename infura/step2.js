const axios = require('axios');
const etherscanApiKey = 'I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG';
const fs = require('fs/promises');
const { mcapCalculator, logDecoder, round } = require(`./helper.js`);
const path_db1 = `./infura/data/db1.json`;
const path_db2 = `./infura/data/db2.json`;
const ObjectsToCsv = require('objects-to-csv');
const N_BLOCKS = 50000;
let blockIncr1 = 4000;
let blockIncr2 = 400;


async function getData1(contractObject, startBlock, endBlock) {
  let allData = [];
  let currentBlock = startBlock;
  while (currentBlock < endBlock) {
    console.log('====');
    console.log(`Blocks remaining: ${endBlock-currentBlock} (~${Math.ceil((endBlock-currentBlock)/blockIncr1)} loops)`);
    let erc20Transactions = await axios.get(`
      https://api.etherscan.io/api
       ?module=account
       &action=tokentx
       &contractaddress=${contractObject.contractAddress}
       &startblock=${currentBlock}
       &endblock=${currentBlock+blockIncr1}
       &sort=asc
       &apikey=${etherscanApiKey}
    `.replace(/\s/g, '')).then(res => {
      const txs = res.data.result;
      const final = [];
      txs.forEach(tx => final.push({
        blockNumber: tx.blockNumber,
        timeStamp: tx.timeStamp,
        hash: tx.hash,
        from: tx.from,
        contractAddress: tx.contractAddress,
        to: tx.to,
        value: tx.value,
        tokenName: tx.tokenName,
        tokenSymbol: tx.tokenSymbol,
        tokenDecimal: tx.tokenDecimal
      }))
      return final;
    });
    console.log(`Tx count: ${erc20Transactions.length}`);
    if (erc20Transactions.length >= 10000) {
      blockIncr1 = Math.ceil(blockIncr1/2);
      console.log(`DECREASING blockIncr1 to ${blockIncr1}`);
    } else {
      allData = allData.concat(erc20Transactions);
      // while loop incr
      currentBlock = currentBlock + blockIncr1 + 1;
      if (erc20Transactions.length < 2000) {
        blockIncr1 = Math.ceil(blockIncr1*2);
        console.log(`INCREASING blockIncr1 to ${blockIncr1}`);
      }
    }
  }
  return allData;
}


async function getData2(contractObject, startBlock, endBlock) {
  let swapsArray = [];
  let currentBlock = startBlock;
  while (currentBlock < endBlock) {
    console.log('====');
    console.log(`Blocks remaining: ${endBlock-currentBlock} (~${Math.ceil((endBlock-currentBlock)/blockIncr2)} loops)`);
    let responseSwap = await axios.get(`
      https://api.etherscan.io/api
      ?module=logs
      &action=getLogs
      &address=${contractObject.pairAddress}
      &fromBlock=${currentBlock}
      &toBlock=${currentBlock+blockIncr2}
      &topic0=0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822
      &apikey=${etherscanApiKey}
    `.replace(/\s/g, '')).then(res => {
      const txs = res.data.result;
      const final = [];
      txs.forEach(tx => final.push({
        blockNumber: Number(tx.blockNumber),
        timeStamp: Number(tx.timeStamp),
        hash: tx.transactionHash,
        address: tx.address,
        decoded: logDecoder(tx.data)
      }))
      return final;
    });
    console.log(`Tx count: ${responseSwap.length}`);
    if (responseSwap.length >= 1000) {
      blockIncr2 = Math.ceil(blockIncr2/2);
      console.log(`DECREASING blockIncr2 to ${blockIncr2}`);
    } else {
      // add eth & erc20 amounts
      if (responseSwap.length > 0) {
        const decoded0 = responseSwap[0].decoded;
        const ethIsAmount0 = mcapCalculator(decoded0[0] + decoded0[2], decoded0[1] + decoded0[3], contractObject.totalSupply, contractObject.decimals) < 10**12;
        responseSwap.forEach(o => {
          o.ethAmount = ethIsAmount0 ? o.decoded[0] + o.decoded[2] : o.decoded[1] + o.decoded[3];
          o.erc20Amount = ethIsAmount0 ? o.decoded[1] + o.decoded[3] : o.decoded[0] + o.decoded[2];
        });
      } else {
        responseSwap.forEach(o => {
          o.ethAmount = 0;
          o.erc20Amount = 0;
        });
      }
      swapsArray = swapsArray.concat(responseSwap);
      // while loop incr
      currentBlock = currentBlock + blockIncr2 + 1;

      if (responseSwap.length < 200) {
        blockIncr2 = Math.ceil(blockIncr2*2);
        console.log(`INCREASING blockIncr2 to ${blockIncr2}`);
      }
    }
  }
  return swapsArray;
}


function aggregateData(data1, data2, contractObject) {
  console.log('Aggregating data...');
  const aggrData = [];
  let allUserAddresses = [];
  const aggrSize = 5; //blocks
  let currentBlock = Number(data1[0].blockNumber);
  const endBlock = Number(data1[data1.length - 1].blockNumber);
  while (currentBlock < (endBlock - 1*aggrSize)) {
    // filter on subset of data1
    const subData1 = data1.filter(o => currentBlock <= Number(o.blockNumber) && Number(o.blockNumber) <= currentBlock + aggrSize);

    // compute newUserCount
    const toAddresses = [... new Set(subData1.map(tx => tx.to))];
    const fromAddresses = [... new Set(subData1.map(tx => tx.from))];
    let userAddresses = [...toAddresses, ...fromAddresses];
    userAddresses = userAddresses.filter(a => a !== contractObject.pairAddress);
    const prevAllUserCount = allUserAddresses.length;
    allUserAddresses = [... new Set([...allUserAddresses, ...userAddresses])];
    const newUserCount = allUserAddresses.length - prevAllUserCount;

    // compute buys & sells
    let buys = 0, sells = 0;
    subData1.forEach(o => {
      if (o.to === contractObject.pairAddress) sells += 1;
      if (o.from === contractObject.pairAddress) buys += 1;
    });

    // filter on subset of data2
    const subData2 = data2.filter(o => currentBlock <= Number(o.blockNumber) && Number(o.blockNumber) <= currentBlock + aggrSize);
    const mcapArray = [];
    subData2.forEach(o => {
      mcapArray.push(mcapCalculator(o.ethAmount, o.erc20Amount, contractObject.totalSupply, contractObject.decimals))
    });
    let medianMcap = mcapArray.sort((a, b) => a - b)[Math.floor(mcapArray.length/2)];
    if (!medianMcap) medianMcap = aggrData.length > 0 ? aggrData[aggrData.length - 1].mcap : 0; // if no value, set to previous value
    const ethVolume = round(subData2.reduce((acc, o) => acc + o.ethAmount, 0)/10**18, 0);

    // append to collector
    aggrData.push({
      startBlock: currentBlock,
      endBlock: currentBlock + aggrSize,
      txCount: subData1.length,
      userCount: userAddresses.length,
      newUserCount: newUserCount,
      buys: buys,
      sells: sells,
      mcap: medianMcap,
      ethVolume: ethVolume,
    });

    // while loop incr
    currentBlock = currentBlock + aggrSize + 1;
  }
  return aggrData;
}


async function saveData(aggrData, contractObject, name) {
  console.log('Saving data...');
  const db2 = JSON.parse(await fs.readFile(path_db2));
  db2[contractObject.contractAddress] = aggrData;
  await fs.writeFile(path_db2, JSON.stringify(db2, null, 2), 'utf8');
  const csv = new ObjectsToCsv(aggrData);
  await csv.toDisk(`./infura/data/csv/${name}.csv`);
}


async function main(contractObject, name) {
  // 1) Determine blockrange of interest
  let startBlock = contractObject.blockNumber;
  const endBlock = startBlock + N_BLOCKS; // next N blocks
  // startBlock = startBlock + N_BLOCKS/2;

  // 2) Get data for blockrange of interest
  const allData1 = await getData1(contractObject, startBlock, endBlock);
  const allData2 = await getData2(contractObject, startBlock, endBlock);

  // 3) Group & aggr in buckets of 5 blocks
  const aggrData = aggregateData(allData1, allData2, contractObject);

  // 4) Save data
  await saveData(aggrData, contractObject, name);
}


if (require.main === module) {
  (async () => {
    const db1 = JSON.parse(await fs.readFile(path_db1));
    const name = "Pepe";
    // const name = "CUCK";
    // const name = "NiHao";
    // const name = "NicCageWaluigiElmo42069Inu";
    // const name = "AstroPepeX";
    const contractObject = Object.values(db1).find(o => o.name === name);
    console.time('Timer');
    await main(contractObject, name);
    console.timeEnd('Timer');
  })();
}
