const axios = require('axios');


async function gecko(){
  const contractAddress = '0xed4e879087ebd0e8a77d66870012b5e0dffd0fa4'
  const url = `https://api.geckoterminal.com/api/v2/networks/eth/tokens/${contractAddress}?include=top_pools`;
  const info = await axios.get(url).then(res => res.data).catch(e => null);
  console.log(info);
}


if (require.main === module) {
  (async () => {
    gecko()
  })();
}
