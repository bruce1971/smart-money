const basePath = process.cwd();
const decoder = require(`./decoder.js`);
const { formatValue, formatTimestamp, formatLargeValue, shortAddr } = require(`../helper.js`);
const { parseErc20 } = require(`./parseErc20.js`);
const { parseErc721 } = require(`./parseErc721.js`);
const moment = require('moment');
const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'.toLowerCase();


async function parseTx(fullTx, userAddress, pnl, erc20InfoObj) {
  const finalObject = {
    ago: formatTimestamp(fullTx.timeStamp),
    blockNumber: fullTx.blockNumber,
    dataTime: moment(fullTx.timeStamp * 1000).format("YYYY/MM/DD HH:mm:ss"),
    userAddress: fullTx.userAddress
  };
  const txs = fullTx.txs;
  const txsKeys = Object.keys(txs);
  const txsValues = Object.values(txs);
  finalObject.tx = `https://etherscan.io/tx/${txsValues[0].hash}`;

  if (txsKeys.includes('erc721')) {
    parseErc721(txs, finalObject, pnl, erc20InfoObj);
  } else if (txsKeys.includes('erc20')) {
    await parseErc20(txs, finalObject, pnl, erc20InfoObj);
  } else if (txs.normal?.from.toLowerCase() === userAddress && txs.normal?.functionName === '' && txs.normal?.input === '0x') {
    finalObject.activity = `💸➡️  SEND ${formatValue(txs.normal?.value) || 0}eth to ${shortAddr(txs.normal?.to)}`;
  } else if (txs.normal?.to.toLowerCase() === userAddress && txs.normal?.functionName === '') {
    finalObject.activity = `⬅️ 💸 RECEIVE ${formatValue(txs.normal?.value) || 0}eth from ${shortAddr(txs.normal?.from)}`;
  } else if (txs.normal?.functionName.includes('setApprovalForAll')) {
    finalObject.activity = `👍👍 Set Approval for All...`
  } else if (txs.normal?.functionName.includes('approve')) {
    finalObject.activity = `👍 Approve spend...`;
  } else if (txs.normal?.to.toLowerCase() === '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'.toLowerCase() && txs.normal?.functionName.includes('commit')) {
    finalObject.activity = `💦 Request to Register ENS Domain`;
  } else if (txs.normal?.to.toLowerCase() === '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'.toLowerCase() && txs.normal?.functionName.includes('registerWithConfig')) {
    finalObject.activity = `💦 Register ENS Domain`;
  } else if (txs.normal?.functionName === 'deposit()' && txs.normal?.to.toLowerCase() == WETH_ADDRESS) {
    finalObject.activity = `↪️  Wrap ${formatValue(txs.normal?.value) || 0} ETH to WETH`; //amount in decoded tx.input
  } else if (txs.normal?.functionName === 'withdraw(uint256 amount)' && txs.normal?.to.toLowerCase() == WETH_ADDRESS) {
    finalObject.activity = `↩️  Unwrap WETH to ETH`; //amount in decoded tx.input
  } else if (txs.normal?.functionName === 'withdraw(uint256 amount)' && txs.normal?.to.toLowerCase() == '0x0000000000a39bb272e79075ade125fd351887ac'.toLowerCase()) {
    finalObject.activity = `Withdraw from Blur`;
  } else {
    finalObject.activity = 'OTHER NORMAL..';
  }

  return finalObject;
}


module.exports = {
    parseTx: parseTx
}
