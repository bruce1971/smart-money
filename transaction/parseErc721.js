const { formatValue, shortAddr } = require(`../helper.js`);

function parseErc721(txs, tx, finalObject) {
  const erc721tx = txs.erc721;
  if (tx.functionName === '') {
    finalObject.activity = `💎🟢 NFT buy! Bought ${erc721tx.tokenName} ${erc721tx.tokenID} for ${value} eth`;
  } else if (tx.functionName.includes('matchBidWithTakerAsk')) {
    finalObject.activity = `💎🔴 NFT sale! Sold ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(txs.erc20.value)} weth on LooksRare`;
  } else if (tx.functionName === 'fulfillAvailableAdvancedOrders(tuple[] advancedOrders, tuple[] criteriaResolvers, tuple[][] offerFulfillments, tuple[][] considerationFulfillments, bytes32 fulfillerConduitKey, address recipient, uint256 maximumFulfilled)') {
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
