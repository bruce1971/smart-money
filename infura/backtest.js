const axios = require('axios');
const etherscanApiKey = 'I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG';
const { mcapCalculator, logDecoder } = require(`./helper.js`);
const fs = require('fs/promises');
const path_db1 = `./infura/data/db1.json`;


module.exports = {
  backtest
}


async function yoooo(contractObject, triggerBlock) {
  let responseSwap = await axios.get(`
    https://api.etherscan.io/api
     ?module=logs
     &action=getLogs
     &address=${contractObject.pairAddress}
     &fromBlock=${triggerBlock}
     &toBlock=${triggerBlock}
     &topic0=0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822
     &apikey=${etherscanApiKey}
  `.replace(/\s/g, '')).then(res => res.data.result)

  const mcapArray = [];
  responseSwap.forEach(el => {
    const decoded = logDecoder(el.data);
    const ethAmount = decoded[0] + decoded[2];
    const erc20Amount = decoded[1] + decoded[3];
    mcapArray.push(mcapCalculator(ethAmount, erc20Amount, contractObject.totalSupply, contractObject.decimals))
  });
  const medianMcap = mcapArray.sort((a, b) => a - b)[Math.floor(mcapArray.length/2)];
  return medianMcap;
}


async function backtest(contractObject, triggerBlock) {
  const nMin = 5;
  const t = 5 * nMin;

  const pastMcap = await yoooo(contractObject, triggerBlock-t);
  console.log('pastMcap:', pastMcap);
  const presentMcap = await yoooo(contractObject, triggerBlock);
  console.log('presentMcap:', presentMcap);
  const futureMcap = await yoooo(contractObject, triggerBlock+t);
  console.log('futureMcap:', futureMcap);
}


if (require.main === module) {
  (async () => {
    const db1 = JSON.parse(await fs.readFile(path_db1));
    // const name = "Pepe";
    // const name = "CUCK";
    // const name = "NiHao";
    const name = "AstroPepeX";
    // const name = "NicCageWaluigiElmo42069Inu";
    const triggerBlock = 18173928;
    const contractObject = Object.values(db1).find(o => o.name === name);
    backtest(contractObject, triggerBlock);
  })();
}
