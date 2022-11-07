const hre = require("hardhat");
const { saveFrontendFiles } = require('./utils');

const MAIN_CONTRACT_PROXY = "0x1229EBc5C2b50714E8b52114082ee5A0d55ABd23";
const NFT_FACTORY_CONTRACT_PROXY = "0xB6b5FEb8F8fc13237753C2AfE81c82a0431455Ef";
const FT_FACTORY_CONTRACT_PROXY = "0xa797a5bAdD4b2250C8C5e25A7C34CF3a9F0722a9";

async function main() {
  const [ deployer ] = await hre.ethers.getSigners();
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const MainContract = await hre.ethers.getContractFactory("MainContract");
  const mainContract = await hre.upgrades.upgradeProxy(MAIN_CONTRACT_PROXY, MainContract);

  const FactoryNFTContract = await hre.ethers.getContractFactory("FactoryNFTContract");
  const factoryNFTContract = await hre.upgrades.upgradeProxy(NFT_FACTORY_CONTRACT_PROXY, FactoryNFTContract);

  const FactoryFTContract = await hre.ethers.getContractFactory("FactoryFTContract");
  const factoryFTContract = await hre.upgrades.upgradeProxy(FT_FACTORY_CONTRACT_PROXY, FactoryFTContract);

  console.log('Contract upgraded');

  saveFrontendFiles(mainContract, "MainContract");
  saveFrontendFiles(factoryNFTContract, "FactoryNFTContract");
  saveFrontendFiles(factoryFTContract, "FactoryFTContract");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
