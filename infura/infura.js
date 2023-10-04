var { Web3 } = require("web3");
const APIKEY = '482599a22821425bae631e1031e90e7e';
var provider = `https://mainnet.infura.io/v3/${APIKEY}`;
var web3Provider = new Web3.providers.HttpProvider(provider);
var web3 = new Web3(web3Provider);



if (require.main === module) {
  (async () => {
    const block = await web3.eth.getBlockNumber().then(res => res);
    console.log(block);
    const tx = await web3.eth.getTransaction("0xa2c55f497a00f74363746a3bd3dedc40f62fc802ebb57f5c774228c959fd2023")
    console.log(tx);
  })();
}
