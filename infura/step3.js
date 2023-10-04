const fs = require('fs/promises');
const path_db1 = `./infura/data/db1.json`;
const path_db2 = `./infura/data/db2.json`;
const { round } = require(`./helper.js`);
const { erc20Name } = require(`./config.js`);
const regression = require('regression');


module.exports = {
  main
}


function logLinearTest(data) {
  const logData = data.map(Math.log);

  const reg = regression.linear(logData.map((_, i) => [i, logData[i]]));
  const [slope, intercept] = reg.equation;
  const rSquared = reg.r2;

  const isGoodLinearFit = rSquared > 0.9;
  const isGrowth = slope > 0;
  const isSteepGrowth = slope > 0.15;
  if (isGoodLinearFit && isGrowth && isSteepGrowth) {
    return {
      data: data,
      equation: reg.string,
      rSquared: reg.r2
    }
  }
}


function sizeTest(data) {
  const lastData = data[data.length - 1];
  const denom = lastData.newUserCountXmin > 0 ? lastData.newUserCountXmin : 0.0001;
  return {
    ratio: round(lastData.mcap/denom, 0),
    mcap: lastData.mcap,
    maxNewUsers: denom
  };
}


function algo1(data) {
  // add needed data
  const nMin = 5;
  for (let i = 0; i < data.length; i++) {
    data[i].newUserCountXmin = data.slice(i-nMin+1 < 0 ? 0 : i-nMin+1, i+1).reduce((acc, o) => acc + o.newUserCount, 0);
  }

  // find exp patterns
  const triggers = []
  const seriesLength = 5;
  for (let i = 0; i < data.length; i++) {
    // take data subset
    let dataSlice = data.slice(i-seriesLength+1 < 0 ? 0 : i-seriesLength+1, i+1);

    // check size ratios
    const sizeTestResult = sizeTest(dataSlice);
    if (sizeTestResult.ratio > 50000 || sizeTestResult.maxNewUsers < 20) continue; // filter out too big & too little

    // check log linear
    let dataSliceNewUserCountXmin = dataSlice.map(o => o.newUserCountXmin);
    while (dataSliceNewUserCountXmin.length < seriesLength) dataSliceNewUserCountXmin = [0].concat(dataSliceNewUserCountXmin);
    const logLinearTestResult = logLinearTest(dataSliceNewUserCountXmin);
    if (logLinearTestResult) {
      triggers.push({
        i,
        triggerBlock: data[i].endBlock + 1,
        sizeRatio: sizeTestResult.ratio,
        ...logLinearTestResult
      });
    }
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
    console.log(triggers);
    console.log(`${erc20Name}: ${triggers.length} triggers`);
  })();
}
