const APIKEY = '482599a22821425bae631e1031e90e7e';
var { Web3 } = require("web3");
var provider = `https://mainnet.infura.io/v3/${APIKEY}`;
var web3Provider = new Web3.providers.HttpProvider(provider);
var web3 = new Web3(web3Provider);



if (require.main === module) {
  (async () => {
    const block = await web3.eth.getBlockNumber().then(res => res);
    console.log(block);
  })();
}
