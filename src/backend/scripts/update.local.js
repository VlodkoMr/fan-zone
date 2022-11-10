const hre = require("hardhat");
const { saveFrontendFiles, saveAllFrontendFiles } = require('./utils');

const MAIN_CONTRACT_PROXY = "";
const NFT_FACTORY_CONTRACT_PROXY = "";
const FT_FACTORY_CONTRACT_PROXY = "";
const EXECUTOR_CONTRACT_PROXY = "0xc351628EB244ec633d5f21fBD6621e1a683B1181";
const FACTORY_TIMELOCK_PROXY = "0xcbEAF3BDe82155F56486Fb5a1072cb8baAf547cc";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const ChainlinkExecutor = await hre.ethers.getContractFactory("ChainlinkExecutor");
  const chainlinkExecutor = await hre.upgrades.upgradeProxy(EXECUTOR_CONTRACT_PROXY, ChainlinkExecutor);

  const FactoryTimeLockContract = await hre.ethers.getContractFactory("FactoryTimeLockContract");
  const factoryTimeLockContract = await hre.upgrades.upgradeProxy(FACTORY_TIMELOCK_PROXY, FactoryTimeLockContract);

  // const FactoryNFTContract = await hre.ethers.getContractFactory("FactoryNFTContract");
  // const factoryNFTContract = await hre.upgrades.upgradeProxy(NFT_FACTORY_CONTRACT_PROXY, FactoryNFTContract);
  //
  // const FactoryFTContract = await hre.ethers.getContractFactory("FactoryFTContract");
  // const factoryFTContract = await hre.upgrades.upgradeProxy(FT_FACTORY_CONTRACT_PROXY, FactoryFTContract);
  //
  // console.log('Contract upgraded');
  //
  saveAllFrontendFiles(chainlinkExecutor, "ChainlinkExecutor");
  saveAllFrontendFiles(factoryTimeLockContract, "FactoryTimeLockContract");
  // saveFrontendFiles(mainContract, "MainContract");
  // saveFrontendFiles(factoryNFTContract, "FactoryNFTContract");
  // saveFrontendFiles(factoryFTContract, "FactoryFTContract");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
