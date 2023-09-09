const axios = require('axios');
const basePath = process.cwd();
const decoder = require(`./decoder.js`);
const { formatValue, formatValueRaw, formatTimestamp, formatLargeValue, shortAddr, parseErc721 } = require(`${basePath}/helper.js`);
const ethInUsd = 1669; // TODO: make dynamic depending on eth price that day
const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'.toLowerCase();


async function logFetch(erc20) {
  console.log(`log fetch ${erc20.hash}...`);
  const url = `
    https://api.etherscan.io/api
     ?module=logs
     &action=getLogs
     &fromBlock=${erc20.blockNumber}
     &toBlock=${erc20.blockNumber}
     &address=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
     &topic0=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
     &page=1
     &offset=1000
     &apikey=I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG
  `.replace(/\s/g, '');
  const logs = await axios.get(url).then(res => res.data);
  const filteredLog = logs.result.filter(l => l.transactionHash === erc20.hash);
  const datas = [...new Set(filteredLog.map(l => l.data))];
  let decodedEth = 0;
  datas.forEach(data => decodedEth += Number(decoder.logDecoder(data)));
  return decodedEth;
}


async function parseDecodedArray(array, erc20, pnl, tokenInfoObj) {
  let buyAmount = 0;
  let sellAmount = 0;
  let swapFrom, swapTo, addressFrom, addressTo;
  const tokenInfo = tokenInfoObj[erc20.contractAddress];

  if (array.length === 2 && tokenInfoObj[array[0].path[1].toLowerCase()]?.address === WETH_ADDRESS && tokenInfoObj[array[1].path[0].toLowerCase()]?.address === WETH_ADDRESS) {
    sellAmount += Number(array[0].amountIn);
    buyAmount += Number(array[1].amountOut);
    addressFrom = array[0].path[0].toLowerCase();
    addressTo = array[1].path.at(-1).toLowerCase();
    swapFrom = tokenInfoObj[addressFrom] || { name: shortAddr(addressFrom), address: addressFrom };
    swapTo = tokenInfoObj[addressTo] || { name: shortAddr(addressTo), address: addressTo };
  }
  else if (array.length === 2 && array[0].path.at(-1).toLowerCase() === array[1].path[0].toLowerCase()) {
    // node user.js -u=x3e9D24b9a83d4Cb144D01594F437a9b94CCC8d60 -a=xd4074c1e48e11615fd1cfe8cbe691f5ab944aaa6
    // node user.js -u=xd295ccf0ccd19b41dfb9b78e02eace3d7ec85be7 -a=xda7c0810ce6f8329786160bb3d1734cf6661ca6e
    sellAmount += Number(array[0].amountIn);
    buyAmount += Number(array[1].amountOut);
    addressFrom = array[0].path[0].toLowerCase();
    addressTo = array[1].path.at(-1).toLowerCase();
    swapFrom = tokenInfoObj[addressFrom] || { name: shortAddr(addressFrom), address: addressFrom };
    swapTo = tokenInfoObj[addressTo] || { name: shortAddr(addressTo), address: addressTo };
  }
  else {
    array.forEach(el => {
      buyAmount += Number(el.amountOut);
      sellAmount += Number(el.amountIn);
    });
    addressFrom = array[0].path[0].toLowerCase();
    addressTo = array[0].path.at(-1).toLowerCase();
    swapFrom = tokenInfoObj[addressFrom] || { name: shortAddr(addressFrom), address: addressFrom };
    swapTo = tokenInfoObj[addressTo] || { name: shortAddr(addressTo), address: addressTo };
  }

  if (swapFrom.address === WETH_ADDRESS) {
    pnl.push({ contractAddress: erc20.contractAddress, type: 'buy', amount: formatValueRaw(sellAmount) })
    const unitPriceEth = formatValueRaw(sellAmount)/formatValueRaw(buyAmount, erc20.tokenDecimal);
    const mcap = unitPriceEth * ethInUsd * tokenInfo?.totalSupply;
    return {
      type: 'buy',
      activity: `🪙🟢 Token BUY. ${formatLargeValue(buyAmount, erc20.tokenDecimal)} ${swapTo.name} for ${formatValue(sellAmount)} ${swapFrom.name} ($${formatLargeValue(mcap)} Mcap)`
    }
  } else if (swapTo.address === WETH_ADDRESS) {
    const unitPriceEth = formatValueRaw(buyAmount)/formatValueRaw(sellAmount, erc20.tokenDecimal);
    const mcap = unitPriceEth * ethInUsd * tokenInfo?.totalSupply;
    pnl.push({ contractAddress: erc20.contractAddress, type: 'sell', amount: formatValueRaw(buyAmount) })
    return {
      type: 'sell',
      activity: `🪙🔴 Token SALE. ${formatLargeValue(sellAmount, erc20.tokenDecimal)} ${swapFrom.name} for ${formatValue(buyAmount)} ${swapTo.name} ($${formatLargeValue(mcap)} Mcap)`
    }
  } else if (array[0].path.length > 2 && array[0].path.map(x => x.toLowerCase()).includes(WETH_ADDRESS)) {
    const swappedEth = await logFetch(erc20);
    const unitPriceEthSale = formatValueRaw(swappedEth)/formatValueRaw(sellAmount, swapFrom.decimals);
    const mcapSale = unitPriceEthSale * ethInUsd * swapFrom?.totalSupply;
    const unitPriceEthBuy = formatValueRaw(swappedEth)/formatValueRaw(buyAmount, swapTo.decimals);
    const mcapBuy = unitPriceEthBuy * ethInUsd * swapTo?.totalSupply;
    pnl.push({ contractAddress: addressFrom, type: 'sell', amount: formatValueRaw(swappedEth) });
    pnl.push({ contractAddress: addressTo, type: 'buy', amount: formatValueRaw(swappedEth) });
    return {
      type: 'swap',
      activity: `🪙🔴 Token SALE. ${formatLargeValue(sellAmount, swapFrom.decimals)} ${swapFrom.name} for ${formatValue(swappedEth)} ETH ($${formatLargeValue(mcapSale)} Mcap) \n🪙🟢 Token BUY. ${formatLargeValue(buyAmount, swapTo.decimals)} ${swapTo.name} for ${formatValue(swappedEth)} ETH ($${formatLargeValue(mcapBuy)} Mcap)`
    }
  } else {
    return {
      type: 'swap',
      activity: `🪙🟠 Swap ${formatLargeValue(sellAmount, swapFrom.decimals)} ${swapFrom.name} to ${formatLargeValue(buyAmount, swapTo.decimals)} ${swapTo.name}`
    }
  }
}


async function parseErc20(txs, tx, finalObject, pnl, tokenInfoObj) {
  console.log(txs);
  const erc20 = txs.erc20;
  if (tx.functionName === 'execute(bytes commands,bytes[] inputs,uint256 deadline)') {
    const decodedArray = decoder.decoder1(tx.input);
    const parsed = await parseDecodedArray(decodedArray, erc20, pnl, tokenInfoObj);
    finalObject.type = parsed.type;
    finalObject.activity = parsed.activity;
  } else if (tx.functionName === 'swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)') {
    const decodedArray = decoder.decoder2(tx.input);
    const parsed = await parseDecodedArray(decodedArray, erc20, pnl, tokenInfoObj);
    finalObject.type = parsed.type;
    finalObject.activity = parsed.activity;
  } else if (tx.functionName === 'swapTokensForExactTokens(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline)') {
    const decodedArray = decoder.decoder3b(tx.input);
    const parsed = await parseDecodedArray(decodedArray, erc20, pnl, tokenInfoObj);
    finalObject.type = parsed.type;
    finalObject.activity = parsed.activity;
  } else if (tx.functionName === 'swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline)' || tx.functionName === 'swapETHForExactTokens(uint256 amountOut, address[] path, address to, uint256 deadline)') {
    finalObject.type = 'buy';
    const unitPriceEth = formatValueRaw(tx.value)/formatValueRaw(erc20.value, erc20.tokenDecimal);
    const mcap = unitPriceEth * ethInUsd * tokenInfoObj[erc20.contractAddress]?.totalSupply;
    finalObject.activity = `🪙🟢 Token BUY. ${formatValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} for ${formatLargeValue(tx.value, 18)} ETH ($${formatLargeValue(mcap)} Mcap)`;
    pnl.push({ contractAddress: erc20.contractAddress, type: 'buy', amount: formatValueRaw(tx.value) })
  } else if (tx.functionName === 'swapTokensForExactETH(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline)') {
    finalObject.type = 'sell';
    const decodedArray = decoder.decoder3(tx.input);
    const ethReceived = decodedArray[0].amountIn;
    const unitPriceEth = formatValueRaw(ethReceived)/formatValueRaw(erc20.value, erc20.tokenDecimal);
    const mcap = unitPriceEth * ethInUsd * tokenInfoObj[erc20.contractAddress]?.totalSupply;
    finalObject.activity = `🪙🔴 Token SALE. ${formatValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} for ${formatLargeValue(ethReceived, 18)} ETH ($${formatLargeValue(mcap)} Mcap)`;
    pnl.push({ contractAddress: erc20.contractAddress, type: 'sell', amount: formatValueRaw(ethReceived) })
  } else if (tx.functionName === 'swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)') {
    finalObject.type = 'sell';
    const decodedArray = decoder.decoder3(tx.input);
    const ethReceived = decodedArray[0].amountOut;
    const unitPriceEth = formatValueRaw(ethReceived)/formatValueRaw(erc20.value, erc20.tokenDecimal);
    const mcap = unitPriceEth * ethInUsd * tokenInfoObj[erc20.contractAddress]?.totalSupply;
    finalObject.activity = `🪙🔴 Token SALE. ${formatValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} for ${formatLargeValue(ethReceived, 18)} ETH ($${formatLargeValue(mcap)} Mcap)`;
    pnl.push({ contractAddress: erc20.contractAddress, type: 'sell', amount: formatValueRaw(ethReceived) })
  } else if (tx.functionName === 'swap(address executor,tuple desc,bytes permit,bytes data)' && formatValueRaw(tx.value) > 0) {
    // NOTE: scribbs bitcoin block-17894662
    const unitPriceEth = formatValueRaw(tx.value)/formatValueRaw(erc20.value, erc20.tokenDecimal);
    const mcap = unitPriceEth * ethInUsd * tokenInfoObj[erc20.contractAddress]?.totalSupply;
    finalObject.activity = `🪙🟢 Token BUY. ${formatValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} for ${formatLargeValue(tx.value, 18)} ETH ($${formatLargeValue(mcap)} Mcap)`;
    pnl.push({ contractAddress: erc20.contractAddress, type: 'buy', amount: formatValueRaw(tx.value) })
  } else if (tx.functionName.includes('transfer')) {
    finalObject.activity = `🪙➡️  Token TRANSFER. ${formatLargeValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} to ${shortAddr(erc20.to)}`;
  } else if (tx.functionName.includes('addLiquidity')) {
    finalObject.activity = `🪙💧 Add token LIQUIDITY.`;
  } else if (tx.functionName.includes('removeLiquidity')) {
    finalObject.activity = `🪙💧❌ Remove token LIQUIDITY.`;
  } else {
    finalObject.activity = '🪙 OTHER ERC20...';
  }
}


async function parseTx(fullTx, userAddresses, pnl, tokenInfoObj) {
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
      await parseErc20(txs, txs.normal, finalObject, pnl, tokenInfoObj);
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
      finalObject.activity = `⬅️ 🪙 RECEIVE ${formatLargeValue(txs.erc20.value, txs.erc20.tokenDecimal)} ${txs.erc20.tokenName} from ${shortAddr(txs.erc20.from)}`;
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


// FIXME:
// node user.js -u=artchick -a=xb69753c06bb5c366be51e73bfc0cc2e3dc07e371
