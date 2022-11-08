// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/governance/utils/IVotes.sol";

import "./_Governance.sol";
import "../interfaces/IMainContract.sol";

contract FactoryGovernanceContract is Initializable, OwnableUpgradeable, UUPSUpgradeable {

	event NewContract(
		uint indexed _communityId,
		address _contractAddress,
		string _contractType
	);

	address mainContractAddress;
	Governance[] private contractsList;

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

	// Deploy DAO Contract
	function deployGovernanceContract(
		uint _communityId,
		IVotes _ftContractAddress,
		TimelockController _governanceTimeLock,
		uint _quorum,
		uint _delay,
		uint _period
	) public {
		require(IMainContract(mainContractAddress).isCommunityOwner(_communityId, msg.sender), "No Access");
		require(_quorum > 0, "Wrong quorum value");
		require(_delay >= 0, "Wrong delay value");
		require(_period > 0, "Wrong Voting Period value");

		// Check community owner & get contract details
		(,bool _isFTContract, bool _isDAOContract) = IMainContract(mainContractAddress).isContractExists(_communityId);
		require(!_isDAOContract, "Community already have DAO Contract");
		require(_isFTContract, "Community don't have Token for voting");

		Governance _contractDAO = new Governance(mainContractAddress, _ftContractAddress, _governanceTimeLock, _quorum, _delay, _period);
		contractsList.push(_contractDAO);

		// Transfer ownership to timeLock
		_contractDAO.transferOwnership(address(_governanceTimeLock));

		// Update contract address
		IMainContract(mainContractAddress).updateCommunityDAO(_communityId, address(_contractDAO));

		emit NewContract(_communityId, address(_contractDAO), "Governance");
	}
}
