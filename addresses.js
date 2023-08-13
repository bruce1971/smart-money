const addressLib = {
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { name: 'WETH', decimals: 18 },
  '0xdac17f958d2ee523a2206206994597c13d831ec7': { name: 'USDT', decimals: 6 },
  '0x72e4f9f808c49a2a61de9c5896298920dc4eeea9': { name: 'HarryPotterObamaSonic10Inu', decimals: 5 },
  '0x6982508145454ce325ddbe47a25d4ec3d2311933': { name: 'Pepe', decimals: 8 },
  '0x48c87cdacb6bb6bf6e5cd85d8ee5c847084c7410': { name: 'Hamsters' }
}

const inputU = {
  'scribbs':  ['0x70399b85054dd1d94f2264afc8704a3ee308abaf', '0x5654967dc2c3f207b68bbd8003bc27a0a4106b56'],
  'gr0wcrypt0': ['0x1CE2304369d957fc1F0Dd32C983F445E449F4C7A'],
  'artchick': ['0x0b8F4C4E7626A91460dac057eB43e0de59d5b44F'],
  'other': ['0x025be7c6a5ea75c5f4a1ad4cad087063ea108619']
}

const inputA = {
  'bitcoin': { address: '0x72e4f9f808c49a2a61de9c5896298920dc4eeea9', type: 'erc20' },
  'pepe': { address: '0x6982508145454ce325ddbe47a25d4ec3d2311933', type: 'erc20' },
  'hams': { address: '0x48c87cdacb6bb6bf6e5cd85d8ee5c847084c7410', type: 'erc20' },
}

const inputH = {
  'pepeToUsd': '0x88fc1135ea7d6e5e0ae338f6b6d87288f84750df9e2afea96f6be8466f1dd077',
  'shitToShit': '0x205ada937ab463360674b69d197cb3032c3826c29536b138669035fc8297d66e',
  'pepeToEth': '0xa548298d7108da04fb67071c8b328f3fd83a14733393643e55ebd31ad9bc6ef5'
}


module.exports = {
  addressLib,
  inputU,
  inputA,
  inputH
};
