const moment = require('moment');
const etherscanApiKey = "I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG";

module.exports = {
    accountUrl,
    contractUrl,
    abiUrl,
    blockUrl,
    round,
    roundSpec,
    formatValue,
    formatValueRaw,
    formatTimestamp,
    formatLargeValue,
    shortAddr,
    formatActivityLog,
    aggrPnl,
    formatPnl,
    secondsToBlocks,
    getParticipation
}

function accountUrl(type, address, contractAddress, startblock=0, endblock=99999999, sort='desc') {
  return `
    https://api.etherscan.io/api
     ?module=account
     &action=${type}
     ${address ? `&address=${address}` : ''}
     ${contractAddress ? `&contractaddress=${contractAddress}` : ''}
     &startblock=${startblock}
     &endblock=${endblock}
     &sort=${sort}
     &apikey=${etherscanApiKey}
  `.replace(/\s/g, '')
}

function contractUrl(contractAddress, startblock=0) {
  return `
    https://api.etherscan.io/api
     ?module=account
     &action=tokentx
     &contractaddress=${contractAddress}
     &startblock=${startblock}
     &endblock=99999999
     &sort=asc
     &apikey=I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG
  `.replace(/\s/g, '')
}

function abiUrl(address) {
  return `
  https://api.etherscan.io/api
    ?module=contract
    &action=getabi
    &address=${'0x2cc846fff0b08fb3bffad71f53a60b4b6e6d6482'}
    &apikey=${etherscanApiKey}
  `.replace(/\s/g, '')
}

function blockUrl(timestamp) {
  return `
  https://api.etherscan.io/api
    ?module=block
    &action=getblocknobytime
    &timestamp=${timestamp}
    &closest=before
    &apikey=${etherscanApiKey}
  `.replace(/\s/g, '')
}

function roundSpec(n) {
  if (n > 10) return round(n, 0);
  else if (n > 1) return round(n, 1);
  else return round(n, 2);
}

function round(value, decimals) {
  return Math.round(value * 10**decimals) / 10**decimals;
}

function formatValue(value, decimals=18) {
  decimals = Number(decimals);
  value = Number(value)/10**decimals;
  if (value > 999) value = round(value, 0);
  else if (value > 99) value = round(value, 1);
  else value = round(value, 2);
  value = value.toLocaleString();
  return value;
}

function formatLargeValue(value, decimals=0) {
  const formattedValue = formatValue(value, decimals);
  const splitValue = formattedValue.split(',')
  if (splitValue.length === 1) return splitValue[0];
  if (splitValue.length === 2) return splitValue[0].length > 1 ? `${splitValue[0]}k` : `${splitValue[0]}.${splitValue[1].substring(0, 1)}k`;
  if (splitValue.length === 3) return splitValue[0].length > 1 ? `${splitValue[0]}M` : `${splitValue[0]}.${splitValue[1].substring(0, 1)}M`;
  if (splitValue.length === 4) return splitValue[0].length > 1 ? `${splitValue[0]}B` : `${splitValue[0]}.${splitValue[1].substring(0, 1)}B`;
  if (splitValue.length === 5) return splitValue[0].length > 1 ? `${splitValue[0]}T` : `${splitValue[0]}.${splitValue[1].substring(0, 1)}T`;
}

function formatValueRaw(value, decimals=18) {
  decimals = Number(decimals);
  value = Number(value)/10**decimals;
  if (value > 999) value = round(value, 0);
  else if (value > 99) value = round(value, 1);
  else value = round(value, 2);
  return value;
}

function formatTimestamp(timeStamp) {
  var now = moment(new Date());
  var end = moment(timeStamp * 1000);
  var duration = moment.duration(now.diff(end));
  var years = duration.years(),
      months = duration.months(),
      days = duration.days(),
      hours = duration.hours(),
      minutes = duration.minutes(),
      seconds = duration.seconds();
  if (years > 0) return `${years} years ${months} months ${days} days ago...`;
  else if (months > 0) return `${months} months ${days} days ago...`;
  else if (days > 0) return `${days} days ${hours} hours ago...`;
  else if (hours > 0) return `${hours} hours ${minutes} minutes...`;
  else if (minutes > 0) return `${minutes} minutes ${seconds} seconds ago...`;
  else return `${seconds} seconds ago...`;
}

function shortAddr(address) {
  return address.substring(0,8);
}

function formatActivityLog(activityLog, showUser=false, showBlock=false, displayAll=true) {
  activityLog.forEach(a => {
    if (displayAll || a.activity.includes('BUY') || a.activity.includes('SALE')) {
      console.log('---------');
      console.log(`${a.ago} ${showBlock && a.block ? `block:${a.block}` : ''}`); // TODO: add exact date
      if (showUser && a.userWallet) console.log(`user:${a.userWallet}`);
      console.log(a.activity);
      console.log(a.tx);
    }
  });
}

function aggrPnl(participation, currentPortfolio, pnl) {
  let pnlObj = [];
  participation.forEach(el => {
    const userAddress = participation[0].userAddress;
    const type = el.type;
    const tokenName = el.tokenName;
    const contractAddress = el.contractAddress;
    const contractAddressPnl = pnl.filter(o => o.contractAddress.toLowerCase() === el.contractAddress.toLowerCase());
    const buy = -contractAddressPnl.filter(o => o.type === 'buy').reduce((acc, o) => (acc + o.amount), 0);
    const sell = contractAddressPnl.filter(o => o.type === 'sell').reduce((acc, o) => (acc + o.amount), 0);
    const current = currentPortfolio.find(o => o.address.toLowerCase() === el.contractAddress.toLowerCase())?.totalEth || 0;
    const profit = buy + sell + current;
    const roi = buy === 0 ? 0 : profit / (-buy);
    pnlObj.push({ userAddress, type, tokenName, contractAddress, buy, sell, current, profit, roi })
  });
  pnlObj = pnlObj.sort((a, b) => b.profit - a.profit);
  return pnlObj;
}

function formatPnl(pnlObj) {
  console.table({
    'Name': 'O-V-E-R-A-L-L',
    'Profit-N-Loss (eth)': round(pnlObj.map(o => o.profit).reduce((acc, o) => (acc + o), 0), 2),
    '------': '-------------',
    'Put In (eth)': -round(pnlObj.map(o => o.buy).reduce((acc, o) => (acc + o), 0), 2),
    'Taken Out (eth)': round(pnlObj.map(o => o.sell).reduce((acc, o) => (acc + o), 0), 2),
    'Current (eth)': round(pnlObj.map(o => o.current).reduce((acc, o) => (acc + o), 0), 2),
  });

  const pnlBreakdown = [];
  pnlObj.forEach(el => {
    pnlBreakdown.push({
      'Name': el.tokenName.slice(0, 30),
      'Contract Address': el.contractAddress,
      'Type': el.type,
      'Profit-N-Loss (eth)': round(el.profit, 2),
      'ROI (x)': round(el.roi, 2),
      'Put In (eth)': round(-el.buy, 2),
      'Taken Out (eth)': round(el.sell, 2),
      'Current (eth)': round(el.current, 2),
    })
  });
  console.table(pnlBreakdown);

}

function secondsToBlocks(seconds) {
  return Math.ceil(seconds/12.08);
}

function getParticipation(txArray, userAddress) {
  txArray = txArray.sort((a,b) => Number(b.timeStamp) - Number(a.timeStamp));
  let participation = {};
  txArray.forEach(tx => {
    if (tx.txs.erc20) {
      const contractAddress = tx.txs.erc20.contractAddress
      if (participation[contractAddress]) participation[contractAddress].userAddress = userAddress;
      else participation[contractAddress] = {...tx.txs.erc20, userAddress: userAddress};
    }
    else if (tx.txs.erc721) {
      const contractAddress = tx.txs.erc721.contractAddress
      if (participation[contractAddress]) participation[contractAddress].userAddress = userAddress;
      else participation[contractAddress] = {...tx.txs.erc721, userAddress: userAddress};
    }
    else if (tx.txs.erc1155) {
      const contractAddress = tx.txs.erc1155.contractAddress
      if (participation[contractAddress]) participation[contractAddress].userAddress = userAddress;
      else participation[contractAddress] = {...tx.txs.erc1155, userAddress: userAddress};
    }
  });
  participation = Object.values(participation);
  participation = participation.sort((a,b) => Number(b.timeStamp) - Number(a.timeStamp));
  participation = participation.map(o => ({
    tokenName: o.tokenName,
    type: o.type,
    ago: formatTimestamp(o.timeStamp),
    contractAddress: o.contractAddress,
    userAddress: o.userAddress,
    aTxHash: `https://etherscan.io/tx/${o.hash}`
  }))
  return participation;
}
