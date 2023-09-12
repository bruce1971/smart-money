const { formatValue, formatValueRaw, shortAddr } = require(`../helper.js`);

function parseErc721(txs, finalObject, pnl, erc20InfoObj) {
  // console.log(txs);
  const erc721tx = txs.erc721;
  if (txs.normal) {
    const tx = txs.normal;
    if (tx.functionName === '') {
      pnl.push({ contractAddress: erc721tx.contractAddress, type: 'buy', amount: formatValueRaw(tx.value) });
      finalObject.activity = `💎🟢 NFT buy! Bought ${erc721tx.tokenName} ${erc721tx.tokenID} for ${tx.value} eth`;
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
    } else if (tx.functionName === 'atomicMatch_(address[14] addrs, uint256[18] uints, uint8[8] feeMethodsSidesKindsHowToCalls, bytes calldataBuy, bytes calldataSell, bytes replacementPatternBuy, bytes replacementPatternSell, bytes staticExtradataBuy, bytes staticExtradataSell, uint8[2] vs, bytes32[5] rssMetadata)') {
      if (erc721tx.to === finalObject.userWallet) {
        pnl.push({ contractAddress: erc721tx.contractAddress, type: 'buy', amount: formatValueRaw(tx.value) });
        finalObject.activity = `💎🟢 NFT buy! Bought ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Opensea`;
      } else if (erc721tx.from === finalObject.userWallet) {
        pnl.push({ contractAddress: erc721tx.contractAddress, type: 'sell', amount: formatValueRaw(tx.value) });
        finalObject.activity = `💎🔴 NFT sale! Sold ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Opensea`;
      }
    } else if (tx.functionName === 'matchAdvancedOrders(tuple[] ,tuple[] ,tuple[] ,address recipient)') {
      if (erc721tx.from === finalObject.userWallet) {
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
      }
    } else if (tx.functionName === 'takeAsk(tuple inputs,bytes oracleSignature)') {
      if (erc721tx.to === finalObject.userWallet) {
        pnl.push({ contractAddress: erc721tx.contractAddress, type: 'buy', amount: formatValueRaw(tx.value) });
        finalObject.activity = `💎🟢 NFT buy! Bought ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Blur`;
      }
    } else if (tx.functionName === 'takeBid(tuple inputs,bytes oracleSignature)') {
      if (erc721tx.from === finalObject.userWallet) {
        pnl.push({ contractAddress: erc721tx.contractAddress, type: 'sell', amount: formatValueRaw(tx.value) });
        finalObject.activity = `💎🔴 NFT sale! Sold ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Blur`;
      }
    } else if (tx.functionName === 'takeBidSingle(tuple inputs,bytes oracleSignature)') {
      if (erc721tx.from === finalObject.userWallet) {
        pnl.push({ contractAddress: erc721tx.contractAddress, type: 'sell', amount: formatValueRaw(tx.value) });
        finalObject.activity = `💎🔴 NFT sale! Sold ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Blur`;
      }
    } else if (tx.functionName === 'purchase(uint256 _price)' && tx.to === '0x47e312d99c09ce61a866c83cbbbbed5a4b9d33e7') {
      if (erc721tx.to === finalObject.userWallet) {
        pnl.push({ contractAddress: erc721tx.contractAddress, type: 'buy', amount: formatValueRaw(tx.value) });
        finalObject.activity = `💎🟢 NFT mint! Bought ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(tx.value)} eth on Art Blocks`;
      }
    } else if (tx.functionName === 'transferFrom(address _from, address _to, uint256 _value)') {
      finalObject.activity = `💎➡️  NFT transfer. Transferred ${erc721tx.tokenName} ${erc721tx.tokenID} to ${shortAddr(erc721tx.to)}`;
    } else if (tx.functionName === 'bulkTransfer(tuple[] items,bytes32 conduitKey)') {
      finalObject.activity = `💎➡️  NFT transfer. Transferred ${erc721tx.tokenName} ${erc721tx.tokenID} to ${shortAddr(erc721tx.to)}`;
    } else if (tx.functionName.includes('safeTransferFrom')) {
      finalObject.activity = `💎➡️  NFT transfer. Transferred ${erc721tx.tokenName} ${erc721tx.tokenID} to ${shortAddr(erc721tx.to)}`;
    } else {
      finalObject.activity = '💎 OTHER ERC721...';
    }
  } else if (txs.internal) {
    if (erc721tx.from === finalObject.userWallet) {
      pnl.push({ contractAddress: erc721tx.contractAddress, type: 'sell', amount: formatValueRaw(txs.internal.value) });
      finalObject.activity = `💎🔴 NFT sale! Sold ${erc721tx.tokenName} ${erc721tx.tokenID} for ${formatValue(txs.internal.value)} eth`;
    }
  } else {
    finalObject.activity = '💎 OTHER No Normal/Internal ERC721...';
  }
}

module.exports = {
  parseErc721
}
