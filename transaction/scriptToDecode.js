const axios = require('axios');
const {Interface, AbiCoder} = require("ethers");
const { accountUrl } = require(`../helper.js`);
var { Web3 } = require("web3");
const APIKEY = '482599a22821425bae631e1031e90e7e';
var provider = `https://mainnet.infura.io/v3/${APIKEY}`;
var web3Provider = new Web3.providers.HttpProvider(provider);
var web3 = new Web3(web3Provider);



async function decoderScript(userAddress, contractAddress, block) {
  const tx = await axios.get(accountUrl('txlist', userAddress, contractAddress, block, block)).then(res => res.data.result[0]);
  console.log('normal', tx);
  const tx20 = await axios.get(accountUrl('tokentx', userAddress, contractAddress, block, block)).then(res => res.data.result[0]);
  console.log('erc20', tx20);
  const tx721 = await axios.get(accountUrl('tokennfttx', userAddress, contractAddress, block, block)).then(res => res.data.result[0]);
  console.log('erc721', tx721);
  const txInt = await axios.get(accountUrl('txlistinternal', userAddress, contractAddress, block, block)).then(res => res.data.result[0]);
  console.log('internal', txInt);
  const input = tx.input;
  const abiContractAddress = tx.to;
  // console.log(abiContractAddress);
  const abi = await axios.get(`https://api.etherscan.io/api?module=contract&action=getabi&address=${abiContractAddress}`).then(res => res.data.result);
  console.log(abi);
  const iface = new Interface(abi);
  const parsedTx = iface.parseTransaction({data: input});
  console.log(parsedTx);
}

async function decoderScript2(txHash) {
  const tx = await web3.eth.getTransaction(txHash)
  console.log(tx);
  console.log('=======================================');
  const input = tx.input;
  const abiContractAddress = tx.to;
  const abi = await axios.get(`https://api.etherscan.io/api?module=contract&action=getabi&address=${abiContractAddress}`).then(res => res.data.result);
  const iface = new Interface(abi);
  const parsedTx = iface.parseTransaction({data: input});
  console.log(parsedTx);
}


(async () => {
  // const userAddress = '0x92fb7dded09de546ad7c23e73caf8d6c34c96919';
  // const contractAddress = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d';
  // const block = 18172866;
  // await decoderScript(userAddress, contractAddress, block);
  await decoderScript2('0x2daf71fa15ddecb04f705e4579c117770db412ebb73065c2b60a645cd8b1a6be')
})();
