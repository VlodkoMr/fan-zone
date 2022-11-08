// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/governance/utils/IVotes.sol";

import "./_GovernanceTimeLock.sol";
import "../interfaces/IMainContract.sol";

contract FactoryTimeLockContract is Initializable, OwnableUpgradeable, UUPSUpgradeable {
	address mainContractAddress;
	TimelockController[] private contractsList;

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	function initialize(address _mainContractAddress) initializer public {
		__Ownable_init();
		__UUPSUpgradeable_init();
		mainContractAddress = _mainContractAddress;
	}

	function _authorizeUpgrade(address newImplementation) internal onlyOwner override {}

	// Deploy DAO TimeLock Contract
	function deployGovernanceTimeLockContract(
		uint _communityId,
		address[] memory _proposers,
		address[] memory _executors
	) public {
		require(IMainContract(mainContractAddress).isCommunityOwner(_communityId, msg.sender), "No Access");
		require(_proposers.length >= 0, "Provide proposers list");

		uint _initialVotingDelay = 1;
		// Check community owner & get contract details
		(,bool _isFTContract, bool _isDAOContract) = IMainContract(mainContractAddress).isContractExists(_communityId);
		require(!_isDAOContract, "Community already have DAO Contract");
		require(_isFTContract, "Community don't have Token for voting");

		TimelockController _contractTimeLock = new GovernanceTimeLock(_initialVotingDelay, _proposers, _executors);
		contractsList.push(_contractTimeLock);

		bytes32 _adminRole = _contractTimeLock.TIMELOCK_ADMIN_ROLE();
		_contractTimeLock.revokeRole(_adminRole, msg.sender);

		// Update contract address
		IMainContract(mainContractAddress).updateCommunityTokenLock(_communityId, address(_contractTimeLock));
	}
}
