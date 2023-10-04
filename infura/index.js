const fs = require('fs/promises');
const path_db1 = `./infura/data/db1.json`;
const path_db2 = `./infura/data/db2.json`;
let { main: step1 } = require(`./step1.js`);
let { main: step2 } = require(`./step2.js`);
let { main: step3 } = require(`./step3.js`);
let { main: backtest } = require(`./backtest.js`);
const { blockOfInterest } = require(`./config.js`);


if (require.main === module) {
  (async () => {
    let contractAddress = '0xC3681A720605bD6F8fe9A2FaBff6A7CDEcDc605D';
    contractAddress = contractAddress.toLowerCase();

    // STEP 1 - get launch
    console.log('💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛💛');
    await step1(blockOfInterest-5, blockOfInterest+5);

    // STEP 2 - get data
    console.log('💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙');
    const db1 = JSON.parse(await fs.readFile(path_db1));
    const contractObject = db1[contractAddress];
    await step2(contractObject, contractObject.name);

    // STEP 3 - run algo & get triggers
    console.log('💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚💚');
    const triggers = await step3(contractObject, contractObject.name);
    console.log(triggers);

    // BACKTEST
    console.log('💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜');
    const db2 = JSON.parse(await fs.readFile(path_db2));
    backtest(triggers, db2, contractObject);

  })();
}
