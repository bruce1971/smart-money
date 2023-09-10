const axios = require('axios');
const fs = require('fs/promises');
const path = `./user/erc721.json`;


async function refreshErc721(){
  const url = `https://api.nftpricefloor.com/api/root/projects?qapikey=347e162a-71e6-43ba-ba6e-4d0e625e0bcb`;
  const data = await axios.get(url).then(res => res.data);

  const erc721InfoObj = {};
  data.forEach(el => {
    erc721InfoObj[el.reservoirCollectionId] = {
      name: el.name,
      address: el.reservoirCollectionId,
      totalSupply: el.stats.totalSupply,
      priceEth: el.stats.floorInfo.currentFloorEth,
      priceUsd: el.stats.floorInfo.currentFloorUsd,
    }
  });

  await fs.writeFile(path, JSON.stringify(erc721InfoObj, null, 2), 'utf8');
  return erc721InfoObj;
}


(async () => {
  await refreshErc721();
})();
