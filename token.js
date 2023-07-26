const axios = require('axios');
const moment = require('moment');
const basePath = process.cwd();
const { participantAddresses, contractAddress } = require(`${basePath}/config.js`);
const { decodeExecute } = require(`${basePath}/universalDecoder.js`);
const { addresses } = require(`${basePath}/addresses.js`);
const { contractUrl, formatTimestamp } = require(`${basePath}/helper.js`);


async function getEtherscanData() {
  // 17757598
  let startblock = 0;
  let endblock = 99999999;
  for (var i = 0; i < [1,2,3,4,5].length; i++) {
    const transactions = await axios.get(contractUrl(startblock, endblock)).then(res => {
      const txs = res.data.result;
      txs.forEach(tx => tx.type = 'normal');
      return txs;
    });
  }

  let stopped = false
  let startblock = 0;
  let endblock = 99999999;
  // infinite loop
  while(!stopped) {
      const transactions = await axios.get(contractUrl(startblock, endblock)).then(res => res.data.result);
      if (res.something) stopped = true // stop when you want
  }

  if (transactions.length > 0) {
    const first = transactions[0];
    formatTimestamp(first.timeStamp);
    console.log(`https://etherscan.io/tx/${first.hash}`);
    console.log('first',first);

    const last = transactions[transactions.length - 1];
    formatTimestamp(last.timeStamp);
    console.log(`https://etherscan.io/tx/${last.hash}`);
    console.log('last',last);

    console.log(transactions.length);
  } else { console.log('NO TRANSACTIONS') }
}


getEtherscanData()
