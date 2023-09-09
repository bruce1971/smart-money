const { formatValue, formatValueRaw, shortAddr } = require(`../helper.js`);

function parseErc721(txs, tx, finalObject, pnl, tokenInfoObj) {
  const erc721tx = txs.erc721;
  if (tx.functionName === '') {
    pnl.push({ contractAddress: erc721tx.contractAddress, type: 'buy', amount: formatValueRaw(value) });
    finalObject.activity = `💎🟢 NFT buy! Bought ${erc721tx.tokenName} ${erc721tx.tokenID} for ${value} eth`;
  } else if (tx.functionName.includes('matchBidWithTakerAsk')) {
    pnl.push({ contractAddress: erc721tx.contractAddress, type: 'sell', amount: formatValueRaw(txs.erc20.value) });
    finalObject.activity = `💎🔴 NFT sale! Sold ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(txs.erc20.value)} weth on LooksRare`;
  } else if (tx.functionName === 'fulfillAvailableAdvancedOrders(tuple[] advancedOrders, tuple[] criteriaResolvers, tuple[][] offerFulfillments, tuple[][] considerationFulfillments, bytes32 fulfillerConduitKey, address recipient, uint256 maximumFulfilled)') {
    // FIXME: this is the wrong way round!
    pnl.push({ contractAddress: erc721tx.contractAddress, type: 'sell', amount: formatValueRaw(tx.value) });
    finalObject.activity = `💎🔴 NFT sale! Sold ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Opensea`;
  } else if (tx.functionName.includes('safeTransferFrom')) {
    finalObject.activity = `💎➡️  NFT transfer. Transferred ${erc721tx.tokenName} ${erc721tx.tokenID} to ${shortAddr(erc721tx.to)}`;
  } else {
    finalObject.activity = '💎 OTHER ERC721...';
  }
}

module.exports = {
    parseErc721
}
