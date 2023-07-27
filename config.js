const etherscanApiKey = "I2MBIPC3CU5D7WM882FXNFMCHX6FP77IYG";

// let participantAddresses = ['0x70399b85054dd1d94f2264afc8704a3ee308abaf', '0x5654967dc2c3f207b68bbd8003bc27a0a4106b56'] //phantom
// let participantAddresses = ['0x1CE2304369d957fc1F0Dd32C983F445E449F4C7A'] //gr0wcrypt0
// let participantAddresses = ['0x0b8F4C4E7626A91460dac057eB43e0de59d5b44F'] //artchick
let participantAddresses = ['0x025be7c6a5ea75c5f4a1ad4cad087063ea108619'] //other
participantAddresses = participantAddresses.map(x => x.toLowerCase());

// const contractAddress =  null;
// const contractAddress =  '0x72e4f9f808c49a2a61de9c5896298920dc4eeea9'; //bitcoin
const contractAddress =  '0x6982508145454ce325ddbe47a25d4ec3d2311933'; //pepe
// const contractAddress =  '0x48c87cdacb6bb6bf6e5cd85d8ee5c847084c7410'; //hams

module.exports = {
  etherscanApiKey,
  participantAddresses,
  contractAddress
};
