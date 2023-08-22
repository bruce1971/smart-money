const fs = require("fs");
const {Interface, AbiCoder} = require("ethers");
let { abi1, abi2 } = require(`./abis.js`);
let universalInteface = new Interface(abi1);
let universalInteface2 = new Interface(abi2);

const swapCodes = {
    "00": "V3_SWAP_EXACT_IN",
    "01": "V3_SWAP_EXACT_OUT",
    "08": "V2_SWAP_EXACT_IN",
    "09": "V2_SWAP_EXACT_OUT"
};

module.exports = {
    decoder1,
    decoder2
}

function decoder1(transactionInput) {
    const parsedTx = universalInteface.parseTransaction({data: transactionInput});
    let commandsSplit = parsedTx.args[0].substring(2).match(/.{1,2}/g);
    const abiCoder = new AbiCoder();

    let decoded;
    let finalArray = [];
    commandsSplit.forEach(commandCode => {
      let inputForFunction = parsedTx.args[1][commandsSplit.indexOf(commandCode)];
      if (swapCodes[commandCode] === "V3_SWAP_EXACT_IN") {
              decoded = abiCoder.decode(["address", "uint256", "uint256", "bytes", "bool"], inputForFunction);
              finalArray.push({
                  function: swapCodes[commandCode],
                  recipient: decoded[0],
                  amountIn: decoded[1].toString(),
                  amountOut: decoded[2].toString(),
                  path: extractPathFromV3(decoded[3]),
                  payerIsUser: decoded[4]
              })
      } else if (swapCodes[commandCode] === "V3_SWAP_EXACT_OUT") {
              decoded = abiCoder.decode(["address", "uint256", "uint256", "bytes", "bool"], inputForFunction);
              finalArray.push({
                  function: swapCodes[commandCode],
                  recipient: decoded[0],
                  amountIn: decoded[2].toString(),
                  amountOut: decoded[1].toString(),
                  path: extractPathFromV3(decoded[3], true), // because exact output swaps are executed in reverse order, in this case tokenOut is actually tokenIn
                  payerIsUser: decoded[4]
              })
      } else if (swapCodes[commandCode] === "V2_SWAP_EXACT_IN") {
              decoded = abiCoder.decode(["address", "uint256", "uint256", "address[]", "bool"], inputForFunction);
              finalArray.push({
                  function: swapCodes[commandCode],
                  recipient: decoded[0],
                  amountIn: decoded[1].toString(),
                  amountOut: decoded[2].toString(),
                  path: decoded[3],
                  payerIsUser: decoded[4]
              })

      } else if (swapCodes[commandCode] === "V2_SWAP_EXACT_OUT") {
              decoded = abiCoder.decode(["address", "uint256", "uint256", "address[]", "bool"], inputForFunction);
              finalArray.push({
                  function: swapCodes[commandCode],
                  recipient: decoded[0],
                  amountIn: decoded[2].toString(),
                  amountOut: decoded[1].toString(),
                  path: decoded[3],
                  payerIsUser: decoded[4]
              })
      }
    });
    return finalArray;
}

function extractPathFromV3(fullPath, reverse = false) {
    const fullPathWithoutHexSymbol = fullPath.substring(2);
    let path = [];
    let currentAddress = "";
    for (let i = 0; i < fullPathWithoutHexSymbol.length; i++) {
        currentAddress += fullPathWithoutHexSymbol[i];
        if (currentAddress.length === 40) {
            path.push('0x' + currentAddress);
            i = i + 6;
            currentAddress = "";
        }
    }
    if (reverse) return path.reverse();
    return path;
}

function decoder2(transactionInput) {
  const parsedTx = universalInteface2.parseTransaction({data: transactionInput});
  const decoded = parsedTx.args;
  let finalArray = [];
  finalArray.push({
      amountIn: decoded[0].toString(),
      amountOut: decoded[1].toString(),
      path: decoded[2]
  })
  return finalArray;
}
