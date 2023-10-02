const axios = require('axios');
const etherscanApiKey = 'I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG';
const { mcapCalculator, logDecoder, round } = require(`./helper.js`);
const fs = require('fs/promises');
const path_db1 = `./infura/data/db1.json`;


module.exports = {
  backtest
}


async function getMcap(contractObject, triggerBlock) {
  let swapsArray = [];
  const maxNextBlocks = 10;
  for (let i = 0; i < maxNextBlocks; i++) {
    let responseSwap = await axios.get(`
      https://api.etherscan.io/api
      ?module=logs
      &action=getLogs
      &address=${contractObject.pairAddress}
      &fromBlock=${triggerBlock+i}
      &toBlock=${triggerBlock+i+1}
      &topic0=0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822
      &apikey=${etherscanApiKey}
    `.replace(/\s/g, '')).then(res => res.data.result);
    swapsArray = swapsArray.concat(responseSwap);
    if (swapsArray.length >= 3) break;
  }
  if (swapsArray.length === 0) return 1; //no trading in last N block, return mcap of $1 (near zero)

  const decoded0 = logDecoder(swapsArray[0].data);
  const ethIsAmount0 = mcapCalculator(decoded0[0] + decoded0[2], decoded0[1] + decoded0[3], contractObject.totalSupply, contractObject.decimals) < 10**12;

  const mcapArray = [];
  swapsArray.forEach(el => {
    const decoded = logDecoder(el.data);
    const ethAmount = ethIsAmount0 ? decoded[0] + decoded[2] : decoded[1] + decoded[3];
    const erc20Amount = ethIsAmount0 ? decoded[1] + decoded[3] : decoded[0] + decoded[2];
    mcapArray.push(mcapCalculator(ethAmount, erc20Amount, contractObject.totalSupply, contractObject.decimals))
  });
  const medianMcap = mcapArray.sort((a, b) => a - b)[Math.floor(mcapArray.length/2)];
  return medianMcap;
}


async function backtest(contractObject, triggerBlock) {
  const nMin = 5;
  const t = 5 * nMin;

  const pastMcap = await getMcap(contractObject, triggerBlock-t);
  console.log(`mcap0: ${pastMcap}`);
  const presentMcap = await getMcap(contractObject, triggerBlock);
  console.log(`mcap1: ${presentMcap} (${round((presentMcap-pastMcap)/pastMcap, 2)})`);
  const futureMcap = await getMcap(contractObject, triggerBlock+t);
  console.log(`mcap2: ${futureMcap} (${round((futureMcap-presentMcap)/presentMcap, 2)})`);
}


if (require.main === module) {
  (async () => {
    const db1 = JSON.parse(await fs.readFile(path_db1));
    // const name = "Pepe";
    // const name = "CUCK";
    // const name = "NiHao";
    const name = "AstroPepeX";
    // const name = "NicCageWaluigiElmo42069Inu";
    const triggerBlock = 18172902;
    const contractObject = Object.values(db1).find(o => o.name === name);
    backtest(contractObject, triggerBlock);
  })();
}
