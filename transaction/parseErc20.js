const axios = require('axios');
const decoder = require(`./decoder.js`);
const { formatValue, formatValueRaw, formatLargeValue, shortAddr } = require(`../helper.js`);
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


async function parseDecodedArray(array, erc20, pnl, erc20InfoObj) {
  let buyAmount = 0;
  let sellAmount = 0;
  let swapFrom, swapTo, addressFrom, addressTo;
  const tokenInfo = erc20InfoObj[erc20.contractAddress];

  if (array.length === 2 && erc20InfoObj[array[0].path[1].toLowerCase()]?.address === WETH_ADDRESS && erc20InfoObj[array[1].path[0].toLowerCase()]?.address === WETH_ADDRESS) {
    sellAmount += Number(array[0].amountIn);
    buyAmount += Number(array[1].amountOut);
    addressFrom = array[0].path[0].toLowerCase();
    addressTo = array[1].path.at(-1).toLowerCase();
    swapFrom = erc20InfoObj[addressFrom] || { name: shortAddr(addressFrom), address: addressFrom };
    swapTo = erc20InfoObj[addressTo] || { name: shortAddr(addressTo), address: addressTo };
  }
  else if (array.length === 2 && array[0].path.at(-1).toLowerCase() === array[1].path[0].toLowerCase()) {
    // node user.js -u=x3e9D24b9a83d4Cb144D01594F437a9b94CCC8d60 -a=xd4074c1e48e11615fd1cfe8cbe691f5ab944aaa6
    // node user.js -u=xd295ccf0ccd19b41dfb9b78e02eace3d7ec85be7 -a=xda7c0810ce6f8329786160bb3d1734cf6661ca6e
    sellAmount += Number(array[0].amountIn);
    buyAmount += Number(array[1].amountOut);
    addressFrom = array[0].path[0].toLowerCase();
    addressTo = array[1].path.at(-1).toLowerCase();
    swapFrom = erc20InfoObj[addressFrom] || { name: shortAddr(addressFrom), address: addressFrom };
    swapTo = erc20InfoObj[addressTo] || { name: shortAddr(addressTo), address: addressTo };
  }
  else if (array.length > 2 && array[0].path.at(-1).toLowerCase() === array[1].path[0].toLowerCase()) {
    // node user.js -u=xec471594d2e8496eac699d44bafc6f014033f4d6 -a=pepe
    sellAmount += Number(array[0].amountIn);
    buyAmount += Number(array[1].amountOut);
    addressFrom = array[0].path[0].toLowerCase();
    addressTo = array[1].path.at(-1).toLowerCase();
    swapFrom = erc20InfoObj[addressFrom] || { name: shortAddr(addressFrom), address: addressFrom };
    swapTo = erc20InfoObj[addressTo] || { name: shortAddr(addressTo), address: addressTo };
  }
  else {
    array.forEach(el => {
      buyAmount += Number(el.amountOut);
      sellAmount += Number(el.amountIn);
    });
    addressFrom = array[0].path[0].toLowerCase();
    addressTo = array[0].path.at(-1).toLowerCase();
    swapFrom = erc20InfoObj[addressFrom] || { name: shortAddr(addressFrom), address: addressFrom };
    swapTo = erc20InfoObj[addressTo] || { name: shortAddr(addressTo), address: addressTo };
  }

  if (buyAmount > 10**50) buyAmount = 0;
  if (sellAmount > 10**50) sellAmount = 0;

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


async function parseErc20(txs, finalObject, pnl, erc20InfoObj) {
  const erc20 = txs.erc20;
  if (txs.normal) {
    if (txs.normal.functionName === 'execute(bytes commands,bytes[] inputs,uint256 deadline)' || txs.normal.functionName === 'execute(bytes payload, bytes[] signatures)') {
      const decodedArray = decoder.decoder1(txs.normal.input);
      const parsed = await parseDecodedArray(decodedArray, erc20, pnl, erc20InfoObj);
      finalObject.type = parsed.type;
      finalObject.activity = parsed.activity;
    } else if (txs.normal.functionName === 'swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)') {
      const decodedArray = decoder.decoder2(txs.normal.input);
      const parsed = await parseDecodedArray(decodedArray, erc20, pnl, erc20InfoObj);
      finalObject.type = parsed.type;
      finalObject.activity = parsed.activity;
    } else if (txs.normal.functionName === 'swapTokensForExactTokens(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline)') {
      const decodedArray = decoder.decoder3b(txs.normal.input);
      const parsed = await parseDecodedArray(decodedArray, erc20, pnl, erc20InfoObj);
      finalObject.type = parsed.type;
      finalObject.activity = parsed.activity;
    } else if (txs.normal.functionName === 'swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline)' || txs.normal.functionName === 'swapETHForExactTokens(uint256 amountOut, address[] path, address to, uint256 deadline)') {
      finalObject.type = 'buy';
      const unitPriceEth = formatValueRaw(txs.normal.value)/formatValueRaw(erc20.value, erc20.tokenDecimal);
      const mcap = unitPriceEth * ethInUsd * erc20InfoObj[erc20.contractAddress]?.totalSupply;
      finalObject.activity = `🪙🟢 Token BUY. ${formatValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} for ${formatLargeValue(txs.normal.value, 18)} ETH ($${formatLargeValue(mcap)} Mcap)`;
      pnl.push({ contractAddress: erc20.contractAddress, type: 'buy', amount: formatValueRaw(txs.normal.value) })
    } else if (txs.normal.functionName === 'swapTokensForExactETH(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline)') {
      finalObject.type = 'sell';
      const decodedArray = decoder.decoder3(txs.normal.input);
      const ethReceived = decodedArray[0].amountIn;
      const unitPriceEth = formatValueRaw(ethReceived)/formatValueRaw(erc20.value, erc20.tokenDecimal);
      const mcap = unitPriceEth * ethInUsd * erc20InfoObj[erc20.contractAddress]?.totalSupply;
      finalObject.activity = `🪙🔴 Token SALE. ${formatValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} for ${formatLargeValue(ethReceived, 18)} ETH ($${formatLargeValue(mcap)} Mcap)`;
      pnl.push({ contractAddress: erc20.contractAddress, type: 'sell', amount: formatValueRaw(ethReceived) })
    } else if (txs.normal.functionName === 'swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)') {
      finalObject.type = 'sell';
      const decodedArray = decoder.decoder3(txs.normal.input);
      const ethReceived = decodedArray[0].amountOut;
      const unitPriceEth = formatValueRaw(ethReceived)/formatValueRaw(erc20.value, erc20.tokenDecimal);
      const mcap = unitPriceEth * ethInUsd * erc20InfoObj[erc20.contractAddress]?.totalSupply;
      finalObject.activity = `🪙🔴 Token SALE. ${formatValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} for ${formatLargeValue(ethReceived, 18)} ETH ($${formatLargeValue(mcap)} Mcap)`;
      pnl.push({ contractAddress: erc20.contractAddress, type: 'sell', amount: formatValueRaw(ethReceived) })
    } else if (txs.normal.functionName === 'swap(address executor,tuple desc,bytes permit,bytes data)' && formatValueRaw(txs.normal.value) > 0) {
      // NOTE: scribbs bitcoin block-17894662
      const unitPriceEth = formatValueRaw(txs.normal.value)/formatValueRaw(erc20.value, erc20.tokenDecimal);
      const mcap = unitPriceEth * ethInUsd * erc20InfoObj[erc20.contractAddress]?.totalSupply;
      finalObject.activity = `🪙🟢 Token BUY. ${formatValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} for ${formatLargeValue(txs.normal.value, 18)} ETH ($${formatLargeValue(mcap)} Mcap)`;
      pnl.push({ contractAddress: erc20.contractAddress, type: 'buy', amount: formatValueRaw(txs.normal.value) })
    } else if (txs.normal.functionName.includes('transfer')) {
      finalObject.activity = `🪙➡️  Token TRANSFER. ${formatLargeValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} to ${shortAddr(erc20.to)}`;
    } else if (txs.normal.functionName.includes('addLiquidity')) {
      finalObject.activity = `🪙💧 Add token LIQUIDITY.`;
    } else if (txs.normal.functionName.includes('removeLiquidity')) {
      finalObject.activity = `🪙💧❌ Remove token LIQUIDITY.`;
    } else {
      finalObject.activity = '🪙 OTHER ERC20...';
    }
  } else {
    if (true) {
      finalObject.activity = `🪙➡️  Token RECEIVE. ${formatLargeValue(erc20.value, erc20.tokenDecimal)} ${erc20.tokenName} from ${shortAddr(erc20.from)}`;
    } else {
      finalObject.activity = '🪙 OTHER NO NORMAL ERC20...';
    }
  }
}


module.exports = {
    parseErc20
}
