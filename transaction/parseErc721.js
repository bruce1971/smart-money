const { formatValue, formatValueRaw, shortAddr } = require(`../helper.js`);

function parseErc721(txs, tx, finalObject, pnl, tokenInfoObj) {
  // console.log(txs);
  const erc721tx = txs.erc721;
  if (tx.functionName === '') {
    pnl.push({ contractAddress: erc721tx.contractAddress, type: 'buy', amount: formatValueRaw(value) });
    finalObject.activity = `💎🟢 NFT buy! Bought ${erc721tx.tokenName} ${erc721tx.tokenID} for ${value} eth`;
  } else if (tx.functionName.includes('matchBidWithTakerAsk')) {
    pnl.push({ contractAddress: erc721tx.contractAddress, type: 'sell', amount: formatValueRaw(txs.erc20.value) });
    finalObject.activity = `💎🔴 NFT sale! Sold ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(txs.erc20.value)} weth on LooksRare`;
  } else if (tx.functionName === 'fulfillOrder(tuple order, bytes32 fulfillerConduitKey)') {
    if (erc721tx.to === finalObject.userWallet) {
      pnl.push({ contractAddress: erc721tx.contractAddress, type: 'buy', amount: formatValueRaw(tx.value) });
      finalObject.activity = `💎🟢 NFT buy! Bought ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Opensea`;
    } else if (erc721tx.from === finalObject.userWallet) {
      pnl.push({ contractAddress: erc721tx.contractAddress, type: 'sell', amount: formatValueRaw(tx.value) });
      finalObject.activity = `💎🔴 NFT sale! Sold ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Opensea`;
    }
  } else if (tx.functionName === 'fulfillAvailableAdvancedOrders(tuple[] advancedOrders, tuple[] criteriaResolvers, tuple[][] offerFulfillments, tuple[][] considerationFulfillments, bytes32 fulfillerConduitKey, address recipient, uint256 maximumFulfilled)') {
    if (erc721tx.to === finalObject.userWallet) {
      pnl.push({ contractAddress: erc721tx.contractAddress, type: 'buy', amount: formatValueRaw(tx.value) });
      finalObject.activity = `💎🟢 NFT buy! Bought ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Opensea`;
    } else if (erc721tx.from === finalObject.userWallet) {
      pnl.push({ contractAddress: erc721tx.contractAddress, type: 'sell', amount: formatValueRaw(tx.value) });
      finalObject.activity = `💎🔴 NFT sale! Sold ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Opensea`;
    }
  } else if (tx.functionName === 'buyAndFree22457070633(uint256 amount)') {
    if (erc721tx.to === finalObject.userWallet) {
      pnl.push({ contractAddress: erc721tx.contractAddress, type: 'buy', amount: formatValueRaw(tx.value) });
      finalObject.activity = `💎🟢 NFT buy! Bought ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Opensea`;
    } else if (erc721tx.from === finalObject.userWallet) {
      pnl.push({ contractAddress: erc721tx.contractAddress, type: 'sell', amount: formatValueRaw(tx.value) });
      finalObject.activity = `💎🔴 NFT sale! Sold ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Opensea`;
    }
  } else if (tx.functionName === 'execute(tuple sell,tuple buy)') {
    if (erc721tx.to === finalObject.userWallet) {
      pnl.push({ contractAddress: erc721tx.contractAddress, type: 'buy', amount: formatValueRaw(tx.value) });
      finalObject.activity = `💎🟢 NFT buy! Bought ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Blur`;
    } else if (erc721tx.from === finalObject.userWallet) {
      pnl.push({ contractAddress: erc721tx.contractAddress, type: 'sell', amount: formatValueRaw(tx.value) });
      finalObject.activity = `💎🔴 NFT sale! Sold ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Blur`;
    }
  } else if (tx.functionName === 'bulkExecute(tuple[] executions)') {
    if (erc721tx.to === finalObject.userWallet) {
      pnl.push({ contractAddress: erc721tx.contractAddress, type: 'buy', amount: formatValueRaw(tx.value) });
      finalObject.activity = `💎🟢 NFT buy! Bought ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Blur`;
    } else if (erc721tx.from === finalObject.userWallet) {
      pnl.push({ contractAddress: erc721tx.contractAddress, type: 'sell', amount: formatValueRaw(tx.value) });
      finalObject.activity = `💎🔴 NFT sale! Sold ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Blur`;
      // FIXME: node user.js -u=scribbs -a=x6339e5e072086621540d0362c4e3cea0d643e114
    }
  } else if (tx.functionName === '0x9a2b8115()') {
    if (erc721tx.to === finalObject.userWallet) {
      pnl.push({ contractAddress: erc721tx.contractAddress, type: 'buy', amount: formatValueRaw(tx.value) });
      finalObject.activity = `💎🟢 NFT buy! Bought ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Blur`;
    } else if (erc721tx.from === finalObject.userWallet) {
      pnl.push({ contractAddress: erc721tx.contractAddress, type: 'sell', amount: formatValueRaw(tx.value) });
      finalObject.activity = `💎🔴 NFT sale! Sold ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Blur`;
    }
  } else if (tx.functionName === 'takeAskSingle(tuple inputs,bytes oracleSignature)') {
    if (erc721tx.to === finalObject.userWallet) {
      pnl.push({ contractAddress: erc721tx.contractAddress, type: 'buy', amount: formatValueRaw(tx.value) });
      finalObject.activity = `💎🟢 NFT buy! Bought ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Blur`;
    } else if (erc721tx.from === finalObject.userWallet) {
      pnl.push({ contractAddress: erc721tx.contractAddress, type: 'sell', amount: formatValueRaw(tx.value) });
      finalObject.activity = `💎🔴 NFT sale! Sold ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Blur`;
    }
  } else if (tx.functionName === 'takeAsk(tuple inputs,bytes oracleSignature)') {
    if (erc721tx.to === finalObject.userWallet) {
      pnl.push({ contractAddress: erc721tx.contractAddress, type: 'buy', amount: formatValueRaw(tx.value) });
      finalObject.activity = `💎🟢 NFT buy! Bought ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Blur`;
    } else if (erc721tx.from === finalObject.userWallet) {
      pnl.push({ contractAddress: erc721tx.contractAddress, type: 'sell', amount: formatValueRaw(tx.value) });
      finalObject.activity = `💎🔴 NFT sale! Sold ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Blur`;
    }
  } else if (tx.functionName.includes('safeTransferFrom')) {
    finalObject.activity = `💎➡️  NFT transfer. Transferred ${erc721tx.tokenName} ${erc721tx.tokenID} to ${shortAddr(erc721tx.to)}`;
  } else {
    finalObject.activity = '💎 OTHER ERC721...';
  }
}

module.exports = {
  parseErc721
}
