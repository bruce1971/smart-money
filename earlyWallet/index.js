const basePath = process.cwd();
const wallets = require(`${basePath}/data.js`);

const pepeTurbo = intersection(wallets.pepe, wallets.turbo);
console.log('pepeTurbo', pepeTurbo);

const pepeBitcoin = intersection(wallets.pepe, wallets.bitcoin);
console.log('pepeBitcoin', pepeBitcoin);

const turboBitcoin = intersection(wallets.turbo, wallets.bitcoin);
console.log('turboBitcoin', turboBitcoin);

const turboPepeBitcoin = intersection(wallets.pepe, wallets.turbo, wallets.bitcoin);
console.log('turboPepeBitcoin', turboPepeBitcoin);


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
