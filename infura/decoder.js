const axios = require('axios');
const {Interface, AbiCoder} = require("ethers");
var { Web3 } = require("web3");
const APIKEY = '482599a22821425bae631e1031e90e7e';
var provider = `https://mainnet.infura.io/v3/${APIKEY}`;
var web3Provider = new Web3.providers.HttpProvider(provider);
var web3 = new Web3(web3Provider);
const fs = require('fs/promises');
const path_abi = `./infura/data/abi.json`;


module.exports = {
  decoder
}


function executeDecoder(parsedTx) {
    const swapCodes = {
        "00": "V3_SWAP_EXACT_IN",
        "01": "V3_SWAP_EXACT_OUT",
        "08": "V2_SWAP_EXACT_IN",
        "09": "V2_SWAP_EXACT_OUT"
    };

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
    return {
      type: 'execute',
      txs: finalArray
    };
}


async function decoder(txHash) {
  const tx = await web3.eth.getTransaction(txHash);
  let abi;
  let abis = JSON.parse(await fs.readFile(path_abi));
  let abiContractAddress = tx.to;

  if (Object.keys(abis).includes(abiContractAddress)) {
    abi = abis[abiContractAddress];
  }
  else {
    return
  }
  const iface = new Interface(abi);
  let parsedTx = iface.parseTransaction({data: tx.input});
  if (parsedTx?.signature === 'execute(bytes,bytes[],uint256)') {
    parsedTx = executeDecoder(parsedTx);
    return parsedTx;
  } else {
    return parsedTx
  }
}


if (require.main === module) {
  (async () => {
    const parsedTx = await decoder('0x25ee7fe17684762b64ded11b0e703db5b025f0581eb8db8a915db238426d67ff', '0x7a250d5630b4cf539739df2c5dacb4c659f2488d');
    console.log(parsedTx);
  })();
}
