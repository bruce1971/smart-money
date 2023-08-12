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
    return `🪙🛒 Token buy! Bought ${formatValue(buyAmount, erc20.tokenDecimal)} ${swapTo.name} for ${formatValue(sellAmount)} ${swapFrom.name}`;
  } else if (swapTo.name === 'WETH') {
    pnl.wethIn += formatValueRaw(buyAmount)
    pnl.shitOut += formatValueRaw(sellAmount, erc20.tokenDecimal)
    return `🪙💸 Token sale! Sold ${formatValue(sellAmount, erc20.tokenDecimal)} ${swapFrom.name} for ${formatValue(buyAmount)} ${swapTo.name}`;
  } else {
    return `🪙💸 Swap ${formatValue(sellAmount)} ${swapFrom.name} to ${formatValue(buyAmount, swapTo.decimals)} ${swapTo.name}`;
  }
}


async function parseTx(fullTx, userAddresses, pnl) {
  const finalObject = {
    ago: formatTimestamp(fullTx.timeStamp)
  };
  const txs = fullTx.txs;
  const txsKeys = Object.keys(txs);
  const txsValues = Object.values(txs);
  const hash = txsValues[0].hash;
  // return `https://etherscan.io/tx/${hash}`);

  if (txsKeys.includes('normal')) {
    const tx = txs.normal;
    value = formatValue(tx.value);
    if (tx.from.toLowerCase() === userAddresses[0] && tx.functionName === '' && tx.input === '0x') {
      finalObject.activity = `💸➡️  Send ${value}eth to ${tx.to}`;
    } else if (tx.to.toLowerCase() === userAddresses[0] && tx.functionName === '') {
      finalObject.activity = `⬅️ 💸 Receive ${value}eth from ${tx.from}`;
    } else if (tx.functionName.includes('setApprovalForAll')) {
      finalObject.activity = `👍👍 Set Approval for All...`;
    } else if (tx.functionName.includes('approve')) {
      finalObject.activity = `👍 Approve spend...`;
    } else if (tx.to.toLowerCase() === '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'.toLowerCase() && tx.functionName.includes('commit')) {
      finalObject.activity = `💦 Request to Register ENS Domain`;
    } else if (tx.to.toLowerCase() === '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'.toLowerCase() && tx.functionName.includes('registerWithConfig')) {
      finalObject.activity = `💦 Register ENS Domain`;
    } else if (txsKeys.includes('erc721')) {
      const erc721tx = txs.erc721;
      if (tx.functionName === '') {
        finalObject.activity = `💎🛒 NFT buy! Bought ${erc721tx.tokenName} ${erc721tx.tokenID} for ${value} eth`;
      } else if (tx.functionName.includes('matchBidWithTakerAsk')) {
        finalObject.activity = `💎💸 NFT sale! Sold ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(txs.erc20.value)} weth on LooksRare`;
      } else if (tx.functionName === 'fulfillAvailableAdvancedOrders(tuple[] advancedOrders, tuple[] criteriaResolvers, tuple[][] offerFulfillments, tuple[][] considerationFulfillments, bytes32 fulfillerConduitKey, address recipient, uint256 maximumFulfilled)') {
        finalObject.activity = `💎💸 NFT sale! Sold ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Opensea`;
      } else if (tx.functionName.includes('safeTransferFrom')) {
        finalObject.activity = `💎➡️  NFT transfer. Transferred ${erc721tx.tokenName} ${erc721tx.tokenID} to ${erc721tx.to}`;
      } else {
        finalObject.activity = '⭕️💎 OTHER ERC721...';
      }
    } else if (txsKeys.includes('erc20')) {
      const erc20 = txs.erc20;
      const internal = txs.internal;
      if (tx.functionName.includes('swap(')) {
        pnl.wethOut += formatValueRaw(tx.value);
        pnl.shitIn += formatValueRaw(erc20.value);
        finalObject.activity = `🪙🛒 Token buy! Bought ${formatValue(erc20.value)} ${erc20.tokenName} for ${value}eth`;
      } else if (tx.functionName === 'execute(bytes commands,bytes[] inputs,uint256 deadline)') {
        const decodedArray = decodeExecute(tx.input);
        finalObject.activity = parseDecodedArray(decodedArray, erc20, pnl);
      } else if (tx.functionName.includes('transfer')) {
        finalObject.activity = `🪙➡️  Token transfer. Transferred ${formatValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} to ${erc20.to}`;
      } else {
        finalObject.activity = '⭕️🪙 OTHER ERC20...';
      }
    } else if (tx.functionName === 'deposit()' && tx.to.toLowerCase() == '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase()) {
      finalObject.activity = `↪️  Wrap ${value} ETH to WETH`; //amount in decoded tx.input
    } else if (tx.functionName === 'withdraw(uint256 amount)' && tx.to.toLowerCase() == '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase()) {
      finalObject.activity = `↩️  Unwrap WETH to ETH`; //amount in decoded tx.input
    } else if (tx.functionName === 'withdraw(uint256 amount)' && tx.to.toLowerCase() == '0x0000000000a39bb272e79075ade125fd351887ac'.toLowerCase()) {
      finalObject.activity = `Withdraw from Blur`;
    } else {
      finalObject.activity = '⭕️ OTHER NORMAL..';
    }
  } else {
    finalObject.activity = '❌ NO NORMAL TXS...';
    if (txsKeys.includes('erc20')) {
      const erc20 = txs.erc20;
      finalObject.activity = `🪙➡️  Token receival. Received ${formatValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} from ${erc20.from}`;
    } else if (txsKeys.includes('erc721')) {
      finalObject.activity = '💎';
    } else if (txsKeys.includes('erc1155')) {
      finalObject.activity = '💎💎';
    }
  }

  return finalObject;
}


module.exports = {
    parseTx: parseTx,
    parseDecodedArray: parseDecodedArray
}
