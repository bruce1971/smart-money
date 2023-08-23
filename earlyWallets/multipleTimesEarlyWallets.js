const axios = require('axios');
const wallets = require(`./data.js`);
const { accountUrl } = require(`../helper.js`);
const EARLY_FREQUENCY = 4;

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
  '0x00004ec2008200e43b243a000590d4cd46360000',
  '0xe8c060f8052e07423f71d445277c61ac5138a2e5'
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

let filteredWallets = [];
Object.keys(allWalletsObj).forEach(wallet => {
  if (allWalletsObj[wallet].length >= EARLY_FREQUENCY) {
    filteredWallets.push({ 'address': wallet, 'tokens': allWalletsObj[wallet] });
  }
});

filteredWallets = filteredWallets.sort((a,b) => b.tokens.length - a.tokens.length);
(async () => {
  const finalWallets = [];
  console.log(`scanning ${filteredWallets.length} wallets...`);
  for (var i = 0; i < filteredWallets.length; i++) {
    console.log(i);
    const normalTransactions = await axios.get(accountUrl('txlist', filteredWallets[i].address)).then(res => res.data.result);
    if (50 < normalTransactions.length && normalTransactions.length < 10000) finalWallets.push(filteredWallets[i]);
  }
  finalWallets.forEach(wallet => console.log(`${wallet.address} -> ${wallet.tokens}`));
})();
