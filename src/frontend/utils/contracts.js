import { ethers } from "ethers";

import mainContractLocal from '../contractsData/localhost/MainContract-address.json';
import factoryNFTContractLocal from '../contractsData/localhost/FactoryNFTContract-address.json';
import factoryFTContractLocal from '../contractsData/localhost/FactoryFTContract-address.json';
// import mainContractAurora from '../contractsData/aurora_testnet/MainContract-address.json';
// import factoryNFTContractAurora from '../contractsData/aurora_testnet/FactoryNFTContract-address.json';
// import factoryFTContractAurora from '../contractsData/aurora_testnet/FactoryFTContract-address.json';

import mainContractABI from '../contractsData/MainContract.json';
import factoryNFTContractABI from '../contractsData/FactoryNFTContract.json';
import factoryFTContractABI from '../contractsData/FactoryFTContract.json';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const network = await provider.getNetwork();
const chainId = network.chainId;

let mainAddress = mainContractLocal.address;
let factoryNFTAddress = factoryNFTContractLocal.address;
let factoryFTAddress = factoryFTContractLocal.address;

// switch (chainId) {
//   case 1313161555:
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
