const wallets = require(`./data.js`);
const EARLY_FREQUENCY = 2;

const allKeys = Object.keys(wallets);
let allWallets = [];
allKeys.forEach(key => {
  allWallets = [...allWallets, ...wallets[key]]
});

allWallets = [... new Set(allWallets)];

const blacklist = [
  '0x6131b5fae19ea4f9d964eac0408e4408b66337b5',
  '0x6b75d8af000000e20b7a7ddf000ba900b4009a80',
  '0xc36442b4a4522e871399cd717abdd847ab11fe88',
  '0x9008d19f58aabd9ed0d60971565aa8510560ab41',
  '0x22f9dcf4647084d6c31b2765f6910cd85c178c18',
  '0xa910f92acdaf488fa6ef02174fb86208ad7722ba',
  '0x74de5d4fcbf63e00296fd95d33236b9794016631',
  '0x00004ec2008200e43b243a000590d4cd46360000'
]

allWallets = allWallets.filter(w => !['0x000000', '0x111111'].some(substring => w.includes(substring)))
allWallets = allWallets.filter(w => !blacklist.includes(w))

allWalletsObj = {};
allWallets.forEach(wallet => {
  allWalletsObj[wallet] = [];
  allKeys.forEach(key => {
    if (wallets[key].includes(wallet)) allWalletsObj[wallet].push(key)
  });
});

filteredWalletsObj = {};
Object.keys(allWalletsObj).forEach(wallet => {
  if (allWalletsObj[wallet].length >= EARLY_FREQUENCY) filteredWalletsObj[wallet] = allWalletsObj[wallet];
});

console.log(filteredWalletsObj);
