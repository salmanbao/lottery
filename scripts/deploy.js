const {
  lotto,
  lottoNFT,
  BigNumber,
  generateLottoNumbers,
} = require('../test/settings.js')
// The deployment script
const main = async () => {
  // Getting the first signer as the deployer
  const [deployer] = await ethers.getSigners()
  // Saving the info to be logged in the table (deployer address)
  var deployerLog = { Label: 'Deploying Address', Info: deployer.address }
  // Saving the info to be logged in the table (deployer address)
  var deployerBalanceLog = {
    Label: 'Deployer ETH Balance',
    Info: (await deployer.getBalance()).toString(),
  }

  let mock_erc20Contract
  // Creating the instance and contract info for the lottery contract
  let lotteryInstance, lotteryContract
  // Creating the instance and contract info for the lottery NFT contract
  let lotteryNftInstance, lotteryNftContract
  // Creating the instance and contract info for the cake token contract
  let cakeInstance
  // Creating the instance and contract info for the timer contract
  let timerInstance, timerContract
  // Creating the instance and contract info for the mock rand gen
  let randGenInstance, randGenContract
  // Creating the instance and contract of all the contracts needed to mock
  // the ChainLink contract ecosystem.

  // Getting the lottery code (abi, bytecode, name)
  lotteryContract = await ethers.getContractFactory('SafemoonLottery')
  // randGenContract = await ethers.getContractFactory('RandomNumberGenerator')

  // Deploys the contracts

  lotteryInstance = await lotteryContract.deploy(
    '0xAa43A2bEb083CB2829CBA963400324Ce70880A03',
    '0x026D2cADa52aDAc907de2aA51d1e59D7b7AD2cfb',
    '0x73326B37374607A826F6a0aBBe47992061495b83',
    20,
    50,
    1,
    4,
    10,
  )

  // randGenInstance = await randGenContract.deploy(
  //   '0xa555fC018435bef5A13C6c6870a9d4C11DEC329C',
  //   '84b9b910527ad5c03a9ca831909e21e236ea7b06',
  // )

  // // Final set up of contracts
  // await lotteryInstance.init(
  //   lotteryNftInstance.address,
  //   randGenInstance.address,
  // )

  // Saving the info to be logged in the table (deployer address)
  var lotteryLog = {
    Label: 'Deployed Lottery Address',
    Info: lotteryInstance.address,
  }

  // var lotteryLog = {
  //   Label: 'Deployed RNG Address',
  //   Info: randGenInstance.address,
  // }

  console.table([lotteryLog])
}
// Runs the deployment script, catching any errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
