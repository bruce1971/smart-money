const fs = require('fs/promises');
const path = `./user/erc721.json`;


async function getErc721Info(participation){
  const participationErc721 = participation.filter(o => o.type === 'erc721');
  const erc721addresses = participationErc721.map(o => o.contractAddress);
  console.log(erc721addresses);

  let erc721InfoObj = JSON.parse(await fs.readFile(path));
  console.log(erc721InfoObj);

  await fs.writeFile(path, JSON.stringify(erc721InfoObj, null, 2), 'utf8');
  return erc721InfoObj;
}


module.exports = {
  getErc721Info
}
