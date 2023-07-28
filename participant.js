const axios = require('axios');
const argv = require('minimist')(process.argv.slice(2));
const basePath = process.cwd();
// const { participantAddresses, contractAddress } = require(`${basePath}/config.js`);
const { decodeExecute } = require(`${basePath}/universalDecoder.js`);
const addresses = require(`${basePath}/addresses.js`);
const {
  accountUrl,
  abiUrl,
  round,
  formatValue,
  formatValueRaw,
  formatTimestamp,
} = require(`${basePath}/helper.js`);

const participantAddresses = addresses.inputP[argv.p];
const contractAddress = addresses.inputA[argv.a];
const transactionHash = addresses.inputH[argv.h];


function filterContractAddress(array, address) {
  if (!address) return array;
  const finalArray = [];
  array.forEach(el => {
    const contractAddresses = Object.values(el.txs).map(x => x.contractAddress);
    if (contractAddresses.includes(contractAddress)) finalArray.push(el);
  });
  return finalArray;
}


function parseDecodedArray(array, erc20, pnl) {
  const { addressLib } = addresses;
  // console.log(array);
  let buyAmount = 0;
  let sellAmount = 0;
  let swapFrom, swapTo;

  if (array.length === 2 && addressLib[array[0].path[1].toLowerCase()].name === 'WETH' && addressLib[array[1].path[0].toLowerCase()].name === 'WETH') {
    sellAmount += Number(array[0].amountIn);
    buyAmount += Number(array[1].amountOut);
    swapFrom = addressLib[array[0].path[0].toLowerCase()] || { name: array[0].path[0] };
    swapTo = addressLib[array[1].path.at(-1).toLowerCase()] || { name: array[1].path.at(-1) };
  }
  else {
    array.forEach(el => {
      buyAmount += Number(el.amountOut);
      sellAmount += Number(el.amountIn);
    });
    let swapPath = array[0].path;
    swapFrom = addressLib[swapPath[0].toLowerCase()] || { name: swapPath[0] };
    swapTo = addressLib[swapPath.at(-1).toLowerCase()] || { name: swapPath.at(-1) };
  }

  if (swapFrom.name === 'WETH') {
    pnl.wethOut += formatValueRaw(sellAmount)
    pnl.shitIn += formatValueRaw(buyAmount, erc20.tokenDecimal)
    console.log(`🪙🛒 Token buy! Bought ${formatValue(buyAmount, erc20.tokenDecimal)} ${swapTo.name} for ${formatValue(sellAmount)} ${swapFrom.name}`);
  } else if (swapTo.name === 'WETH') {
    pnl.wethIn += formatValueRaw(buyAmount)
    pnl.shitOut += formatValueRaw(sellAmount, erc20.tokenDecimal)
    console.log(`🪙💸 Token sale! Sold ${formatValue(sellAmount, erc20.tokenDecimal)} ${swapFrom.name} for ${formatValue(buyAmount)} ${swapTo.name}`);
  } else {
    console.log(`🪙💸 Swap ${formatValue(sellAmount)} ${swapFrom.name} to ${formatValue(buyAmount, swapTo.decimals)} ${swapTo.name}`);
  }
}


function formatPnl(pnl) {
  // const shitInEth = 0.00002254; //bitcoin
  const shitInEth = 0.00000000097097; //pepe
  const ethInUsd = 1850;

  const wethFinal = pnl.wethIn - pnl.wethOut;
  pnl.wethFinal = formatValue(wethFinal, 0);
  pnl.wethFinalInUsd = formatValue(wethFinal * ethInUsd, 0);

  const shitFinal = pnl.shitIn - pnl.shitOut;
  pnl.shitFinal = formatValue(shitFinal, 0);
  const shitFinalInEth = shitFinal * shitInEth;
  pnl.shitFinalInUsd = formatValue(shitFinalInEth * ethInUsd, 0);

  const pnlInEth = shitFinalInEth + wethFinal;
  const pnlInUsd = pnlInEth * ethInUsd;
  pnl.pnlInEth = formatValue(pnlInEth, 0);
  pnl.pnlInUsd = formatValue(pnlInUsd, 0);

  pnl.wethOut = formatValue(pnl.wethOut, 0);
  pnl.wethIn = formatValue(pnl.wethIn, 0);
  pnl.shitOut = formatValue(pnl.shitOut, 0);
  pnl.shitIn = formatValue(pnl.shitIn, 0);

  console.log('=================================')
  console.log(`ETH invested --> ${pnl.wethOut} eth`);
  console.log(`ETH taken out --> ${pnl.wethIn} eth`);
  console.log(`Shitcoins bought --> ${pnl.shitIn}`);
  console.log(`Shitcoins sold --> ${pnl.shitOut}`);
  console.log('---');
  console.log(`ETH PnL --> ${pnl.wethFinal > 0 ? '+' : ''}${pnl.wethFinal} eth ($${pnl.wethFinalInUsd})`);
  console.log(`Shitcoin PnL --> ${pnl.shitFinal > 0 ? '+' : ''}${pnl.shitFinal} ($${pnl.shitFinalInUsd})`);
  console.log('---');
  console.log(`PnL --> ${pnlInUsd > 0 ? '+' : ''}$${pnl.pnlInUsd}`);
  console.log('=================================')
}


async function parseTx(fullTx, pnl) {
  console.log('-----------------');
  formatTimestamp(fullTx.timeStamp);
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
      if (tx.functionName.includes('swap(')) {
        pnl.wethOut += formatValueRaw(tx.value);
        pnl.shitIn += formatValueRaw(erc20.value);
        console.log(`🪙🛒 Token buy! Bought ${formatValue(erc20.value)} ${erc20.tokenName} for ${value}eth`);
      } else if (tx.functionName === 'execute(bytes commands,bytes[] inputs,uint256 deadline)') {
        const decodedArray = decodeExecute(tx.input);
        // console.log(txs);
        parseDecodedArray(decodedArray, erc20, pnl);
      } else if (tx.functionName.includes('transfer')) {
        console.log(`🪙➡️  Token transfer. Transferred ${formatValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} to ${erc20.to}`);
      } else {
        console.log('⭕️🪙 OTHER ERC20...');
      }
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

  if (transactionHash) txArray = txArray.filter(el => el.hash === transactionHash)
  txArray = filterContractAddress(txArray, contractAddress);
  txArray = txArray.sort((b, a) => Number(b.timeStamp) - Number(a.timeStamp));

  const pnl = { wethOut: 0, wethIn: 0, shitOut: 0, shitIn: 0 }
  if (txArray.length > 0) txArray.forEach(tx => parseTx(tx, pnl));
  else console.log('NO TRANSACTIONS FOUND...!');
  formatPnl(pnl)
}


getEtherscanData()
