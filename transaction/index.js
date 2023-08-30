const basePath = process.cwd();
const decoder = require(`./decoder.js`);
const { formatValue, formatValueRaw, formatTimestamp, formatLargeValue, shortAddr, parseErc721 } = require(`${basePath}/helper.js`);
const ethInUsd = 1669; // TODO: make dynamic depending on eth price that day
const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'.toLowerCase();


function parseDecodedArray(array, erc20, pnl, tokenInfoObj) {
  let buyAmount = 0;
  let sellAmount = 0;
  let swapFrom, swapTo;
  const tokenInfo = tokenInfoObj[erc20.contractAddress];

  if (array.length === 2 && tokenInfoObj[array[0].path[1].toLowerCase()]?.name === 'WETH' && tokenInfoObj[array[1].path[0].toLowerCase()]?.name === 'WETH') {
    sellAmount += Number(array[0].amountIn);
    buyAmount += Number(array[1].amountOut);
    swapFrom = tokenInfo || { name: shortAddr(array[0].path[0]) };
    swapTo = tokenInfo || { name: shortAddr(array[1].path.at(-1)) };
  }
  else {
    array.forEach(el => {
      buyAmount += Number(el.amountOut);
      sellAmount += Number(el.amountIn);
    });
    let outAddress = array[0].path[0].toLowerCase();
    let inAddress = array[0].path.at(-1).toLowerCase();
    swapFrom = tokenInfoObj[outAddress] || { name: shortAddr(outAddress) };
    swapTo = tokenInfoObj[inAddress]  || { name: shortAddr(inAddress) };
  }

  if (swapFrom.address.toLowerCase() === WETH_ADDRESS) {
    pnl.push({ contractAddress: erc20.contractAddress, type: 'buy', amount: formatValueRaw(sellAmount) })
    const unitPriceEth = formatValueRaw(sellAmount)/formatValueRaw(buyAmount, erc20.tokenDecimal);
    const mcap = unitPriceEth * ethInUsd * tokenInfo.totalSupply;
    return {
      type: 'buy',
      activity: `🪙🟢 Token BUY. ${formatLargeValue(buyAmount, erc20.tokenDecimal)} ${swapTo.name} for ${formatValue(sellAmount)} ${swapFrom.name} ($${formatLargeValue(mcap)} Mcap)`
    }
  } else if (swapTo.address.toLowerCase() === WETH_ADDRESS) {
    const unitPriceEth = formatValueRaw(buyAmount)/formatValueRaw(sellAmount, erc20.tokenDecimal);
    const mcap = unitPriceEth * ethInUsd * tokenInfo.totalSupply;
    pnl.push({ contractAddress: erc20.contractAddress, type: 'sell', amount: formatValueRaw(buyAmount) })
    return {
      type: 'sell',
      activity: `🪙🔴 Token SALE. ${formatLargeValue(sellAmount, erc20.tokenDecimal)} ${swapFrom.name} for ${formatValue(buyAmount)} ${swapTo.name} ($${formatLargeValue(mcap)} Mcap)`
    }
  } else {
    return {
      type: 'swap',
      activity: `🪙🟠 Swap ${formatLargeValue(sellAmount, 18)} ${swapFrom.name} to ${formatValue(buyAmount, swapTo.decimals)} ${swapTo.name}`
    }
  }
}


function parseErc20(txs, tx, finalObject, pnl, tokenInfoObj) {
  const erc20 = txs.erc20;
  if (tx.functionName === 'execute(bytes commands,bytes[] inputs,uint256 deadline)') {
    const decodedArray = decoder.decoder1(tx.input);
    const parsed = parseDecodedArray(decodedArray, erc20, pnl, tokenInfoObj);
    finalObject.type = parsed.type;
    finalObject.activity = parsed.activity;
  } else if (tx.functionName === 'swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)') {
    const decodedArray = decoder.decoder2(tx.input);
    const parsed = parseDecodedArray(decodedArray, erc20, pnl, tokenInfoObj)
    finalObject.type = parsed.type;
    finalObject.activity = parsed.activity;
  } else if (tx.functionName === 'swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline)' || tx.functionName === 'swapETHForExactTokens(uint256 amountOut, address[] path, address to, uint256 deadline)') {
    finalObject.type = 'buy';
    const unitPriceEth = formatValueRaw(tx.value)/formatValueRaw(erc20.value, erc20.tokenDecimal);
    const mcap = unitPriceEth * ethInUsd * tokenInfoObj[erc20.contractAddress].totalSupply;
    finalObject.activity = `🪙🟢 Token BUY. ${formatValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} for ${formatLargeValue(tx.value, 18)} ETH ($${formatLargeValue(mcap)} Mcap)`;
    pnl.push({ contractAddress: erc20.contractAddress, type: 'buy', amount: formatValueRaw(tx.value) })
  } else if (tx.functionName === 'swapTokensForExactETH(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline)') {
    finalObject.type = 'sell';
    const decodedArray = decoder.decoder3(tx.input);
    const ethReceived = decodedArray[0].amountIn;
    const unitPriceEth = formatValueRaw(ethReceived)/formatValueRaw(erc20.value, erc20.tokenDecimal);
    const mcap = unitPriceEth * ethInUsd * tokenInfoObj[erc20.contractAddress].totalSupply;
    finalObject.activity = `🪙🔴 Token SALE. ${formatValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} for ${formatLargeValue(ethReceived, 18)} ETH ($${formatLargeValue(mcap)} Mcap)`;
    pnl.push({ contractAddress: erc20.contractAddress, type: 'sell', amount: formatValueRaw(ethReceived) })
  } else if (tx.functionName === 'swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)') {
    finalObject.type = 'sell';
    const decodedArray = decoder.decoder3(tx.input);
    const ethReceived = decodedArray[0].amountOut;
    const unitPriceEth = formatValueRaw(ethReceived)/formatValueRaw(erc20.value, erc20.tokenDecimal);
    const mcap = unitPriceEth * ethInUsd * tokenInfoObj[erc20.contractAddress].totalSupply;
    finalObject.activity = `🪙🔴 Token SALE. ${formatValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} for ${formatLargeValue(ethReceived, 18)} ETH ($${formatLargeValue(mcap)} Mcap)`;
    pnl.push({ contractAddress: erc20.contractAddress, type: 'sell', amount: formatValueRaw(ethReceived) })
  } else if (tx.functionName.includes('transfer')) {
    finalObject.activity = `🪙➡️  Token TRANSFER. ${formatLargeValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} to ${shortAddr(erc20.to)}`;
  } else {
    finalObject.activity = '🪙 OTHER ERC20...';
  }
}


function parseTx(fullTx, userAddresses, pnl, tokenInfoObj) {
  const finalObject = {
    ago: formatTimestamp(fullTx.timeStamp),
    block: fullTx.block,
    userWallet: fullTx.userWallet
  };
  const txs = fullTx.txs;
  const txsKeys = Object.keys(txs);
  const txsValues = Object.values(txs);
  finalObject.tx = `https://etherscan.io/tx/${txsValues[0].hash}`;

  if (txsKeys.includes('normal')) {
    const tx = txs.normal;
    value = formatValue(tx.value);
    if (txsKeys.includes('erc721')) {
      parseErc721(txs, txs.normal, finalObject);
    } else if (txsKeys.includes('erc20')) {
      parseErc20(txs, txs.normal, finalObject, pnl, tokenInfoObj);
    } else if (tx.from.toLowerCase() === userAddresses[0] && tx.functionName === '' && tx.input === '0x') {
      finalObject.activity = `💸➡️  SEND ${value}eth to ${shortAddr(tx.to)}`;
    } else if (tx.to.toLowerCase() === userAddresses[0] && tx.functionName === '') {
      finalObject.activity = `⬅️ 💸 RECEIVE ${value}eth from ${shortAddr(tx.from)}`;
    } else if (tx.functionName.includes('setApprovalForAll')) {
      finalObject.activity = `👍👍 Set Approval for All...`
    } else if (tx.functionName.includes('approve')) {
      finalObject.activity = `👍 Approve spend...`;
    } else if (tx.to.toLowerCase() === '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'.toLowerCase() && tx.functionName.includes('commit')) {
      finalObject.activity = `💦 Request to Register ENS Domain`;
    } else if (tx.to.toLowerCase() === '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'.toLowerCase() && tx.functionName.includes('registerWithConfig')) {
      finalObject.activity = `💦 Register ENS Domain`;
    } else if (tx.functionName === 'deposit()' && tx.to.toLowerCase() == WETH_ADDRESS) {
      finalObject.activity = `↪️  Wrap ${value} ETH to WETH`; //amount in decoded tx.input
    } else if (tx.functionName === 'withdraw(uint256 amount)' && tx.to.toLowerCase() == WETH_ADDRESS) {
      finalObject.activity = `↩️  Unwrap WETH to ETH`; //amount in decoded tx.input
    } else if (tx.functionName === 'withdraw(uint256 amount)' && tx.to.toLowerCase() == '0x0000000000a39bb272e79075ade125fd351887ac'.toLowerCase()) {
      finalObject.activity = `Withdraw from Blur`;
    } else {
      finalObject.activity = 'OTHER NORMAL..';
    }
  } else {
    finalObject.activity = '❌ NO NORMAL TXS...';
    if (txsKeys.includes('erc20')) {
      finalObject.activity = `⬅️ 🪙 RECEIVE ${formatValue(txs.erc20.value, txs.erc20.tokenDecimal)} ${txs.erc20.tokenName} from ${shortAddr(txs.erc20.from)}`;
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
