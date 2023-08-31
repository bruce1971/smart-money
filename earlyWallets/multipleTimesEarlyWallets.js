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
  '0xe8c060f8052e07423f71d445277c61ac5138a2e5',
  '0xc305000000ff00002b001b6300dda3f0ba56b1bd'
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
// scan to filter out non-human wallets
(async () => {
  const finalWallets = [];
  console.log(`Scanning ${filteredWallets.length} wallets...`);
  for (var i = 0; i < filteredWallets.length; i++) {
    console.log(i+1);
    const normalTransactions = await axios.get(accountUrl('txlist', filteredWallets[i].address)).then(res => res.data.result);
    if (50 < normalTransactions.length && normalTransactions.length < 10000) finalWallets.push(filteredWallets[i]);
  }
  finalWallets.forEach(wallet => console.log(`${wallet.address} -> ${wallet.tokens}`));
})();


// NO 0x0a24c7547dd14be2f502d354afd224b226d177e4 -> pepe,bitcoin,mog,cage
// YE 0x9224cf7956b8787f1e015349ba2937cef29215d8 -> pepe,turbo,bitcoin,mog
// NO 0x3e9d24b9a83d4cb144d01594f437a9b94ccc8d60 -> pepe,turbo,bitcoin,mog
// NO 0x91d5482f54f2dfddf21caf8f5528f689397ae223 -> pepe,mog,hams,nihao
// NO 0x4a2c786651229175407d3a2d405d1998bcf40614 -> pepe,mog,nihao
// NO 0x0be167856e9b54e0088f04c2f611f59871d89e39 -> pepe,mog,nihao
// NO 0xc77d249809ae5a118eef66227d1a01a3d62c82d4 -> pepe,hams,nihao
// NO 0xd295ccf0ccd19b41dfb9b78e02eace3d7ec85be7 -> pepe,bitcoin,nihao
// 0xfd22e70cb42a0fa315c82e0aa95a6dc19f8b4934 -> pepe,bitcoin,mog
// 0x70399b85054dd1d94f2264afc8704a3ee308abaf -> pepe,turbo,nihao
// 0xe3f161f96495d27c58c982d806553631940e2b25 -> pepe,mog,hams
// 0x44ae4efa8463ada0dbba34fd969b973c92cab5ca -> pepe,turbo,mog
// 0x240e204b8eb025533128b54ed55c141d64db987d -> pepe,mog,nihao
// 0xab21da17a6ed156b3642234ce27e412ac08a7627 -> pepe,bitcoin,mog
// 0x353c1f0bc78fbbc245b3c93ef77b1dcc5b77d2a0 -> pepe,mog,nihao
// 0xede9fb802ee8d5df4f901c998d4322f6218d4b1c -> pepe,mog,nihao
// 0x1a5b87ff2e576b0a4605206c262a3d793bab725a -> pepe,bitcoin,mog
// 0x0ba248d14c1edeeff527854024c41fc60fc2b42b -> pepe,bitcoin,mog
// 0x0e730ce6244a4592abe22f907cf16e038cadfedd -> pepe,bitcoin,mog
// 0x650e5876d478be82edf31cd662fda8405422efec -> pepe,bitcoin,hams
// 0xd5b0878a127fb9ed001aa3f257582f22986061f8 -> pepe,turbo,nihao
// 0x06951226085784ad6bd3f63149fa2d4e834a3a8f -> pepe,bitcoin,mog
// 0xadc90d9af22d656390e3d9b954f71bb22c6b4dec -> pepe,mog,nihao
// 0x690fda326337be9d372beac10ed4c464e097e1ea -> pepe,hams,cage
// 0xda24aaa8165b7e69e5f12014f473194d11a031c8 -> pepe,turbo,mog
// 0xbc8f91ed01fcbb19ef2382f4e6ea078b945640a0 -> pepe,mog,nihao
// 0x12b6eba545e4a9666cb7a77d1da25df9ffb172f3 -> pepe,turbo,mog
// 0xa0cdf33c150b936d0091969c694da3cfeae18446 -> pepe,turbo,mog
// 0x8df4da8138605320e8eab55fa994fb8ee4529049 -> pepe,turbo,nihao
// 0x3c11759de37bf5e7e13cfebdaa657c2831817a9b -> pepe,mog,nihao
// 0xcb3702bc25b0f284b032e5edf1a1ebea2fe43255 -> pepe,bitcoin,mog
// 0x763e5aa3375ae1af82c96ec25e638798696c105b -> pepe,mog,hams
// 0x1ccd2496090c53687572edc2b62c3b58b6799bbd -> pepe,turbo,bitcoin
// 0x5bca4075dfc8065235cf75c6b15b410e62845fec -> pepe,turbo,mog
// 0xb0ed9703effa36c4286d3ecb9cfa37d992f88abc -> pepe,turbo,mog
// 0x45aee1be043d851f9bacd7038673cd350e548fdd -> pepe,bitcoin,nihao
// 0x5a8116f07937394e6ac2a51995ab6a054c08bf9e -> pepe,turbo,mog
// 0xbcfe2cf1f88a2417f4f895d91105ea1a722c7d34 -> pepe,bitcoin,mog
// 0xee77a7fda3058badcad6948ec282905453f58944 -> pepe,mog,nihao
// 0x072c26ac81a0dd8b968a1283d66ebebf30ed7980 -> pepe,mog,hams
// 0x09b5095176568409b78ce6ca6a16d5452380d14b -> pepe,mog,hams
// 0xb3c64a8318131802c2d77cceb9af7e5412196397 -> pepe,turbo,mog
// 0x98974a83f9d2f202c949017b5b27361497f771ac -> pepe,mog,hams
// 0xa7846b108defa5894b99f7e7c7544bb4774c5cfb -> pepe,mog,hams
// 0x25a08d6c68183a371fd6015a28ad9a0aa57a9c57 -> pepe,mog,nihao
// 0x334d080349da9cfa602442968483b761defa5bf7 -> pepe,bitcoin,mog
// 0x3f09c95509fd8cb9c6362828b6d6e97d853c073c -> pepe,bitcoin,mog
// 0xb62ea019c3ecf647c21b3d394f373c4089e3e4d6 -> pepe,bitcoin,mog
// 0x4ea1216daabc7309ac4c18105ea5a34e79ce55d0 -> pepe,bitcoin,mog
// 0xb9999c5c8605c80065e79b5924974b21de24dd37 -> pepe,bitcoin,mog
// 0xf604af608080af90117b20ca327dd94409e3291f -> pepe,bitcoin,mog
// 0xb9639c77a10b3689b9c642d469870b10566cc77f -> pepe,bitcoin,mog
// 0xfb5185b7f8c61f815b57de679bbc857f510352f7 -> pepe,bitcoin,mog
// 0x92b5e5b212e8ba8056e1bc039f10534f89b38bc9 -> pepe,mog,nihao
// 0x1616ecdd3dc368f4970a93ec32bf12176c9e9fe5 -> pepe,mog,hams
// 0xa9eb78733463234b34b18b8037b475e8115c49ae -> pepe,bitcoin,mog
// 0xdb5f98d56f9731d265cd1ed771ecd4abfafc3902 -> pepe,mog,hams
// 0x3e57efef507b4db7acfa2ee79ceca6b19e18d106 -> pepe,bitcoin,mog
// 0xbba60570d0f850aaa99a9319224c1f64a583d2e7 -> pepe,turbo,mog
// 0xaf7682f2223454837025c4bf8eeb3dbdb7be87f0 -> pepe,mog,hams
// 0x67511804b014fbfcb3f0284807044c480fd92818 -> pepe,turbo,mog
// 0xa122cef83a7103adca01dda23eac8b85c3278e34 -> pepe,mog,hams
// 0xeea0471cfcaed2f83117a2660b3d21738d478990 -> pepe,bitcoin,mog
// 0x806401807006d107fa42b5dca1ddef2ad014d9f7 -> pepe,bitcoin,cage
// 0x5db686f44e34b3374ed760f782be979798b7d7ef -> pepe,mog,hams
// 0xeea2d379eec171458eaecaccc323b955bd11a86e -> pepe,mog,nihao
// 0x19383282e04e76dd0bbb7ec4404fd735fcd27a95 -> pepe,bitcoin,mog
// 0xb87b070c3757b770509de32880e166e06bedc742 -> pepe,mog,hams
// 0x72b43498b6d9128a5fc871f7d1b77900018cfb01 -> pepe,mog,hams
// 0x303425052e462dd0f3044aee17e1f5be9c7de783 -> pepe,mog,nihao
// 0xa993a235fa5467f5f8609921e44d72912fd7be16 -> pepe,turbo,bitcoin
// 0xb8b4e1a8750c24f13e10c361e7b811d0fba9b83f -> pepe,bitcoin,mog
// 0x38dfc9cd34b2f686914a48c807c30ba176f3c7a8 -> pepe,mog,cage
// 0x023ab8e20a4682d315daef4c91db96bd77934d66 -> pepe,bitcoin,mog
// 0x2d754e743afb905f1d27a7ae3af45ab844da3b83 -> pepe,bitcoin,mog
// 0x5308143dab2eb595aec03a38bf76e1f5f83c3281 -> pepe,bitcoin,mog
// 0x40d68c490bf7262ec40048099aec23535f734be2 -> pepe,mog,hams
// 0x9cac33308aa9c647973e96abf09f118c8c937bd1 -> pepe,bitcoin,mog
// 0x9ee0ce8c13fea4274614d90e19dec4ee76f2c212 -> pepe,mog,nihao
// 0x49e9432f0f96bb23261c879bc8b95c46a1941158 -> pepe,bitcoin,mog
// 0x22b58d052df107ee185f6c00bfa36cc10554b3d1 -> pepe,mog,hams
// 0xafd7c394db3375bab0e4e43a6b53f8d7834a7e21 -> pepe,bitcoin,mog
// 0x9fa7bb759641fcd37fe4ae41f725e0f653f2c726 -> pepe,bitcoin,mog
// 0x1d9e8d017c8f01ec435dda5d43344868d0cfd7de -> pepe,bitcoin,mog
// 0xf6e45347f67b4b6a1f689b3a8cac5b361af57c1a -> pepe,mog,cage
// 0xb848118ea25a9852b3981f615daeada352c3692e -> pepe,turbo,nihao
// 0x2d13c884c4c418664abb1b4a7f491dd89247e42e -> pepe,turbo,nihao
// 0x2c4ebd1eea45fabb32d85e799cc7859edfeb75eb -> pepe,turbo,hams
// 0xa881b10405d3b6462dc1d337af5b31234b361644 -> pepe,mog,nihao
// 0x682b74eeb2ef290dfdc09c10127afda14bebf2c2 -> turbo,bitcoin,mog
// 0xc950044940e9de74a1e595f7de9ba7b3785d483f -> turbo,bitcoin,nihao
// 0xddcfb156640986890aefcb96d2ad765b6c574daf -> bitcoin,mog,hams
// 0x3b0f058800389dd8526de542aea994c34d659dde -> bitcoin,mog,hams
// 0x9cd366a40d93f40ef0e2718c799172ea05fd4051 -> bitcoin,mog,cage
// 0x3a70243da65320e2adeaa7b8f5bfc059e81b28eb -> bitcoin,mog,cage
// 0x06d9ca334a8a74474e9b6ee31280c494321ae759 -> bitcoin,mog,cage
// 0x9d7bb46b969608dda9b64e11f13c9952ce2ac135 -> mog,hams,nihao
// 0x28bf57bd66892ee84ddd65e2ee8fda146b7d471a -> mog,cage,nihao
