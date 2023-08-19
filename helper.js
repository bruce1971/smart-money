const basePath = process.cwd();
const moment = require('moment');
const etherscanApiKey = "I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG";

module.exports = {
    accountUrl,
    contractUrl,
    abiUrl,
    blockUrl,
    round,
    formatValue,
    formatValueRaw,
    formatTimestamp,
    formatLargeValue,
    shortAddr,
    formatActivityLog,
    formatPnl
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
     &page=1
     &sort=${sort}
     &apikey=${etherscanApiKey}
  `.replace(/\s/g, '')
}

function contractUrl(startblock, tokenAddress) {
  return `
    https://api.etherscan.io/api
     ?module=account
     &action=tokentx
     &contractaddress=${tokenAddress}
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

function formatActivityLog(activityLog) {
  activityLog.forEach(a => {
    console.log('---------');
    console.log(a.ago);
    console.log(a.activity);
    console.log(a.tx);
  });
}

function formatPnl(pnl) {
  const shitInEth = 0.00000000097097; //pepe
  const ethInUsd = 1850;

  const pnlFormat = {... pnl};

  const shitFinalInEth = pnl.shitFinal * shitInEth;
  const pnlInEth = shitFinalInEth + pnl.wethFinal;
  const pnlInUsd = pnlInEth * ethInUsd;

  pnlFormat.wethFinal = formatValue(pnlFormat.wethFinal, 0);
  pnlFormat.wethFinalInUsd = formatValue(pnlFormat.wethFinal * ethInUsd, 0);
  pnlFormat.shitFinal = formatValue(pnlFormat.shitFinal, 0);
  pnlFormat.shitFinalInUsd = formatValue(shitFinalInEth * ethInUsd, 0);

  pnlFormat.pnlInEth = formatValue(pnlInEth, 0);
  pnlFormat.pnlInUsd = formatValue(pnlInUsd, 0);

  pnlFormat.wethOut = formatValue(pnlFormat.wethOut, 0);
  pnlFormat.wethIn = formatValue(pnlFormat.wethIn, 0);
  pnlFormat.shitOut = formatValue(pnlFormat.shitOut, 0);
  pnlFormat.shitIn = formatValue(pnlFormat.shitIn, 0);

  console.log('=================================')
  console.log(`ETH invested --> ${pnlFormat.wethOut} eth`);
  console.log(`ETH taken out --> ${pnlFormat.wethIn} eth`);
  console.log(`Shitcoins bought --> ${pnlFormat.shitIn}`);
  console.log(`Shitcoins sold --> ${pnlFormat.shitOut}`);
  console.log('---');
  console.log(`ETH PnL --> ${pnlFormat.wethFinal > 0 ? '+' : ''}${pnlFormat.wethFinal} eth ($${pnlFormat.wethFinalInUsd})`);
  console.log(`Shitcoin PnL --> ${pnlFormat.shitFinal > 0 ? '+' : ''}${pnlFormat.shitFinal} ($${pnlFormat.shitFinalInUsd})`);
  console.log('---');
  console.log(`PnL --> ${pnlInUsd > 0 ? '+' : ''}$${pnlFormat.pnlInUsd}`);
  console.log('=================================')
}
