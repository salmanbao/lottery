require('@nomiclabs/hardhat-etherscan')
require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-ethers')
require('hardhat-gas-reporter')
require('solidity-coverage')
require('hardhat-watcher')
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  watcher: {
    compilation: {
      tasks: ['compile'],
    },
    test: {
      tasks: [
        {
          command: 'test',
          params: {
            logs: true,
            noCompile: false,
            testFiles: ['./test/system.test.js'],
          },
        },
      ],
      files: ['./test/*'],
      verbose: true,
    },
  },

  gasReporter: {
    enabled: true,
    currency: 'CHF',
    gasPrice: 21,
  },
  networks: {
    hardhat: {
      mining: {
        auto: false,
        interval: 5000,
      },
      blockGasLimit: 13000000,
      gasPrice: 20,
    },
    bsc: {
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
      url: 'https://data-seed-prebsc-1-s2.binance.org:8545/',
      chainId: 97,
      gasPrice: 'auto',
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: 'QM92UXPPM2ITZG1UBG3FR5W4JUHQKNQ5ZS',
  },
  solidity: {
    compilers: [
      {
        version: '0.6.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.6.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.8.0',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
}
