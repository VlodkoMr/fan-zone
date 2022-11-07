const hre = require("hardhat");
const { saveFrontendFiles } = require('./utils');

const MAIN_CONTRACT_PROXY = "";
const NFT_FACTORY_CONTRACT_PROXY = "";
const FT_FACTORY_CONTRACT_PROXY = "";

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
