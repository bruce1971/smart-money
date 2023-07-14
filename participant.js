const axios = require('axios');
const ETHERSCAN_API_KEY="I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG";
const NEXT_PUBLIC_ETHERSCAN_API="https://api.etherscan.io/api";
let PARTICIPANT_ADDRESS = '0x70399b85054dd1d94f2264afc8704a3ee308abaf' //scribbs
// let PARTICIPANT_ADDRESS = '0x39E8c5F01F6314E0d8d5bA00F3D2e9569e45C05a' //me
// let PARTICIPANT_ADDRESS = '0xed2c5d18f772f834d8ec9f040ee73d1a17056d7f' //kucoin
PARTICIPANT_ADDRESS = PARTICIPANT_ADDRESS.toLowerCase();


function accountUrl(type) {
  return `
    https://api.etherscan.io/api
     ?module=account
     &action=${type}
     &address=${PARTICIPANT_ADDRESS}
     &startblock=0
     &endblock=99999999
     &page=1
     &sort=desc
     &apikey=${ETHERSCAN_API_KEY}
  `.replace(/\s/g, '')
}


function parseTx(tx) {
  value = Number(tx.value)/10**18;
  if (tx.from.toLowerCase() === PARTICIPANT_ADDRESS && tx.functionName === '' && tx.input === '0x') {
    console.log(`Send ${value}eth to ${tx.to}`);
  } else if (tx.to.toLowerCase() === PARTICIPANT_ADDRESS && tx.functionName === '') {
    console.log(`Receive ${value}eth from ${tx.from}`);
  } else if (tx.to.toLowerCase() === '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'.toLowerCase() && tx.functionName.includes('commit')) {
    console.log(`Request to Register ENS Domain`);
  } else if (tx.to.toLowerCase() === '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'.toLowerCase() && tx.functionName.includes('registerWithConfig')) {
    console.log(`Register ENS Domain`);
  } else if (tx.from.toLowerCase() === PARTICIPANT_ADDRESS && tx.functionName === '') {
    console.log(`NFT buy! Bought ${tx.tokenName} ${tx.tokenID} for ${value}eth`);
  } else if (tx.functionName === 'withdraw(uint256 amount)' && tx.to.toLowerCase() == '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase()) {
    console.log(`withdraw(uint256 amount)`);
    console.log(tx);
    console.log(`Unwrap WETH to ETH`); //amount in decoded tx.input
  } else if (tx.functionName === 'withdraw(uint256 amount)' && tx.to.toLowerCase() == '0x0000000000a39bb272e79075ade125fd351887ac'.toLowerCase()) {
    console.log(`withdraw(uint256 amount)`);
    console.log(tx);
    console.log(`Withdraw from Blur`);
  } else {
    // console.log(tx);
  }
}


async function getEtherscanData() {

  const normalTransactions = await axios.get(accountUrl('txlist')).then(res => {
    const txs = res.data.result;
    txs.forEach(tx => tx.type = 'normal');
    return txs;
  });
  const internalTransactions = await axios.get(accountUrl('txlistinternal')).then(res => {
    const txs = res.data.result;
    txs.forEach(tx => tx.type = 'internal')
    return txs;
  });
  const erc20Transactions = await axios.get(accountUrl('tokentx')).then(res => {
    const txs = res.data.result;
    txs.forEach(tx => tx.type = 'erc20')
    return txs;
  });
  const erc721Transactions = await axios.get(accountUrl('tokennfttx')).then(res => {
    const txs = res.data.result;
    txs.forEach(tx => tx.type = 'erc721')
    return txs;
  });
  const erc1155Transactions = await axios.get(accountUrl('token1155tx')).then(res => {
    const txs = res.data.result;
    txs.forEach(tx => tx.type = 'erc1155')
    return txs;
  });

  let transactions = [
    ...normalTransactions,
    ...internalTransactions,
    ...erc20Transactions,
    ...erc721Transactions,
    ...erc1155Transactions
  ];

  let txHashes = [...new Set(transactions.map(tx => tx.hash))];
  let txArray = [];
  txHashes.forEach(hash => {
    const txs = transactions.filter(tx => tx.hash === hash);
    const timeStamp = Number(txs[0].timeStamp);
    txArray.push({
      hash: hash,
      timeStamp: timeStamp,
      txs: txs
    })
  });
  txArray = txArray.sort((a, b) => Number(b.timeStamp) - Number(a.timeStamp))

  txArray.forEach(tx => {
    console.log('-----------------');
    console.log(`https://etherscan.io/tx/${tx.hash}`);
    console.log(tx);
    // parseTx(tx)
  });

}

getEtherscanData()
