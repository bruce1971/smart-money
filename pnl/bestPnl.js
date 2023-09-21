const fs = require('fs/promises');
const path = `./data/pnl.json`;


async function getBestPnl() {
  const allPnl = JSON.parse(await fs.readFile(path));
  const contractAddresses = Object.keys(allPnl);
  const bestPnl = {}
  contractAddresses.forEach(contractAddress => {
    const contractPnl = allPnl[contractAddress];
    const userAddresses = Object.keys(contractPnl);
    userAddresses.forEach(userAddress => {
      const userPnl = contractPnl[userAddress];
      if (userPnl.profit > 1) { // more that 1eth profit
        if (bestPnl[userPnl.userAddress]) {
          bestPnl[userPnl.userAddress].push(userPnl);
        } else {
          bestPnl[userPnl.userAddress] = [userPnl];
        }
      }
    });
  });
  Object.keys(bestPnl).forEach(userAddress => {
    if (bestPnl[userAddress].length > 1) {
      console.log('================================================');
      console.log(userAddress);
      console.log(bestPnl[userAddress]);
    }
  });
}


if (require.main === module) getBestPnl();
