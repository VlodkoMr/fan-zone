// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "../abstract/utils.sol";
import "../interfaces/IGovernanceContract.sol";

contract ChainlinkExecutor is Initializable, OwnableUpgradeable, UUPSUpgradeable, Utils {
	uint[] public proposalEndBlocks;
	mapping(uint => Proposal[]) public blockProposals;

	struct Proposal {
		address contractAddress;
		uint proposalId;
		address[] targets;
		uint[] values;
		bytes[] calldatas;
		bytes32 descriptionHash;
	}

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	function initialize() initializer public {
		__Ownable_init();
		__UUPSUpgradeable_init();
	}

	function _authorizeUpgrade(address newImplementation) internal onlyOwner override {}

	function addProposal(
		address contractAddress,
		uint proposalId,
		address[] memory targets,
		uint[] memory values,
		bytes[] memory calldatas,
		bytes32 descriptionHash
	) external {
		uint endBlock = IGovernanceContract(contractAddress).proposalDeadline(proposalId);

		(, bool _exists) = Utils.indexOf(proposalEndBlocks, endBlock);
		if (!_exists) {
			proposalEndBlocks.push(endBlock);
		}

		blockProposals[endBlock].push(
			Proposal(contractAddress, proposalId, targets, values, calldatas, descriptionHash)
		);
	}

	function checkExecutions() public {
		for (uint _i = 0; _i < proposalEndBlocks.length; ++_i) {
			if (proposalEndBlocks[_i] < block.number) {
				for (uint _j = 0; _j < blockProposals[proposalEndBlocks[_i]].length; ++_j) {
					executeProposal(proposalEndBlocks[_i], _j);
				}

				if (proposalEndBlocks.length > 1) {
					proposalEndBlocks[_i] = proposalEndBlocks[proposalEndBlocks.length - 1];
				}
				proposalEndBlocks.pop();
			}
		}
	}

	function executeProposal(uint _blockNumber, uint _index) internal {
		Proposal memory proposal = blockProposals[_blockNumber][_index];

		IGovernanceContract(proposal.contractAddress).queue(
			proposal.targets,
			proposal.values,
			proposal.calldatas,
			proposal.descriptionHash
		);
		uint proposalId = IGovernanceContract(proposal.contractAddress).execute(
			proposal.targets,
			proposal.values,
			proposal.calldatas,
			proposal.descriptionHash
		);
	}

}