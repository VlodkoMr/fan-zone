const hre = require("hardhat");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


const { saveAllFrontendFiles, saveFrontendArtifact } = require('./utils');

async function main() {

  const worldIDAddress = await fetch('https://developer.worldcoin.org/api/v1/contracts')
    .then(res => res.json().then(res => res.find(({ key }) => key === 'staging.semaphore.wld.eth').value));

  console.log(`worldIDAddress`, worldIDAddress);

  // Deploy main contract
  const MainContract = await hre.ethers.getContractFactory("MainContract");
  const mainContract = await hre.upgrades.deployProxy(MainContract, [], {
    initializer: "initialize"
  })
  await mainContract.deployed();

  // Deploy NFT factory contract
  const FactoryNFTContract = await hre.ethers.getContractFactory("FactoryNFTContract");
  const factoryNFTContract = await hre.upgrades.deployProxy(FactoryNFTContract, [mainContract.address, worldIDAddress], {
    initializer: "initialize"
  })
  await factoryNFTContract.deployed();

  // Deploy FT factory contract
  const FactoryFTContract = await hre.ethers.getContractFactory("FactoryFTContract");
  const factoryFTContract = await hre.upgrades.deployProxy(FactoryFTContract, [mainContract.address, worldIDAddress], {
    initializer: "initialize"
  })
  await factoryFTContract.deployed();

  // Deploy Governance factory contract
  const FactoryGovernanceContract = await hre.ethers.getContractFactory("FactoryGovernanceContract");
  const factoryGovernanceContract = await hre.upgrades.deployProxy(FactoryGovernanceContract, [mainContract.address], {
    initializer: "initialize"
  })
  await factoryGovernanceContract.deployed();

  // Deploy Governance factory contract
  const FactoryTimeLockContract = await hre.ethers.getContractFactory("FactoryTimeLockContract");
  const factoryTimeLockContract = await hre.upgrades.deployProxy(FactoryTimeLockContract, [mainContract.address], {
    initializer: "initialize"
  })
  await factoryTimeLockContract.deployed();

  // Update main contract - add factory address
  const MainContractInstance = await hre.ethers.getContractAt("MainContract", mainContract.address);
  await MainContractInstance.updateFactoryContractsAddress(
    factoryNFTContract.address,
    factoryFTContract.address,
    factoryGovernanceContract.address,
    factoryTimeLockContract.address
  );

  console.log("Main Contract: ", mainContract.address);
  console.log("Factory NFT Contract: ", factoryNFTContract.address);
  console.log("Factory FT Contract: ", factoryFTContract.address);
  console.log("Factory TimeLock Contract: ", factoryTimeLockContract.address);
  console.log("Factory Governance Contract: ", factoryGovernanceContract.address);

  // Save ABI & Address
  saveAllFrontendFiles(mainContract, "MainContract");
  saveAllFrontendFiles(factoryNFTContract, "FactoryNFTContract");
  saveAllFrontendFiles(factoryFTContract, "FactoryFTContract");
  saveAllFrontendFiles(factoryTimeLockContract, "FactoryTimeLockContract");
  saveAllFrontendFiles(factoryGovernanceContract, "FactoryGovernanceContract");

  // Save user contracts ABI
  saveFrontendArtifact("NFTCollection");
  saveFrontendArtifact("FungibleToken");
  saveFrontendArtifact("Governance");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
