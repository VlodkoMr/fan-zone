// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import {IWorldID} from '../interfaces/IWorldID.sol';
import "../interfaces/IMainContract.sol";
import "./_NFTCollection.sol";

contract FactoryNFTContract is Initializable, OwnableUpgradeable, UUPSUpgradeable {

	event NewContract(
		uint indexed _communityId,
		address _contractAddress,
		string _contractType
	);

	address mainContractAddress;
	NFTCollection[] private contractsNFTList;
	IWorldID internal worldId;

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	function initialize(address _mainContractAddress, IWorldID _worldId) initializer public {
		__Ownable_init();
		__UUPSUpgradeable_init();
		mainContractAddress = _mainContractAddress;
		worldId = _worldId;
	}

	function _authorizeUpgrade(address newImplementation) internal onlyOwner override {}

	// Deploy NFT Collection Contract
	function deployNFTCollectionContract(
		uint _communityId,
		string memory _name,
		string memory _symbol
	) public {
		require(IMainContract(mainContractAddress).isCommunityOwner(_communityId, msg.sender), "No Access");
		require(bytes(_name).length >= 3, "Collection name should be longer than 2 symbols");
		require(bytes(_symbol).length >= 3 && bytes(_symbol).length <= 5, "Symbol length should be 3-5 chars");

		// Check community owner & get contract details
		(bool _isNFTContract,,) = IMainContract(mainContractAddress).isContractExists(_communityId);
		require(!_isNFTContract, "Community already have NFT Contract");

		NFTCollection collection = new NFTCollection(mainContractAddress, _name, _symbol, msg.sender, worldId);
		contractsNFTList.push(collection);

		// Update contract address
		IMainContract(mainContractAddress).updateCommunityNFT(_communityId, address(collection));

		emit NewContract(_communityId, address(collection), "NFT");
	}
}
