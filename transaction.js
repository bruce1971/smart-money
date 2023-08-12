const basePath = process.cwd();
const { decodeExecute } = require(`${basePath}/universalDecoder.js`);
const addresses = require(`${basePath}/addresses.js`);
const { formatValue, formatValueRaw, formatTimestamp } = require(`${basePath}/helper.js`);


function parseDecodedArray(array, erc20, pnl) {
  const { addressLib } = addresses;
  let buyAmount = 0;
  let sellAmount = 0;
  let swapFrom, swapTo;

  if (array.length === 2 && addressLib[array[0].path[1].toLowerCase()]?.name === 'WETH' && addressLib[array[1].path[0].toLowerCase()]?.name === 'WETH') {
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


async function parseTx(fullTx, userAddresses, pnl) {
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
    if (tx.from.toLowerCase() === userAddresses[0] && tx.functionName === '' && tx.input === '0x') {
      console.log(`💸➡️  Send ${value}eth to ${tx.to}`);
    } else if (tx.to.toLowerCase() === userAddresses[0] && tx.functionName === '') {
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
        // console.log(txs);
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
    }
  } else {
    console.log('❌ NO NORMAL TXS...');
    if (txsKeys.includes('erc20')) {
      const erc20 = txs.erc20;
      console.log(`🪙➡️  Token receival. Received ${formatValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} from ${erc20.from}`);
    } else if (txsKeys.includes('erc721')) {
      console.log('💎');
    } else if (txsKeys.includes('erc1155')) {
      console.log('💎💎');
    }
  }
}


module.exports = {
    parseTx: parseTx,
    parseDecodedArray: parseDecodedArray
}
