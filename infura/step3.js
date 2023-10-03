const fs = require('fs/promises');
const path_db1 = `./infura/data/db1.json`;
const path_db2 = `./infura/data/db2.json`;
const { round } = require(`./helper.js`);
const { backtest } = require(`./backtest.js`);
const { erc20Name } = require(`./config.js`);
const regression = require('regression');


function logLinearTest(data) {
  const logData = data.map(Math.log);

  const reg = regression.linear(logData.map((_, i) => [i, logData[i]]));
  const [slope, intercept] = reg.equation;
  const rSquared = reg.r2;

  const isGoodLinearFit = rSquared > 0.9;
  const isGrowth = slope > 0;
  const isSteepGrowth = slope > 0.15;
  const hasMinNewUsers = data[data.length - 1] > 20;
  if (isGoodLinearFit && isGrowth && isSteepGrowth && hasMinNewUsers) {
    return {
      data: data,
      // logData: logData.map(el => round(el, 2)),
      equation: reg.string,
      rSquared: reg.r2
    }
  }
}


function algo1(data) {
  // add needed data
  const nMin = 5;
  for (let i = 0; i < data.length; i++) {
    data[i].newUserCountXmin = data.slice(i-nMin+1 < 0 ? 0 : i-nMin+1, i+1).reduce((acc, o) => acc + o.newUserCount, 0);
  }

  // find exp patterns
  const triggers = []
  const expPoints = 5;
  for (let i = 0; i < data.length; i++) {
    let dataX = data.slice(i-expPoints+1 < 0 ? 0 : i-expPoints+1, i+1).map(o => o.newUserCountXmin);
    while (dataX.length < expPoints) dataX = [0].concat(dataX);
    const logLinearTestResult = logLinearTest(dataX)
    if (logLinearTestResult) triggers.push({ i, triggerBlock: data[i].endBlock + 1, ...logLinearTestResult })
  }

  return triggers;
}


async function main(contractObject, erc20Name) {
  const db2 = JSON.parse(await fs.readFile(path_db2));
  const data = db2[contractObject.contractAddress];
  const triggers = algo1(data);
  return triggers;
}


if (require.main === module) {
  (async () => {
    const db1 = JSON.parse(await fs.readFile(path_db1));
    const contractObject = Object.values(db1).find(o => o.name === erc20Name);
    const triggers = await main(contractObject, erc20Name);

    let pnls = [];
    for (let i = 0; i < triggers.length; i++) {
      console.log('=======================================');
      const trigger = triggers[i];
      console.log(trigger);
      const pnl = await backtest(contractObject, trigger.triggerBlock);
      pnls.push(pnl)
    }

    console.log('+++++++++++++++++++++++++++++++++++++++');
    console.log(`${erc20Name} Triggers ${triggers.length}`);
    console.log(`${erc20Name} PNL ${round(pnls.reduce((acc, el) => acc + el, 0), 2)}`);
  })();
}
