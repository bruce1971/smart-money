const fs = require('fs/promises');
const path_db1 = `./infura/data/db1.json`;
const path_db2 = `./infura/data/db2.json`;
const { round, formatLargeValue } = require(`./helper.js`);


module.exports = {
  backtest
}


async function backtest(contractObject, triggerBlock) {
  const db2 = JSON.parse(await fs.readFile(path_db2));
  const data = db2[contractObject.contractAddress];

  const nMin = 5;
  const t = 5 * nMin;

  const pastMcap = data.find(o => o.startBlock <= (triggerBlock-t) && (triggerBlock-t) <= o.endBlock)?.mcap || 1;
  console.log(`mcap0: $${formatLargeValue(pastMcap)}`);

  const presentMcap = data.find(o => o.startBlock <= triggerBlock && triggerBlock <= o.endBlock).mcap;
  console.log(`mcap1: $${formatLargeValue(presentMcap)} (${round((presentMcap-pastMcap)/pastMcap, 2)})`);

  const futureMcap = data.find(o => o.startBlock <= (triggerBlock+t) && (triggerBlock+t) <= o.endBlock)?.mcap || 1;
  console.log(`mcap2: $${formatLargeValue(futureMcap)} (${round((futureMcap-presentMcap)/presentMcap, 2)})`);
}


if (require.main === module) {
  (async () => {
    const db1 = JSON.parse(await fs.readFile(path_db1));
    const name = "Pepe";
    // const name = "CUCK";
    // const name = "NiHao";
    // const name = "AstroPepeX";
    // const name = "NicCageWaluigiElmo42069Inu";
    const triggerBlock = 18172902;
    const contractObject = Object.values(db1).find(o => o.name === name);
    backtest(contractObject, triggerBlock);
  })();
}
