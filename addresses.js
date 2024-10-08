const inputA = {
  'pepe': { address: '0x6982508145454ce325ddbe47a25d4ec3d2311933', type: 'erc20', startblock: 17046105, endblock: 17145674  },
  'bitcoin': { address: '0x72e4f9f808c49a2a61de9c5896298920dc4eeea9', type: 'erc20', startblock: 17663408, endblock: 17684668 },
  'hams': { address: '0x48c87cdacb6bb6bf6e5cd85d8ee5c847084c7410', type: 'erc20', startblock: 17663883, endblock: 17735001 },
  'turbo': { address: '0xa35923162c49cf95e6bf26623385eb431ad920d3', type: 'erc20', startblock: 17167024, endblock: 17173727 },
  'mog': { address: '0xaaeE1A9723aaDB7afA2810263653A34bA2C21C7a', type: 'erc20', startblock: 17732026, endblock: 17755548 },
  'cage': { address: '0xfcaF0e4498E78d65526a507360F755178b804Ba8', type: 'erc20', startblock: 17849393, endblock: 17885111 },
  'nihao': { address: '0xC3681A720605bD6F8fe9A2FaBff6A7CDEcDc605D', type: 'erc20', startblock: 17360350, endblock: 17380487 },
  'pepe2': { address: '0xbe042e9d09cb588331ff911c2b46fd833a3e5bd6', type: 'erc20', startblock: 17987995, endblock: 18009131 },
  'x': { address: '0xa62894d5196bc44e4c3978400ad07e7b30352372', type: 'erc20' },
  'mong': { address: '0x1ce270557c1f68cfb577b856766310bf8b47fd9c', type: 'erc20' },
  'unibot': { address: '0xf819d9Cb1c2A819Fd991781A822dE3ca8607c3C9', type: 'erc20' },
  'none': { address: '0x903ff0ba636E32De1767A4B5eEb55c155763D8B7', type: 'erc20' },
  'smurf': { address: '0xff836a5821e69066c87e268bc51b849fab94240c', type: 'erc20' },
  'astro': { address: '0xed4e879087ebd0e8a77d66870012b5e0dffd0fa4', type: 'erc20' },
  'gold': { address: '0x089453742936dd35134383aee9d78bEe63A69b01', type: 'erc20' },
  'pepeking': { address: '0x51A59a02BA906194285E81eb1F98FFA28E7CF4C9', type: 'erc20' },
  'kekscam': { address: '0x4Ef6A620c55dBc650ed9CD1F901Fd2eeF68A63d1', type: 'erc20' },
  'apxscam': { address: '0x234ee45691132cc2a2b56941604c8b1bebe475e9', type: 'erc20' },
  'cal': { address: '0x20561172f791f915323241e885b4f7d5187c36e1', type: 'erc20' },
  'xrp': { address: '0x07E0EDf8ce600FB51d44F51E3348D77D67F298ae', type: 'erc20' },
  'spx': { address: '0xE0f63A424a4439cBE457D80E4f4b51aD25b2c56C', type: 'erc20' },
  'foom': { address: '0xd0D56273290D339aaF1417D9bfa1bb8cFe8A0933', type: 'erc20' },
  'fine': { address: '0x75C97384cA209f915381755c582EC0E2cE88c1BA', type: 'erc20' },
  'hydra': { address: '0xcaa8947c22d58912a67e783cf8371c918af45d96', type: 'erc20' },
  'ftx': { address: '0x3b6ea8d9c6dfaba0ffc63086b9eb669ddeb96ee2', type: 'erc20' },
}

const inputU = {
  'me': '0xCc65d148ac68Fda14C29bCC5aE7622D8BcD622e3',
  'scribbs': '0x70399b85054dd1d94f2264afc8704a3ee308abaf', // pepe wallet
  'scribbs2': '0x5654967dc2c3f207b68bbd8003bc27a0a4106b56', // checks wallet & punk trading
  'scribbs3': '0x5b1c25d61edce8decfc0b03a2c7f0d7917a8032f', // temp punk wallet
  'scribbs4': '0xa1e2fbd0f94465cc253792aa4b19629438d70836', // beanie punk wallet
  'scribbs5': '0x59d4fd60a25054bbd6cca11cf43946a3e033194b', // vr punk purchaser & chickenwing
  'scribbs6': '0x00d0ad2956829f95543d33ab8b5438c066b76413', // vr punk holder
  'grow': '0x1CE2304369d957fc1F0Dd32C983F445E449F4C7A',
  'artchick': '0x0b8F4C4E7626A91460dac057eB43e0de59d5b44F',
  'osf': '0x3cb8482495c9188d1e36373134c059f98d7be4ed',
  'osf2': '0xdcae87821fa6caea05dbc2811126f4bc7ff73bd1',
  'xman': '0xc1244286edacb4097715386992aed36752483dcb',
  'seb': '0x3d280fde2ddb59323c891cf30995e1862510342f',
  'leftcurve': '0x9224cf7956b8787f1e015349ba2937cef29215d8',
  'leftcurve2': '0x5f45c7ea2e094fea813a8a8813620ffcc4a19d0f',
  'flip': '0xD7af88D7749c777131ae81Fef2A5EB2e37e9F6dB',
  'flip2': '0x541eBCd017986eF62e3A7e2F24A1835EA7FEcf50',
  'flip3': '0x9B5E928f9E17aAD03c4a051e59d86Ae6E19d21d7',
  'flip4': '0x7af1e233be4ffe8537c755f1d789f9125a377510',
  'flip5': '0xada0169b63fb63b65c98ebd7c7fbceeb7d0670f7',
  'flip6': '0x876b6f87490fFD17c3aA60711D8158bf407F7961',
  'flip7': '0xDA9E10dA22D89267E5D8e94B7Cadd332172cE869',
  'flip8': '0x5A0E0176A4299068b6B9843eF60b5410Ac90077F',
  'otc': '0x0232d1083e970f0c78f56202b9a666b526fa379f',
  'otc2': '0x1919db36ca2fa2e15f9000fd9cdc2edcf863e685',
  'otc3': '0x6639C089AdFbA8bb9968dA643C6BE208a70d6daA',
  'judge': '0xfd22e70cb42a0fa315c82e0aa95a6dc19f8b4934',
  'billi': '0x240e204b8eb025533128b54ed55c141d64db987d',
  'dimi': '0x4a2c786651229175407d3a2d405d1998bcf40614',
}

Object.keys(inputA).forEach(key => inputA[key].address = inputA[key].address.toLowerCase());
Object.keys(inputU).forEach(key => inputU[key] = inputU[key].toLowerCase());

module.exports = {
  inputU,
  inputA
};
