const etherscanApiKey = "I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG";

// let participantAddresses = [ //phantom
//   '0x70399b85054dd1d94f2264afc8704a3ee308abaf',
//   '0x5654967dc2c3f207b68bbd8003bc27a0a4106b56'
// ]
let participantAddresses = [ //gr0wcrypt0
  '0x1CE2304369d957fc1F0Dd32C983F445E449F4C7A',
]
participantAddresses = participantAddresses.map(x => x.toLowerCase());

const contractAddress =  '0x72e4f9f808c49a2a61de9c5896298920dc4eeea9'; //bitcoin
// const contractAddress =  '0x6982508145454ce325ddbe47a25d4ec3d2311933'; //pepe

module.exports = {
  etherscanApiKey,
  participantAddresses,
  contractAddress
};
