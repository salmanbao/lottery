const { expect, assert } = require('chai')
const { ethers } = require('hardhat')
const { lotto, generateLottoNumbers } = require('./settings.js')

describe('Lottery contract', function () {
  let mock_erc20Contract
  // Creating the instance and contract info for the lottery contract
  let lotteryInstance, lotteryContract
  // Creating the instance and contract info for the cake token contract
  let safemoonInstance
  // Creating the instance and contract info for the timer contract
  // Creating the instance and contract info for the mock rand gen
  let randGenInstance, randGenContract
  // Creating the instance and contract of all the contracts needed to mock
  // the ChainLink contract ecosystem.
  let linkInstance

  // Creating the users
  let owner, buyer

  beforeEach(async () => {
    // Getting the signers provided by ethers
    const signers = await ethers.getSigners()
    // Creating the active wallets for use
    owner = signers[0]
    buyer = signers[1]

    // Getting the lottery code (abi, bytecode, name)
    lotteryContract = await ethers.getContractFactory('SafemoonLottery')
    // Getting the lotteryNFT code (abi, bytecode, name)
    mock_erc20Contract = await ethers.getContractFactory('Mock_erc20')
    // Getting the ChainLink contracts code (abi, bytecode, name)
    randGenContract = await ethers.getContractFactory('RandomNumberGenerator')
    mock_vrfCoordContract = await ethers.getContractFactory(
      'Mock_VRFCoordinator',
    )

    // Deploying the instances
    safemoonInstance = await mock_erc20Contract.deploy(lotto.buy.cake)
    linkInstance = await mock_erc20Contract.deploy(lotto.buy.cake)

    mock_vrfCoordInstance = await mock_vrfCoordContract.deploy(
      linkInstance.address,
      lotto.chainLink.keyHash,
      lotto.chainLink.fee,
    )

    randGenInstance = await randGenContract.deploy(
      mock_vrfCoordInstance.address,
      linkInstance.address,
    )

    lotteryInstance = await lotteryContract.deploy(
      safemoonInstance.address,
      randGenInstance.address,
      lotto.setup.burnWallet,
      await signers[10].getAddress(),
      lotto.setup.bucket.one,
      lotto.setup.bucket.two,
      lotto.setup.bucketDiscount.one,
      lotto.setup.bucketDiscount.two,
      lotto.setup.bucketDiscount.three,
    )

    // Making sure the lottery has some cake
    await safemoonInstance.mint(lotteryInstance.address, lotto.newLotto.prize)
    await safemoonInstance.mint(
      await buyer.getAddress(),
      ethers.utils.parseUnits('100000000000000000', 18),
    )
    // Sending link to lottery
    await linkInstance.transfer(lotteryInstance.address, lotto.buy.linksToLotto)
    await linkInstance.transfer(randGenInstance.address, lotto.buy.links)
  })

  describe('Creating a new lottery tests', function () {
    // Tests that in the nominal case nothing goes wrong

    it('Nominal case', async function () {
      lotteryInstance
        .connect(owner)
        .setOperatorAndTreasuryAndInjectorAddresses(
          await owner.getAddress(),
          await owner.getAddress(),
          await owner.getAddress(),
        )
      // Getting the current block timestamp
      const currentTime = (await ethers.provider.getBlock('latest')).timestamp
      // Converting to a BigNumber for manipulation
      // Creating a new lottery
      await expect(
        lotteryInstance
          .connect(owner)
          .startLottery(
            (currentTime + 12 * 60 * 60).toString(),
            lotto.newLotto.cost,
            lotto.newLotto.distribution,
            lotto.newLotto.treasuryFee,
          ),
      ).to.emit(lotteryInstance, lotto.events.new)
    })

    // Testing that non-admins cannot create a lotto

    it('Invalid admin', async function () {
      // Getting the current block timestamp
      const currentTime = (await ethers.provider.getBlock('latest')).timestamp
      // Checking call reverts with correct error message
      await expect(
        lotteryInstance
          .connect(buyer)
          .startLottery(
            (currentTime + 12 * 60 * 60).toString(),
            lotto.newLotto.cost,
            lotto.newLotto.distribution,
            lotto.newLotto.treasuryFee,
          ),
      ).to.be.revertedWith(lotto.errors.invalid_operator)
    })

    // Testing that an invalid distribution will fail

    it('Invalid price distribution total', async function () {
      lotteryInstance
        .connect(owner)
        .setOperatorAndTreasuryAndInjectorAddresses(
          await owner.getAddress(),
          await owner.getAddress(),
          await owner.getAddress(),
        )
      // Getting the current block timestamp
      const currentTime = (await ethers.provider.getBlock('latest')).timestamp
      // Checking call reverts with correct error message
      await expect(
        lotteryInstance
          .connect(owner)
          .startLottery(
            (currentTime + 12 * 60 * 60).toString(),
            lotto.newLotto.cost,
            lotto.errorData.distribution_total,
            lotto.newLotto.treasuryFee,
          ),
      ).to.be.revertedWith(lotto.errors.invalid_distribution_total)
    })
  })

  describe('Buying tickets tests', function () {
    // Creating a lotto for all buying tests to use. Will be a new instance
    // for each lotto.

    beforeEach(async () => {
      lotteryInstance
        .connect(owner)
        .setOperatorAndTreasuryAndInjectorAddresses(
          await owner.getAddress(),
          await owner.getAddress(),
          await owner.getAddress(),
        )

      // Getting the current block timestamp
      const currentTime = (await ethers.provider.getBlock('latest')).timestamp

      // Creating a new lottery
      await lotteryInstance
        .connect(owner)
        .startLottery(
          (currentTime + 12 * 60 * 60).toString(),
          lotto.newLotto.cost,
          lotto.newLotto.distribution,
          lotto.newLotto.treasuryFee,
        )
    })

    // Tests cost per ticket is as expected

    it('Cost per ticket', async function () {
      let totalPrice = await lotteryInstance.calculateTotalPriceForBulkTickets(
        ethers.utils.parseUnits('4236528', 18),
        10,
      )
      // Checks price is correct
      assert.equal(
        totalPrice.toString(),
        lotto.buy.ten.cost,
        'Incorrect cost for batch buy of 10',
      )
    })

    // //* Tests the batch buying of one token

    it('Batch buying 1 tickets', async function () {
      // Getting the price to buy
      let price = await lotteryInstance.calculateTotalPriceForBulkTickets(
        ethers.utils.parseUnits('4236528', 18),
        1,
      )

      let ticketNumbers = generateLottoNumbers({
        numberOfTickets: 1,
        lottoSize: lotto.setup.sizeOfLottery,
        maxRange: lotto.setup.maxValidRange,
      })
      // Approving lotto to spend cost
      await safemoonInstance
        .connect(buyer)
        .approve(lotteryInstance.address, '25164976320000000000000000')

      // // Batch buying tokens
      await expect(lotteryInstance.connect(buyer).buyTickets(1, ticketNumbers))
        .to.be.emit(lotteryInstance, 'FundingWallet')
        .withArgs(ethers.utils.parseUnits('1258248.816', 18))
        .and.to.emit(lotteryInstance, 'TicketsPurchase')
        .withArgs(await buyer.getAddress(), 1, 6)
      // Testing results
      assert.equal(
        price.toString(),
        lotto.buy.one.cost,
        'Incorrect cost for batch buy of 1',
      )
    })

    // * Tests the batch buying of ten token

    it('Batch buying 5 tickets', async function () {
      // Getting the price to buy
      let price = await lotteryInstance.calculateTotalPriceForBulkTickets(
        ethers.utils.parseUnits('4236528', 18),
        10,
      )
      // Generating chosen numbers for buy
      let ticketNumbers = generateLottoNumbers({
        numberOfTickets: 5,
        lottoSize: lotto.setup.sizeOfLottery,
        maxRange: lotto.setup.maxValidRange,
      })
      // Approving lotto to spend cost

      await safemoonInstance
        .connect(buyer)
        .approve(lotteryInstance.address, '228772512000000000000000000')
      // // Batch buying tokens

      await expect(lotteryInstance.connect(buyer).buyTickets(1, ticketNumbers))
        .to.be.emit(lotteryInstance, 'FundingWallet')
        .withArgs(ethers.utils.parseUnits('6100600.32', 18))
        .and.to.emit(lotteryInstance, 'TicketsPurchase')
        .withArgs(await buyer.getAddress(), 1, 30)
    })
  })
})
