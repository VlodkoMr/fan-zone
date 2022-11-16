import { ethers } from "ethers";

import mainContractLocal from '../contractsData/localhost/MainContract-address.json';
import factoryNFTContractLocal from '../contractsData/localhost/FactoryNFTContract-address.json';
import factoryFTContractLocal from '../contractsData/localhost/FactoryFTContract-address.json';
import factoryGovernanceContractLocal from '../contractsData/localhost/FactoryGovernanceContract-address.json';
import factoryTimeLockContractLocal from '../contractsData/localhost/FactoryTimeLockContract-address.json';
import executionContractLocal from '../contractsData/localhost/ChainlinkExecutor-address.json';

// import mainContractMumbai from '../contractsData/mumbai/MainContract-address.json';
// import factoryNFTContractMumbai from '../contractsData/mumbai/FactoryNFTContract-address.json';
// import factoryFTContractMumbai from '../contractsData/mumbai/FactoryFTContract-address.json';
// import factoryGovernanceContractMumbai from '../contractsData/mumbai/FactoryGovernanceContract-address.json';

import { Interface } from "ethers/lib/utils";
import mainContractABI from '../contractsData/MainContract.json';
import factoryNFTContractABI from '../contractsData/FactoryNFTContract.json';
import factoryFTContractABI from '../contractsData/FactoryFTContract.json';
import factoryGovernanceContractABI from '../contractsData/FactoryGovernanceContract.json';
import ChainlinkExecutorContractABI from '../contractsData/ChainlinkExecutor.json';
import factoryTimeLockContractABI from '../contractsData/FactoryTimeLockContract.json';
import GovernanceABI from "../contractsData/Governance.json";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const network = await provider.getNetwork();
const chainId = network.chainId;

let mainAddress = mainContractLocal.address;
let factoryNFTAddress = factoryNFTContractLocal.address;
let factoryFTAddress = factoryFTContractLocal.address;
let factoryGovernanceAddress = factoryGovernanceContractLocal.address;
let executionAddress = executionContractLocal.address;
let factoryTimeLockAddress = factoryTimeLockContractLocal.address;

// switch (chainId) {
//   // case 1313161554:
//   case 80001:
//     mainAddress = mainContractAurora.address;
//     factoryNFTAddress = factoryNFTContractAurora.address;
//     factoryFTAddress = factoryFTContractAurora.address;
//     break;
// }

export const mainContract = {
  addressOrName: mainAddress,
  contractInterface: mainContractABI.abi,
}

export const factoryNFTContract = {
  addressOrName: factoryNFTAddress,
  contractInterface: factoryNFTContractABI.abi,
}

export const factoryFTContract = {
  addressOrName: factoryFTAddress,
  contractInterface: factoryFTContractABI.abi,
}

export const factoryTimeLockContract = {
  addressOrName: factoryTimeLockAddress,
  contractInterface: factoryTimeLockContractABI.abi,
}

export const factoryGovernanceContract = {
  addressOrName: factoryGovernanceAddress,
  contractInterface: factoryGovernanceContractABI.abi,
}

export const executionContract = {
  addressOrName: executionAddress,
  contractInterface: ChainlinkExecutorContractABI.abi,
}

export const governanceInterface = new Interface(GovernanceABI.abi);
