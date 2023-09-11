const fs = require('fs/promises');
const path = `./data/erc721.json`;


async function getErc721Info() {
  let erc721InfoObj = JSON.parse(await fs.readFile(path));
  return erc721InfoObj;
}


module.exports = {
  getErc721Info
}
