const basePath = process.cwd();
const moment = require('moment');
const etherscanApiKey = "I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG";

module.exports = {
    accountUrl: accountUrl,
    contractUrl: contractUrl,
    abiUrl: abiUrl,
    round: round,
    formatValue: formatValue,
    formatValueRaw: formatValueRaw,
    formatTimestamp: formatTimestamp
}

function accountUrl(type, address) {
  return `
    https://api.etherscan.io/api
     ?module=account
     &action=${type}
     &address=${address}
     &startblock=0
     &endblock=99999999
     &page=1
     &sort=desc
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
  if (years > 0) console.log(`${years} years ${months} months ${days} days ago...`);
  else if (months > 0) console.log(`${months} months ${days} days ago...`);
  else if (days > 0) console.log(`${days} days ${hours} hours ago...`);
  else if (hours > 0) console.log(`${hours} hours ${minutes} minutes...`);
  else if (minutes > 0) console.log(`${minutes} minutes ${seconds} seconds ago...`);
  else console.log(`${seconds} seconds ago...`);
}
