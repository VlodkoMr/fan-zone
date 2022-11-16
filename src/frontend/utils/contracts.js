import { ethers } from "ethers";

import mainContractLocal from '../contractsData/localhost/MainContract-address.json';
import factoryNFTContractLocal from '../contractsData/localhost/FactoryNFTContract-address.json';
import factoryFTContractLocal from '../contractsData/localhost/FactoryFTContract-address.json';
import factoryGovernanceContractLocal from '../contractsData/localhost/FactoryGovernanceContract-address.json';
import factoryTimeLockContractLocal from '../contractsData/localhost/FactoryTimeLockContract-address.json';
import chainlinkExecutionContractLocal from '../contractsData/localhost/ChainlinkExecutor-address.json';
import chainlinkVRFContractLocal from '../contractsData/localhost/ChainlinkVRF-address.json';

import mainContractMumbai from '../contractsData/mumbai/MainContract-address.json';
import factoryNFTContractMumbai from '../contractsData/mumbai/FactoryNFTContract-address.json';
import factoryFTContractMumbai from '../contractsData/mumbai/FactoryFTContract-address.json';
import factoryTimeLockContractMumbai from '../contractsData/mumbai/FactoryTimeLockContract-address.json';
import chainlinkExecutionContractMumbai from '../contractsData/mumbai/ChainlinkExecutor-address.json';
import factoryGovernanceContractMumbai from '../contractsData/mumbai/FactoryGovernanceContract-address.json';
import chainlinkVRFContractMumbai from '../contractsData/mumbai/ChainlinkVRF-address.json';

import { Interface } from "ethers/lib/utils";
import mainContractABI from '../contractsData/MainContract.json';
import factoryNFTContractABI from '../contractsData/FactoryNFTContract.json';
import factoryFTContractABI from '../contractsData/FactoryFTContract.json';
import factoryGovernanceContractABI from '../contractsData/FactoryGovernanceContract.json';
import factoryTimeLockContractABI from '../contractsData/FactoryTimeLockContract.json';
import ChainlinkExecutorContractABI from '../contractsData/ChainlinkExecutor.json';
import ChainlinkVRFABI from "../contractsData/ChainlinkVRF.json";
import GovernanceABI from "../contractsData/Governance.json";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const network = await provider.getNetwork();
const chainId = network.chainId;

let mainAddress = mainContractLocal.address;
let factoryNFTAddress = factoryNFTContractLocal.address;
let factoryFTAddress = factoryFTContractLocal.address;
let factoryGovernanceAddress = factoryGovernanceContractLocal.address;
let chainlinkExecutionAddress = chainlinkExecutionContractLocal.address;
let factoryTimeLockAddress = factoryTimeLockContractLocal.address;
let chainlinkVRFAddress = chainlinkVRFContractLocal.address;

switch (chainId) {
  // case 1313161554:
  case 80001:
    mainAddress = mainContractMumbai.address;
    factoryNFTAddress = factoryNFTContractMumbai.address;
    factoryFTAddress = factoryFTContractMumbai.address;
    factoryGovernanceAddress = factoryGovernanceContractMumbai.address;
    chainlinkExecutionAddress = chainlinkExecutionContractMumbai.address;
    factoryTimeLockAddress = factoryTimeLockContractMumbai.address;
    chainlinkVRFAddress = chainlinkVRFContractMumbai.address;
    break;
}

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
  addressOrName: chainlinkExecutionAddress,
  contractInterface: ChainlinkExecutorContractABI.abi,
}

export const chainlinkVRFContract = {
  addressOrName: chainlinkVRFAddress,
  contractInterface: ChainlinkVRFABI.abi,
}

export const governanceInterface = new Interface(GovernanceABI.abi);
