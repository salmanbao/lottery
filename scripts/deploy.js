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

  // Deploys the contracts

  lotteryInstance = await lotteryContract.deploy(
    '0x71b894957fe11f7d94d0d91cfef74735ce21a534',
    '0x8daea24533cffedd499e0c649ce309db54d042cf',
    '0x65518dc6f9c6ef29afad2b1bec8f9174b5b629b6',
    '0x65518dc6f9c6ef29afad2b1bec8f9174b5b629b6',
    20,
    50,
    1,
    4,
    10,
  )
  // randGenInstance = await randGenContract.deploy(
  //   mock_vrfCoordInstance.address,
  //   linkInstance.address,
  //   lotteryInstance.address,
  //   lotto.chainLink.keyHash,
  //   lotto.chainLink.fee,
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

  console.table([lotteryLog])
}
// Runs the deployment script, catching any errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
