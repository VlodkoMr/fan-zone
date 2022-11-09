import { ethers } from "ethers";

import mainContractLocal from '../contractsData/localhost/MainContract-address.json';
import factoryNFTContractLocal from '../contractsData/localhost/FactoryNFTContract-address.json';
import factoryFTContractLocal from '../contractsData/localhost/FactoryFTContract-address.json';
import factoryGovernanceContractLocal from '../contractsData/localhost/FactoryGovernanceContract-address.json';
import factoryTimeLockContractLocal from '../contractsData/localhost/FactoryTimeLockContract-address.json';

// import mainContractAurora from '../contractsData/aurora/MainContract-address.json';
// import factoryNFTContractAurora from '../contractsData/aurora/FactoryNFTContract-address.json';
// import factoryFTContractAurora from '../contractsData/aurora/FactoryFTContract-address.json';
// import factoryGovernanceContractAurora from '../contractsData/aurora/FactoryGovernanceContract-address.json';

import { Interface } from "ethers/lib/utils";
import mainContractABI from '../contractsData/MainContract.json';
import factoryNFTContractABI from '../contractsData/FactoryNFTContract.json';
import factoryFTContractABI from '../contractsData/FactoryFTContract.json';
import factoryGovernanceContractABI from '../contractsData/FactoryGovernanceContract.json';
import factoryTimeLockContractABI from '../contractsData/FactoryTimeLockContract.json';
import GovernanceABI from "../contractsData/Governance.json";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const network = await provider.getNetwork();
const chainId = network.chainId;

let mainAddress = mainContractLocal.address;
let factoryNFTAddress = factoryNFTContractLocal.address;
let factoryFTAddress = factoryFTContractLocal.address;
let factoryGovernanceAddress = factoryGovernanceContractLocal.address;
let factoryTimeLockAddress = factoryTimeLockContractLocal.address;

// switch (chainId) {
//   // case 1313161555:
//   case 1313161554:
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

export const governanceInterface = new Interface(GovernanceABI.abi);
