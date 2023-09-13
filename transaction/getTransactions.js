const axios = require('axios');
const { accountUrl } = require(`../helper.js`);


async function txsForSingleAddress(address, contractAddress, startblock, endblock, quick=false) {
  console.log(`Getting txs for ${address}...`);
  const sort = 'desc';
  // shitcoin
  const erc20Transactions = ['erc20', undefined].includes(contractAddress?.type)
    ? await axios.get(accountUrl('tokentx', address, contractAddress?.address, startblock, endblock, sort)).then(res => {
      const txs = res.data.result;
      txs.forEach(tx => tx.type = 'erc20')
      return txs;
    }) : [];
  if (quick && contractAddress?.type === 'erc20' ) {
    const blockNumbers = erc20Transactions.map(o => Number(o.blockNumber));
    startblock = Math.min(...blockNumbers);
    endblock = Math.max(...blockNumbers);
  }
  // nft
  const erc721Transactions = ['erc721', undefined].includes(contractAddress?.type)
    ? await axios.get(accountUrl('tokennfttx', address, contractAddress?.address, startblock, endblock, sort)).then(res => {
      const txs = res.data.result;
      txs.forEach(tx => tx.type = 'erc721')
      return txs;
    }) : [];
  // nft2
  const erc1155Transactions = ['erc1155', undefined].includes(contractAddress?.type)
    ? await axios.get(accountUrl('token1155tx', address, contractAddress?.address, startblock, endblock, sort)).then(res => {
      const txs = res.data.result;
      txs.forEach(tx => tx.type = 'erc1155')
      return txs;
    }) : [];
  // nomral
  const normalTransactions = await axios.get(accountUrl('txlist', address, contractAddress?.address, startblock, endblock, sort)).then(res => {
    const txs = res.data.result;
    txs.forEach(tx => tx.type = 'normal');
    return txs;
  });
  // smart contract interaction
  const internalTransactions = quick
    ? []
    : await axios.get(accountUrl('txlistinternal', address, contractAddress?.address, startblock, endblock)).then(res => {
      const txs = res.data.result;
      txs.forEach(tx => tx.type = 'internal')
      return txs;
    });

  let transactions = [
    ...normalTransactions,
    ...internalTransactions,
    ...erc20Transactions,
    ...erc721Transactions,
    ...erc1155Transactions
  ];

  const txArray = groupTransactions(transactions, transactions);
  return txArray;
}


function groupTransactions(txPool, hashTxPool) {
  const txHashes = [...new Set(hashTxPool.map(tx => tx.hash))];
  const txArray = [];
  txHashes.forEach(hash => {
    const txs = txPool.filter(tx => tx.hash === hash);
    const txsObject = {};
    txs.forEach(tx => txsObject[tx.type] = tx);
    const timeStamp = Number(txs[0].timeStamp);
    const block = Number(txs[0].blockNumber);
    let userWallet = txs.find(o => o.type === 'normal')?.from;
    if (!userWallet) userWallet = txs.find(o => o.type === 'internal')?.to;
    txArray.push({
      hash: hash,
      timeStamp: timeStamp,
      block: block,
      userWallet: userWallet,
      txs: txsObject
    })
  });
  return txArray
}


module.exports = {
    groupTransactions,
    txsForSingleAddress
}
