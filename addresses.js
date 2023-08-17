const addressLib = {
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { name: 'WETH', decimals: 18 },
  '0xdac17f958d2ee523a2206206994597c13d831ec7': { name: 'USDT', decimals: 6 },
  '0x72e4f9f808c49a2a61de9c5896298920dc4eeea9': { name: 'HarryPotterObamaSonic10Inu', decimals: 5, totalSupply: 1000000000 },
  '0x6982508145454ce325ddbe47a25d4ec3d2311933': { name: 'Pepe', decimals: 8, totalSupply: 420689899999994 },
  '0x48c87cdacb6bb6bf6e5cd85d8ee5c847084c7410': { name: 'Hamsters', totalSupply: 10000000 },
  '0xa35923162c49cf95e6bf26623385eb431ad920d3': { name: 'Turbo', totalSupply: 69000000000 },
}
//https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=0x6982508145454ce325ddbe47a25d4ec3d2311933

const inputA = {
  'bitcoin': { address: '0x72e4f9f808c49a2a61de9c5896298920dc4eeea9', type: 'erc20' },
  'pepe': { address: '0x6982508145454ce325ddbe47a25d4ec3d2311933', type: 'erc20' },
  'hams': { address: '0x48c87cdacb6bb6bf6e5cd85d8ee5c847084c7410', type: 'erc20' },
  'turbo': { address: '0xa35923162c49cf95e6bf26623385eb431ad920d3', type: 'erc20' },
}

const inputU = {
  'scribbs':  ['0x70399b85054dd1d94f2264afc8704a3ee308abaf', '0x5654967dc2c3f207b68bbd8003bc27a0a4106b56', '0xa1e2fbd0f94465cc253792aa4b19629438d70836', '0x59d4fd60a25054bbd6cca11cf43946a3e033194b'],
  'gr0wcrypt0': ['0x1CE2304369d957fc1F0Dd32C983F445E449F4C7A'],
  'artchick': ['0x0b8F4C4E7626A91460dac057eB43e0de59d5b44F'],
  'osf': ['0x3cb8482495c9188d1e36373134c059f98d7be4ed', '0xdcae87821fa6caea05dbc2811126f4bc7ff73bd1'],
  'other': ['0x025be7c6a5ea75c5f4a1ad4cad087063ea108619'],
  'ex': ['0x490afd96f33ef169814e2a5ffc55dae99b6be963'],
}


module.exports = {
  addressLib,
  inputU,
  inputA
};
