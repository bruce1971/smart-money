const axios = require('axios');
const moment = require('moment');
const abiDecoder = require('abi-decoder');
const basePath = process.cwd();
const {
  etherscanApiKey,
  participantAddresses,
  contractAddress
} = require(`${basePath}/config.js`);


function accountUrl(type, address) {
  return `
    https://api.etherscan.io/api
     ?module=account
     &action=${type}
     &address=${address}
     &startblock=0
     &endblock=99999999
     &page=1
     &sort=desc
     &apikey=${etherscanApiKey}
  `.replace(/\s/g, '')
}


function abiUrl(address) {
  return `
  https://api.etherscan.io/api
    ?module=contract
    &action=getabi
    &address=${'0x2cc846fff0b08fb3bffad71f53a60b4b6e6d6482'}
    &apikey=${etherscanApiKey}
  `.replace(/\s/g, '')
}


function formatValue(value, decimals=18) {
  decimals = Number(decimals);
  return Number(value)/10**decimals;
}


function filterContractAddress(array, address) {
  if (!address) return array;
  const finalArray = [];
  array.forEach(el => {
    const contractAddresses = Object.values(el.txs).map(x => x.contractAddress);
    if (contractAddresses.includes(contractAddress)) finalArray.push(el);
  });
  return finalArray;
}


async function parseTx(fullTx) {
  console.log('-----------------');
  console.log(`${moment(fullTx.timeStamp * 1000).fromNow()}...`);
  const txs = fullTx.txs;
  const txsKeys = Object.keys(txs);
  const txsValues = Object.values(txs);
  const hash = txsValues[0].hash;
  console.log(`https://etherscan.io/tx/${hash}`);

  if (txsKeys.includes('normal')) {
    const tx = txs.normal;
    value = formatValue(tx.value);
    if (tx.from.toLowerCase() === participantAddresses[0] && tx.functionName === '' && tx.input === '0x') {
      console.log(`💸➡️  Send ${value}eth to ${tx.to}`);
    } else if (tx.to.toLowerCase() === participantAddresses[0] && tx.functionName === '') {
      console.log(`⬅️ 💸 Receive ${value}eth from ${tx.from}`);
    } else if (tx.functionName.includes('setApprovalForAll')) {
      console.log(`👍👍 Set Approval for All...`);
    } else if (tx.functionName.includes('approve')) {
      console.log(`👍 Approve spend...`);
    } else if (tx.to.toLowerCase() === '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'.toLowerCase() && tx.functionName.includes('commit')) {
      console.log(`💦 Request to Register ENS Domain`);
    } else if (tx.to.toLowerCase() === '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'.toLowerCase() && tx.functionName.includes('registerWithConfig')) {
      console.log(`💦 Register ENS Domain`);
    } else if (txsKeys.includes('erc721')) {
      const erc721tx = txs.erc721;
      if (tx.functionName === '') {
        console.log(`💎🛒 NFT buy! Bought ${erc721tx.tokenName} ${erc721tx.tokenID} for ${value} eth`);
      } else if (tx.functionName.includes('matchBidWithTakerAsk')) {
        console.log(`💎💸 NFT sale! Sold ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(txs.erc20.value)} weth on LooksRare`);
      } else if (tx.functionName === 'fulfillAvailableAdvancedOrders(tuple[] advancedOrders, tuple[] criteriaResolvers, tuple[][] offerFulfillments, tuple[][] considerationFulfillments, bytes32 fulfillerConduitKey, address recipient, uint256 maximumFulfilled)') {
        console.log(`💎💸 NFT sale! Sold ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Opensea`);
      } else if (tx.functionName.includes('safeTransferFrom')) {
        console.log(`💎➡️  NFT transfer. Transferred ${erc721tx.tokenName} ${erc721tx.tokenID} to ${erc721tx.to}`);
      } else {
        console.log('⭕️💎 OTHER ERC721...');
        console.log(txs);
      }
    } else if (txsKeys.includes('erc20')) {
      const erc20 = txs.erc20;
      const internal = txs.internal;
      if (tx.functionName.includes('swap')) {
        console.log(`🪙🛒 Token buy! Bought ${formatValue(erc20.value)} ${erc20.tokenName} for ${value}eth`);
      } else if (tx.functionName === 'execute(bytes commands,bytes[] inputs,uint256 deadline)') {
        if (internal) {
          console.log(`🪙💸 Token sale! Sold ${formatValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} for ${formatValue(internal.value)}eth`);
        } else {
          console.log(`🪙🔄 Token swap...`);
          // console.log(txs);
          // const abi = await axios.get(abiUrl('0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad')).then(res => res.data.result);
          // console.log(abi);
          // abiDecoder.addABI(JSON.parse(abi));
          // console.log(tx.input);
          // const decoded = abiDecoder.decodeMethod(tx.input);
          // console.log(decoded);
        }
      } else if (tx.functionName.includes('transfer')) {
        console.log(`🪙➡️  Token transfer. Transferred ${formatValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} to ${erc20.to}`);
      } else {
        console.log('⭕️🪙 OTHER ERC20...');
      }
      // console.log(txs);
    } else if (tx.functionName === 'deposit()' && tx.to.toLowerCase() == '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase()) {
      console.log(`↪️  Wrap ${value} ETH to WETH`); //amount in decoded tx.input
    } else if (tx.functionName === 'withdraw(uint256 amount)' && tx.to.toLowerCase() == '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase()) {
      console.log(`↩️  Unwrap WETH to ETH`); //amount in decoded tx.input
    } else if (tx.functionName === 'withdraw(uint256 amount)' && tx.to.toLowerCase() == '0x0000000000a39bb272e79075ade125fd351887ac'.toLowerCase()) {
      console.log(`Withdraw from Blur`);
    } else {
      console.log('⭕️ OTHER NORMAL..');
      console.log(txs);
    }
  } else {
    console.log('❌ NO NORMAL TXS...');
    if (txsKeys.includes('erc20')) {
      const erc20 = txs.erc20;
      console.log(`🪙➡️  Token receival. Received ${formatValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} from ${erc20.from}`);
    } else if (txsKeys.includes('erc721')) {
      console.log('💎');
      console.log(txs);
    } else if (txsKeys.includes('erc1155')) {
      console.log('💎💎');
      console.log(txs);
    }
  }
}


async function txsForSingleAddress(address) {
  const normalTransactions = await axios.get(accountUrl('txlist', address)).then(res => {
    const txs = res.data.result;
    txs.forEach(tx => tx.type = 'normal');
    return txs;
  });
  const internalTransactions = await axios.get(accountUrl('txlistinternal', address)).then(res => {
    const txs = res.data.result;
    txs.forEach(tx => tx.type = 'internal')
    return txs;
  });
  const erc20Transactions = await axios.get(accountUrl('tokentx', address)).then(res => {
    const txs = res.data.result;
    txs.forEach(tx => tx.type = 'erc20')
    return txs;
  });
  const erc721Transactions = await axios.get(accountUrl('tokennfttx', address)).then(res => {
    const txs = res.data.result;
    txs.forEach(tx => tx.type = 'erc721')
    return txs;
  });
  const erc1155Transactions = await axios.get(accountUrl('token1155tx', address)).then(res => {
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

  const txHashes = [...new Set(transactions.map(tx => tx.hash))];
  const txArray = [];
  txHashes.forEach(hash => {
    const txs = transactions.filter(tx => tx.hash === hash);
    const txsObject = {};
    txs.forEach(tx => txsObject[tx.type] = tx);
    const timeStamp = Number(txs[0].timeStamp);
    txArray.push({
      hash: hash,
      timeStamp: timeStamp,
      txs: txsObject
    })
  });

  return txArray;
}


async function getEtherscanData() {
  let txArray = [];
  for (const participantAddress of participantAddresses) {
    const txArray1 = await txsForSingleAddress(participantAddress);
    txArray = txArray.concat(txArray1);
  };

  // txArray = txArray.filter(tx => tx.hash === '0x9f3953cb2b307e0a2dcd2b22ff3cb157808f8fa1f54e4574e989d83ce0139a9e')

  txArray = filterContractAddress(txArray, contractAddress);
  txArray = txArray.sort((b, a) => Number(b.timeStamp) - Number(a.timeStamp));

  txArray.forEach(tx => parseTx(tx));
}


getEtherscanData()
