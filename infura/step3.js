const fs = require('fs/promises');
const path_min5 = `./infura/data/min5.json`;


function algo(data) {
  const triggers = [];
  let streak = 0;
  for (var i = 0; i < data.length; i++) {
    if (data[i].buys > data[i].sells) streak += 1;
    else streak = 0;
    if (streak === 20) triggers.push(data[i])
  }
  return triggers;
}


async function main() {
  const min5 = JSON.parse(await fs.readFile(path_min5));
  const cas = Object.keys(min5);
  cas.forEach(ca => {
    const data = min5[ca];
    const triggers = algo(data);
    console.log(ca);
    console.log(triggers);
  });
}


if (require.main === module) {
  (async () => {
    main();
  })();
}
