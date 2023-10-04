const fs = require('fs/promises');
const path_db1 = `./infura/data/db1.json`;
const path_db2 = `./infura/data/db2.json`;
const { round, formatLargeValue } = require(`./helper.js`);
const { main: step3 } = require(`./step3.js`);
const { erc20Name } = require(`./config.js`);


module.exports = {
  main
}


function triggerTest(data, triggerBlock) {
  const nMin = 5;
  const t = 5 * nMin;

  const pastMcap = data.find(o => o.startBlock <= (triggerBlock-t) && (triggerBlock-t) <= o.endBlock)?.mcap || 1;
  console.log(`mcap0: $${formatLargeValue(pastMcap)}`);

  const presentMcap = data.find(o => o.startBlock <= triggerBlock && triggerBlock <= o.endBlock)?.mcap || 1;
  console.log(`mcap1: $${formatLargeValue(presentMcap)} (${round((presentMcap-pastMcap)/pastMcap, 2)})`);

  const futureMcap = data.find(o => o.startBlock <= (triggerBlock+t) && (triggerBlock+t) <= o.endBlock)?.mcap || 1;
  const pnl = round((futureMcap-presentMcap)/presentMcap, 2);
  console.log(`mcap2: $${formatLargeValue(futureMcap)} (${pnl})`);

  if([pastMcap, presentMcap, futureMcap].some(el => el === 1 || el > 10**15)) {
    return 0
  }

  return pnl;
}


function main(triggers, db2, contractObject) {
  let pnls = [];
  for (let i = 0; i < triggers.length; i++) {
    console.log('=======================================');
    const trigger = triggers[i];
    console.log(trigger);
    const pnl = triggerTest(db2[contractObject.contractAddress], trigger.triggerBlock);
    pnls.push(pnl);
  }

  console.log('+++++++++++++++++++++++++++++++++++++++');
  console.log(`${erc20Name}: ${triggers.length} Triggers`);
  console.log(`${erc20Name}: ${round(pnls.reduce((acc, el) => acc + el, 0)/triggers.length, 2)} Avg PNL`);
  console.log(`${erc20Name}: ${round(pnls.reduce((acc, el) => acc + el, 0), 2)} Total PNL`);

}


if (require.main === module) {
  (async () => {
    const db1 = JSON.parse(await fs.readFile(path_db1));
    const db2 = JSON.parse(await fs.readFile(path_db2));
    const contractObject = Object.values(db1).find(o => o.name === erc20Name);
    const triggers = await step3(contractObject, erc20Name);
    main(triggers, db2, contractObject);
  })();
}
