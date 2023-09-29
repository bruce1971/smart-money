const fs = require('fs/promises');
const path_db1 = `./infura/data/db1.json`;
const path_min5 = `./infura/data/min5.json`;




function ratiosTest(data) {
  // Calculate the ratios between consecutive numbers
  const ratios = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i - 1] === 0) return false;
    const ratio = data[i] / data[i - 1];
    ratios.push(ratio);
  }
  console.log(ratios);

  if (ratios.some(el => el < 1)) return false; //only look at positive growth
  if (data[data.length - 1] < 50) return false; //have minimum 50 new users

  // Check if the ratios are approximately equal
  const tolerance = 0.3; // You can adjust this threshold as needed
  const meanRatio = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
  console.log('mean', meanRatio);
  if (meanRatio < 1.25) return false;
  for (const ratio of ratios) {
    if (Math.abs(ratio - meanRatio) > tolerance) return false;
  }
  console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++yAAAAA+++++++++++++++++++++++++++++++++++++++++++++');
  return true;
}


function algo1(data) {
  // add needed data
  const nMin = 5;
  for (let i = 0; i < data.length; i++) {
    data[i].newUserCountXmin = data.slice(i-nMin+1 < 0 ? 0 : i-nMin+1, i+1).reduce((acc, o) => acc + o.newUserCount, 0);
  }
  // find exp patterns
  const expPoints = 6;
  for (let i = 0; i < data.length; i++) {
    let dataX = data.slice(i-expPoints+1 < 0 ? 0 : i-expPoints+1, i+1).map(o => o.newUserCountXmin);
    while (dataX.length < expPoints) dataX = [0].concat(dataX);
    console.log('------------');
    console.log(dataX);
    console.log(ratiosTest(dataX))
  }
}

function algo2(data) {
  const triggers = [];
  let streak = 0;
  for (var i = 0; i < data.length; i++) {
    if (data[i].buys > data[i].sells) streak += 1;
    else streak = 0;
    if (streak === 20) triggers.push(data[i])
  }
  return triggers;
}


async function main(contractObject) {
  const min5 = JSON.parse(await fs.readFile(path_min5));
  const data = min5[contractObject.contractAddress];
  const triggers = algo1(data);
  // const cas = Object.keys(min5);
  // cas.forEach(ca => {
  //   const data = min5[ca];
  //   const triggers = algo(data);
  //   console.log(ca);
  //   console.log(triggers);
  // });
}


if (require.main === module) {
  (async () => {
    const db1 = JSON.parse(await fs.readFile(path_db1));
    // const name = "Pepe";
    const name = "AstroPepeX";
    const contractObject = Object.values(db1).find(o => o.name === name);
    main(contractObject);
  })();
}
