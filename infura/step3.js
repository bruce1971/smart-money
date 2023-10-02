const fs = require('fs/promises');
const path_db1 = `./infura/data/db1.json`;
const path_db2 = `./infura/data/db2.json`;
const { round } = require(`./helper.js`);
const { backtest } = require(`./backtest.js`);
const regression = require('regression');

function ratiosTest(data) {
  // Calculate the ratios between consecutive numbers
  const ratios = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i - 1] === 0) return false;
    const ratio = data[i] / data[i - 1];
    ratios.push(ratio);
  }

  // elimination 1 - not purely positive growth
  if (ratios.some(el => el < 1)) {
    console.log('elimination 1 - not purely positive growth');
    return false;
  }

  // elimination 2 - not enough users
  if (data[data.length - 1] < 50) {
    console.log('elimination 2 - not enough users');
    return false; //have minimum 50 new users
  }

  // elimination 3 - ratios not roughly equal
  const meanRatio = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
  const tolerance = 0.3; // You can adjust this threshold as needed
  for (const ratio of ratios) {
    if (Math.abs(ratio - meanRatio) > tolerance) {
      console.log('elimination 3 - ratios not roughly equal');
      return false;
    }
  }

  // elimination 4 - growth not steep enough
  if (meanRatio < 1.25) {
    console.log('elimination 4 - growth not steep enough');
    return false;
  }

  // SUCCESS!
  return true;
}


function logLinearTest(data) {
  const logData = data.map(Math.log);

  const reg = regression.linear(logData.map((_, i) => [i, logData[i]]));
  const [slope, intercept] = reg.equation;
  const rSquared = reg.r2;

  const isGoodLinearFit = rSquared > 0.9;
  const isGrowth = slope > 0;
  const isSteepGrowth = slope > 0.1;
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


async function main(contractObject, name) {
  const db2 = JSON.parse(await fs.readFile(path_db2));
  const data = db2[contractObject.contractAddress];
  const triggers = algo1(data);
  return triggers;
}


if (require.main === module) {
  (async () => {
    const db1 = JSON.parse(await fs.readFile(path_db1));
    // const name = "Pepe";
    // const name = "CUCK";
    const name = "AstroPepeX";
    // const name = "NiHao";
    // const name = "NicCageWaluigiElmo42069Inu";
    const contractObject = Object.values(db1).find(o => o.name === name);
    const triggers = await main(contractObject, name);
    console.log(`${name} ${triggers.length} triggers`);

    for (let i = 0; i < triggers.length; i++) {
      console.log('=======================================');
      const trigger = triggers[i];
      console.log(trigger);
      await backtest(contractObject, trigger.triggerBlock)
    }
  })();
}
