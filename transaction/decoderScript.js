const axios = require('axios');
const {Interface, AbiCoder} = require("ethers");
const { accountUrl } = require(`../helper.js`);



async function decoderScript(userAddress, contractAddress, block) {
  const tx = await axios.get(accountUrl('txlist', userAddress, contractAddress, block, block)).then(res => res.data.result[0]);
  console.log(tx);
  const input = tx.input;
  console.log(input);
  const constractAddress = tx.to;
  const abi = await axios.get(`https://api.etherscan.io/api?module=contract&action=getabi&address=${constractAddress}`).then(res => res.data.result);
  console.log(abi);
  const iface = new Interface(abi);
  const parsedTx = iface.parseTransaction({data: input});
  console.log(parsedTx);
}


(async () => {
  const userAddress = '0x3d280fde2ddb59323c891cf30995e1862510342f';
  const contractAddress = '0x39da41747a83aee658334415666f3ef92dd0d541';
  const block = 18013826;
  // const userAddress = '0x3d280fde2ddb59323c891cf30995e1862510342f';
  // const contractAddress = '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e';
  // const block = 16621727;
  await decoderScript(userAddress, contractAddress, block);
})();
