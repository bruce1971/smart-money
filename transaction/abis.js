const abi1 = [
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "permit2",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "weth9",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "seaport",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "nftxZap",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "x2y2",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "foundation",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "sudoswap",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "nft20Zap",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "cryptopunks",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "looksRare",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "routerRewardsDistributor",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "looksRareRewardsDistributor",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "looksRareToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "v2Factory",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "v3Factory",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "pairInitCodeHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "poolInitCodeHash",
            "type": "bytes32"
          }
        ],
        "internalType": "struct RouterParameters",
        "name": "params",
        "type": "tuple"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "ContractLocked",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ETHNotAccepted",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "commandIndex",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "message",
        "type": "bytes"
      }
    ],
    "name": "ExecutionFailed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FromAddressIsNotOwner",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientETH",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientToken",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidBips",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "commandType",
        "type": "uint256"
      }
    ],
    "name": "InvalidCommandType",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidOwnerERC1155",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidOwnerERC721",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidPath",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidReserves",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "LengthMismatch",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NoSlice",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "SliceOutOfBounds",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "SliceOverflow",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ToAddressOutOfBounds",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ToAddressOverflow",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ToUint24OutOfBounds",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ToUint24Overflow",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "TransactionDeadlinePassed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UnableToClaim",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UnsafeCast",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "V2InvalidPath",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "V2TooLittleReceived",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "V2TooMuchRequested",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "V3InvalidAmountOut",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "V3InvalidCaller",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "V3InvalidSwap",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "V3TooLittleReceived",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "V3TooMuchRequested",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "RewardsSent",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "looksRareClaim",
        "type": "bytes"
      }
    ],
    "name": "collectRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "commands",
        "type": "bytes"
      },
      {
        "internalType": "bytes[]",
        "name": "inputs",
        "type": "bytes[]"
      }
    ],
    "name": "execute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "commands",
        "type": "bytes"
      },
      {
        "internalType": "bytes[]",
        "name": "inputs",
        "type": "bytes[]"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "name": "execute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "onERC1155BatchReceived",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "onERC1155Received",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "name": "onERC721Received",
    "outputs": [
      {
        "internalType": "bytes4",
        "name": "",
        "type": "bytes4"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "int256",
        "name": "amount0Delta",
        "type": "int256"
      },
      {
        "internalType": "int256",
        "name": "amount1Delta",
        "type": "int256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "uniswapV3SwapCallback",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

const abi2 = [
   {
      "inputs":[
         {
            "internalType":"address",
            "name":"_factory",
            "type":"address"
         },
         {
            "internalType":"address",
            "name":"_WETH",
            "type":"address"
         }
      ],
      "stateMutability":"nonpayable",
      "type":"constructor"
   },
   {
      "inputs":[

      ],
      "name":"WETH",
      "outputs":[
         {
            "internalType":"address",
            "name":"",
            "type":"address"
         }
      ],
      "stateMutability":"view",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"address",
            "name":"tokenA",
            "type":"address"
         },
         {
            "internalType":"address",
            "name":"tokenB",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"amountADesired",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountBDesired",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountAMin",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountBMin",
            "type":"uint256"
         },
         {
            "internalType":"address",
            "name":"to",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"deadline",
            "type":"uint256"
         }
      ],
      "name":"addLiquidity",
      "outputs":[
         {
            "internalType":"uint256",
            "name":"amountA",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountB",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"liquidity",
            "type":"uint256"
         }
      ],
      "stateMutability":"nonpayable",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"address",
            "name":"token",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"amountTokenDesired",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountTokenMin",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountETHMin",
            "type":"uint256"
         },
         {
            "internalType":"address",
            "name":"to",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"deadline",
            "type":"uint256"
         }
      ],
      "name":"addLiquidityETH",
      "outputs":[
         {
            "internalType":"uint256",
            "name":"amountToken",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountETH",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"liquidity",
            "type":"uint256"
         }
      ],
      "stateMutability":"payable",
      "type":"function"
   },
   {
      "inputs":[

      ],
      "name":"factory",
      "outputs":[
         {
            "internalType":"address",
            "name":"",
            "type":"address"
         }
      ],
      "stateMutability":"view",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"amountOut",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"reserveIn",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"reserveOut",
            "type":"uint256"
         }
      ],
      "name":"getAmountIn",
      "outputs":[
         {
            "internalType":"uint256",
            "name":"amountIn",
            "type":"uint256"
         }
      ],
      "stateMutability":"pure",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"amountIn",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"reserveIn",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"reserveOut",
            "type":"uint256"
         }
      ],
      "name":"getAmountOut",
      "outputs":[
         {
            "internalType":"uint256",
            "name":"amountOut",
            "type":"uint256"
         }
      ],
      "stateMutability":"pure",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"amountOut",
            "type":"uint256"
         },
         {
            "internalType":"address[]",
            "name":"path",
            "type":"address[]"
         }
      ],
      "name":"getAmountsIn",
      "outputs":[
         {
            "internalType":"uint256[]",
            "name":"amounts",
            "type":"uint256[]"
         }
      ],
      "stateMutability":"view",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"amountIn",
            "type":"uint256"
         },
         {
            "internalType":"address[]",
            "name":"path",
            "type":"address[]"
         }
      ],
      "name":"getAmountsOut",
      "outputs":[
         {
            "internalType":"uint256[]",
            "name":"amounts",
            "type":"uint256[]"
         }
      ],
      "stateMutability":"view",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"amountA",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"reserveA",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"reserveB",
            "type":"uint256"
         }
      ],
      "name":"quote",
      "outputs":[
         {
            "internalType":"uint256",
            "name":"amountB",
            "type":"uint256"
         }
      ],
      "stateMutability":"pure",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"address",
            "name":"tokenA",
            "type":"address"
         },
         {
            "internalType":"address",
            "name":"tokenB",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"liquidity",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountAMin",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountBMin",
            "type":"uint256"
         },
         {
            "internalType":"address",
            "name":"to",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"deadline",
            "type":"uint256"
         }
      ],
      "name":"removeLiquidity",
      "outputs":[
         {
            "internalType":"uint256",
            "name":"amountA",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountB",
            "type":"uint256"
         }
      ],
      "stateMutability":"nonpayable",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"address",
            "name":"token",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"liquidity",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountTokenMin",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountETHMin",
            "type":"uint256"
         },
         {
            "internalType":"address",
            "name":"to",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"deadline",
            "type":"uint256"
         }
      ],
      "name":"removeLiquidityETH",
      "outputs":[
         {
            "internalType":"uint256",
            "name":"amountToken",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountETH",
            "type":"uint256"
         }
      ],
      "stateMutability":"nonpayable",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"address",
            "name":"token",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"liquidity",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountTokenMin",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountETHMin",
            "type":"uint256"
         },
         {
            "internalType":"address",
            "name":"to",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"deadline",
            "type":"uint256"
         }
      ],
      "name":"removeLiquidityETHSupportingFeeOnTransferTokens",
      "outputs":[
         {
            "internalType":"uint256",
            "name":"amountETH",
            "type":"uint256"
         }
      ],
      "stateMutability":"nonpayable",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"address",
            "name":"token",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"liquidity",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountTokenMin",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountETHMin",
            "type":"uint256"
         },
         {
            "internalType":"address",
            "name":"to",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"deadline",
            "type":"uint256"
         },
         {
            "internalType":"bool",
            "name":"approveMax",
            "type":"bool"
         },
         {
            "internalType":"uint8",
            "name":"v",
            "type":"uint8"
         },
         {
            "internalType":"bytes32",
            "name":"r",
            "type":"bytes32"
         },
         {
            "internalType":"bytes32",
            "name":"s",
            "type":"bytes32"
         }
      ],
      "name":"removeLiquidityETHWithPermit",
      "outputs":[
         {
            "internalType":"uint256",
            "name":"amountToken",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountETH",
            "type":"uint256"
         }
      ],
      "stateMutability":"nonpayable",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"address",
            "name":"token",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"liquidity",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountTokenMin",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountETHMin",
            "type":"uint256"
         },
         {
            "internalType":"address",
            "name":"to",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"deadline",
            "type":"uint256"
         },
         {
            "internalType":"bool",
            "name":"approveMax",
            "type":"bool"
         },
         {
            "internalType":"uint8",
            "name":"v",
            "type":"uint8"
         },
         {
            "internalType":"bytes32",
            "name":"r",
            "type":"bytes32"
         },
         {
            "internalType":"bytes32",
            "name":"s",
            "type":"bytes32"
         }
      ],
      "name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens",
      "outputs":[
         {
            "internalType":"uint256",
            "name":"amountETH",
            "type":"uint256"
         }
      ],
      "stateMutability":"nonpayable",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"address",
            "name":"tokenA",
            "type":"address"
         },
         {
            "internalType":"address",
            "name":"tokenB",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"liquidity",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountAMin",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountBMin",
            "type":"uint256"
         },
         {
            "internalType":"address",
            "name":"to",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"deadline",
            "type":"uint256"
         },
         {
            "internalType":"bool",
            "name":"approveMax",
            "type":"bool"
         },
         {
            "internalType":"uint8",
            "name":"v",
            "type":"uint8"
         },
         {
            "internalType":"bytes32",
            "name":"r",
            "type":"bytes32"
         },
         {
            "internalType":"bytes32",
            "name":"s",
            "type":"bytes32"
         }
      ],
      "name":"removeLiquidityWithPermit",
      "outputs":[
         {
            "internalType":"uint256",
            "name":"amountA",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountB",
            "type":"uint256"
         }
      ],
      "stateMutability":"nonpayable",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"amountOut",
            "type":"uint256"
         },
         {
            "internalType":"address[]",
            "name":"path",
            "type":"address[]"
         },
         {
            "internalType":"address",
            "name":"to",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"deadline",
            "type":"uint256"
         }
      ],
      "name":"swapETHForExactTokens",
      "outputs":[
         {
            "internalType":"uint256[]",
            "name":"amounts",
            "type":"uint256[]"
         }
      ],
      "stateMutability":"payable",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"amountOutMin",
            "type":"uint256"
         },
         {
            "internalType":"address[]",
            "name":"path",
            "type":"address[]"
         },
         {
            "internalType":"address",
            "name":"to",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"deadline",
            "type":"uint256"
         }
      ],
      "name":"swapExactETHForTokens",
      "outputs":[
         {
            "internalType":"uint256[]",
            "name":"amounts",
            "type":"uint256[]"
         }
      ],
      "stateMutability":"payable",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"amountOutMin",
            "type":"uint256"
         },
         {
            "internalType":"address[]",
            "name":"path",
            "type":"address[]"
         },
         {
            "internalType":"address",
            "name":"to",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"deadline",
            "type":"uint256"
         }
      ],
      "name":"swapExactETHForTokensSupportingFeeOnTransferTokens",
      "outputs":[

      ],
      "stateMutability":"payable",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"amountIn",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountOutMin",
            "type":"uint256"
         },
         {
            "internalType":"address[]",
            "name":"path",
            "type":"address[]"
         },
         {
            "internalType":"address",
            "name":"to",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"deadline",
            "type":"uint256"
         }
      ],
      "name":"swapExactTokensForETH",
      "outputs":[
         {
            "internalType":"uint256[]",
            "name":"amounts",
            "type":"uint256[]"
         }
      ],
      "stateMutability":"nonpayable",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"amountIn",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountOutMin",
            "type":"uint256"
         },
         {
            "internalType":"address[]",
            "name":"path",
            "type":"address[]"
         },
         {
            "internalType":"address",
            "name":"to",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"deadline",
            "type":"uint256"
         }
      ],
      "name":"swapExactTokensForETHSupportingFeeOnTransferTokens",
      "outputs":[

      ],
      "stateMutability":"nonpayable",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"amountIn",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountOutMin",
            "type":"uint256"
         },
         {
            "internalType":"address[]",
            "name":"path",
            "type":"address[]"
         },
         {
            "internalType":"address",
            "name":"to",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"deadline",
            "type":"uint256"
         }
      ],
      "name":"swapExactTokensForTokens",
      "outputs":[
         {
            "internalType":"uint256[]",
            "name":"amounts",
            "type":"uint256[]"
         }
      ],
      "stateMutability":"nonpayable",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"amountIn",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountOutMin",
            "type":"uint256"
         },
         {
            "internalType":"address[]",
            "name":"path",
            "type":"address[]"
         },
         {
            "internalType":"address",
            "name":"to",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"deadline",
            "type":"uint256"
         }
      ],
      "name":"swapExactTokensForTokensSupportingFeeOnTransferTokens",
      "outputs":[

      ],
      "stateMutability":"nonpayable",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"amountOut",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountInMax",
            "type":"uint256"
         },
         {
            "internalType":"address[]",
            "name":"path",
            "type":"address[]"
         },
         {
            "internalType":"address",
            "name":"to",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"deadline",
            "type":"uint256"
         }
      ],
      "name":"swapTokensForExactETH",
      "outputs":[
         {
            "internalType":"uint256[]",
            "name":"amounts",
            "type":"uint256[]"
         }
      ],
      "stateMutability":"nonpayable",
      "type":"function"
   },
   {
      "inputs":[
         {
            "internalType":"uint256",
            "name":"amountOut",
            "type":"uint256"
         },
         {
            "internalType":"uint256",
            "name":"amountInMax",
            "type":"uint256"
         },
         {
            "internalType":"address[]",
            "name":"path",
            "type":"address[]"
         },
         {
            "internalType":"address",
            "name":"to",
            "type":"address"
         },
         {
            "internalType":"uint256",
            "name":"deadline",
            "type":"uint256"
         }
      ],
      "name":"swapTokensForExactTokens",
      "outputs":[
         {
            "internalType":"uint256[]",
            "name":"amounts",
            "type":"uint256[]"
         }
      ],
      "stateMutability":"nonpayable",
      "type":"function"
   },
   {
      "stateMutability":"payable",
      "type":"receive"
   }
];

//0x7a250d5630b4cf539739df2c5dacb4c659f2488d
const abi3 = [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETHSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityWithPermit","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapETHForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]

module.exports = {
  abi1,
  abi2,
  abi3
};
