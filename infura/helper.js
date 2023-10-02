const {AbiCoder} = require("ethers");

module.exports = {
  mcapCalculator,
  round,
  formatLargeValue,
  logDecoder
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

function mcapCalculator(ethAmount, erc20Amount, erc20TotalSupply, erc20Decimals) {
  const ethInUsd = 1600;
  const unitPriceEth = formatValueRaw(ethAmount)/formatValueRaw(erc20Amount, erc20Decimals);
  const mcap = unitPriceEth * ethInUsd * erc20TotalSupply;
  return round(mcap, 0);
}

function logDecoder(data){
  const abiCoder = new AbiCoder();
  const decoded = abiCoder.decode(['uint256','uint256','uint256','uint256'], data);
  return decoded.map(Number);
}
