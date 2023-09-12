const axios = require('axios');
const {Interface, AbiCoder} = require("ethers");
const { accountUrl } = require(`../helper.js`);



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
  console.log(abiContractAddress);
  const abi = await axios.get(`https://api.etherscan.io/api?module=contract&action=getabi&address=${abiContractAddress}`).then(res => res.data.result);
  console.log(abi);
  const iface = new Interface(abi);
  const parsedTx = iface.parseTransaction({data: input});
  console.log(parsedTx);
}


(async () => {
  // const userAddress = '0x3d280fde2ddb59323c891cf30995e1862510342f';
  // const contractAddress = '0x39da41747a83aee658334415666f3ef92dd0d541';
  // const block = 18013826;
  const userAddress = '0x3d280fde2ddb59323c891cf30995e1862510342f';
  const contractAddress = '0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63';
  const block = 17710514;
  await decoderScript(userAddress, contractAddress, block);
})();
