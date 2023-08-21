const basePath = process.cwd();
const tokens = require(`${basePath}/data.js`);

const pepeWallets = tokens.pepe.map(o => o.address);
const turboWallets = tokens.turbo.map(o => o.address);
const bitcoinWallets = tokens.bitcoin.map(o => o.address);

const pepeTurbo = intersection(pepeWallets, turboWallets);
console.log('pepeTurbo', pepeTurbo, pepeTurbo.length);
pepeTurbo.forEach(address => {
  console.log(address);
  console.log('pepe profit: ',tokens.pepe.find(o => o.address === address).profit);
  console.log('turbo profit: ',tokens.turbo.find(o => o.address === address).profit);
});

const pepeBitcoin = intersection(pepeWallets, bitcoinWallets);
console.log('pepeBitcoin', pepeBitcoin ,pepeBitcoin.length);
pepeBitcoin.forEach(address => {
  console.log(address);
  console.log('pepe profit: ',tokens.pepe.find(o => o.address === address).profit);
  console.log('bitcoin profit: ',tokens.bitcoin.find(o => o.address === address).profit);
});

const turboBitcoin = intersection(turboWallets, bitcoinWallets);
console.log('turboBitcoin', turboBitcoin, turboBitcoin.length);
turboBitcoin.forEach(address => {
  console.log(address);
  console.log('turbo profit: ',tokens.turbo.find(o => o.address === address).profit);
  console.log('bitcoin profit: ',tokens.bitcoin.find(o => o.address === address).profit);
});


const turboPepeBitcoin = intersection(pepeWallets, turboWallets, bitcoinWallets);
console.log(turboPepeBitcoin);
turboPepeBitcoin.forEach(address => {
  console.log(address);
  console.log('pepe profit: ',tokens.pepe.find(o => o.address === address).profit);
  console.log('turbo profit: ',tokens.turbo.find(o => o.address === address).profit);
  console.log('bitcoin profit: ',tokens.bitcoin.find(o => o.address === address).profit);
});




function intersection() {
  var result = [];
  var lists;

  if(arguments.length === 1) {
    lists = arguments[0];
  } else {
    lists = arguments;
  }

  for(var i = 0; i < lists.length; i++) {
    var currentList = lists[i];
    for(var y = 0; y < currentList.length; y++) {
        var currentValue = currentList[y];
      if(result.indexOf(currentValue) === -1) {
        var existsInAll = true;
        for(var x = 0; x < lists.length; x++) {
          if(lists[x].indexOf(currentValue) === -1) {
            existsInAll = false;
            break;
          }
        }
        if(existsInAll) {
          result.push(currentValue);
        }
      }
    }
  }
  return result;
}
