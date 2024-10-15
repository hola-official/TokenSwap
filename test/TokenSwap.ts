const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenSwap", function () {
  let TokenSwap, tokenSwap, USDCToken, usdcToken, NairaToken, nairaToken;
  let owner, user1, user2;
  const RATE = 1565;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock USDC and Naira tokens
    USDCToken = await ethers.getContractFactory("MockERC20");
    usdcToken = await USDCToken.deploy("USDC Token", "USDC");
    await usdcToken.deployed();

    NairaToken = await ethers.getContractFactory("MockERC20");
    nairaToken = await NairaToken.deploy("Naira Token", "NAIRA");
    await nairaToken.deployed();

    // Deploy TokenSwap contract
    TokenSwap = await ethers.getContractFactory("TokenSwap");
    tokenSwap = await TokenSwap.deploy(usdcToken.address, nairaToken.address);
    await tokenSwap.deployed();

    // Mint some tokens for testing
    await usdcToken.mint(owner.address, ethers.utils.parseEther("10000"));
    await nairaToken.mint(owner.address, ethers.utils.parseEther("15650000"));

    // Approve TokenSwap contract to spend tokens
    await usdcToken.approve(tokenSwap.address, ethers.constants.MaxUint256);
    await nairaToken.approve(tokenSwap.address, ethers.constants.MaxUint256);
  });

  describe("Deployment", function () {
    it("Should set the right token addresses", async function () {
      expect(await tokenSwap.usdcToken()).to.equal(usdcToken.address);
      expect(await tokenSwap.nairaToken()).to.equal(nairaToken.address);
    });
  });

  describe("Swapping and Ownership check", function () {
    it("Should swap USDC to Naira", async function () {
      const usdcAmount = ethers.utils.parseEther("100");
      const expectedNairaAmount = usdcAmount.mul(RATE);

      await expect(tokenSwap.swapUSDCToNaira(usdcAmount))
        .to.emit(tokenSwap, "Swap")
        .withArgs(owner.address, usdcAmount, expectedNairaAmount, true);

      expect(await usdcToken.balanceOf(tokenSwap.address)).to.equal(usdcAmount);
      expect(await nairaToken.balanceOf(owner.address)).to.equal(
        expectedNairaAmount
      );
    });

    it("Should swap Naira to USDC", async function () {
      const nairaAmount = ethers.utils.parseEther("156500");
      const expectedUsdcAmount = nairaAmount.div(RATE);

      await expect(tokenSwap.swapNairaToUSDC(nairaAmount))
        .to.emit(tokenSwap, "Swap")
        .withArgs(owner.address, expectedUsdcAmount, nairaAmount, false);

      expect(await nairaToken.balanceOf(tokenSwap.address)).to.equal(
        nairaAmount
      );
      expect(await usdcToken.balanceOf(owner.address)).to.equal(
        expectedUsdcAmount
      );
    });

    it("Should revert when swapping 0 amount", async function () {
      await expect(tokenSwap.swapUSDCToNaira(0)).to.be.revertedWith(
        "Amount must be greater than 0"
      );
      await expect(tokenSwap.swapNairaToUSDC(0)).to.be.revertedWith(
        "Amount must be greater than 0"
      );
    });

    it("Should revert when Naira amount is not divisible by rate", async function () {
      await expect(tokenSwap.swapNairaToUSDC(1000)).to.be.revertedWith(
        "Naira amount must be divisible by the rate"
      );
    });

    it("Should transfer ownership", async function () {
      await tokenSwap.transferOwnership(user1.address);
      await tokenSwap.connect(user1).claimOwnership();

      // Try to get contract balance (onlyOwner function)
      await expect(
        tokenSwap.connect(owner).getContractBalance()
      ).to.be.revertedWith("Only owner can access");
      await expect(tokenSwap.connect(user1).getContractBalance()).to.not.be
        .reverted;
    });

    it("Should revert when non-owner tries to transfer ownership", async function () {
      await expect(
        tokenSwap.connect(user1).transferOwnership(user2.address)
      ).to.be.revertedWith("Only owner can access");
    });

    it("Should revert when wrong address tries to claim ownership", async function () {
      await tokenSwap.transferOwnership(user1.address);
      await expect(
        tokenSwap.connect(user2).claimOwnership()
      ).to.be.revertedWith("Not your turn yet");
    });
  });
});
