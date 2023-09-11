const basePath = process.cwd();
const decoder = require(`./decoder.js`);
const { formatValue, formatTimestamp, formatLargeValue, shortAddr } = require(`../helper.js`);
const { parseErc20 } = require(`./parseErc20.js`);
const { parseErc721 } = require(`./parseErc721.js`);
const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'.toLowerCase();


async function parseTx(fullTx, userAddresses, pnl, erc20InfoObj) {
  console.log(fullTx);
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
      parseErc721(txs, txs.normal, finalObject, pnl, erc20InfoObj);
    } else if (txsKeys.includes('erc20')) {
      await parseErc20(txs, txs.normal, finalObject, pnl, erc20InfoObj);
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
    parseTx: parseTx
}
