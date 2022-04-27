const { ethers } = require("hardhat");

async function main() {
  const randomiserContract = await ethers.getContractFactory("Randomiser");

  const deployedRandomiserContract = await randomiserContract.deploy();

  await deployedRandomiserContract.deployed();

  console.log(
    "Randomiser Contract Address:",
    deployedRandomiserContract.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
