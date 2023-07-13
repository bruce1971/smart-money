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


async function getEtherscanData() {

  const normalTransactions = await axios.get(accountUrl('txlist')).then(res => res.data.result);
  console.log(normalTransactions.length);
  const internalTransactions = await axios.get(accountUrl('txlistinternal')).then(res => res.data.result);
  console.log(internalTransactions.length);
  const erc20Transactions = await axios.get(accountUrl('tokentx')).then(res => res.data.result);
  console.log(erc20Transactions.length);
  const erc721Transactions = await axios.get(accountUrl('tokennfttx')).then(res => res.data.result);
  console.log(erc721Transactions.length);
  const erc1155Transactions = await axios.get(accountUrl('token1155tx')).then(res => res.data.result);
  console.log(erc1155Transactions.length);

  let value, ins = 0, outs = 0;
  normalTransactions.forEach(tx => {
    console.log('-----------------');
    if (tx.from.toLowerCase() === PARTICIPANT_ADDRESS && tx.functionName === '' && tx.input === '0x') {
      value = Number(tx.value)/10**18;
      outs = outs + value;
      console.log(`Send ${value}eth to ${tx.to}`);
    } else if (tx.to.toLowerCase() === PARTICIPANT_ADDRESS && tx.functionName === '') {
      value = Number(tx.value)/10**18;
      ins = ins + value;
      console.log(`Receive ${value}eth from ${tx.from}`);
    } else if (tx.to.toLowerCase() === '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'.toLowerCase() && tx.functionName.includes('commit')) {
      console.log(`Request to Register ENS Domain`);
    } else if (tx.to.toLowerCase() === '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'.toLowerCase() && tx.functionName.includes('registerWithConfig')) {
      console.log(`Register ENS Domain`);
    } else if (tx.from.toLowerCase() === PARTICIPANT_ADDRESS && tx.functionName === '') {
      value = Number(tx.value)/10**18;
      console.log(`Likely a ${value}eth NFT buy...`);
      console.log(`https://etherscan.io/tx/${tx.hash}`);
    } else {
      console.log(tx);
    }
  });
  console.log('INS',ins);
  console.log('OUTS',outs);
  const profit = outs - ins;
  console.log('PROFIT', profit);

}

getEtherscanData()
