const fs = require('fs/promises');
const path_db1 = `./infura/data/db1.json`;
const path_db2 = `./infura/data/db2.json`;
let { main: step1 } = require(`./step1t.js`);
let { main: step2 } = require(`./step2.js`);
let { main: step3 } = require(`./step3.js`);
let { main: backtest } = require(`./backtest.js`);
const { contractAddressOfInterest  } = require(`./config.js`);
const allSteps = true


if (require.main === module) {
  (async () => {
    contractAddress = contractAddressOfInterest.toLowerCase();

    // STEP 1 - get launch
    console.log('💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛');
    if (allSteps) await step1(contractAddress);

    // STEP 2 - get data
    console.log('💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙');
    const db1 = JSON.parse(await fs.readFile(path_db1));
    const contractObject = db1[contractAddress];
    if (allSteps) await step2(contractObject, contractObject.name);

    // STEP 3 - run algo & get triggers
    console.log('💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚');
    const triggers = await step3(contractObject);

    // BACKTEST
    console.log('💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜');
    const db2 = JSON.parse(await fs.readFile(path_db2));
    backtest(triggers, db2, contractObject);
  })();
}
