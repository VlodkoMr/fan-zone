// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "../abstract/utils.sol";
import "../interfaces/IGovernanceContract.sol";

contract ChainlinkExecutor is Initializable, OwnableUpgradeable, UUPSUpgradeable, Utils {
	uint[] proposalEndBlocks;
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

			console.log("-------- add endBlock", endBlock);
		}

		blockProposals[endBlock].push(
			Proposal(contractAddress, proposalId, targets, values, calldatas, descriptionHash)
		);
	}

	function checkExecutions() public {
		console.log("-------- start checkExecutions");
		for (uint _i = 0; _i < proposalEndBlocks.length; ++_i) {
			if (proposalEndBlocks[_i] < block.number) {
				console.log("-------- block.number", block.number);

				for (uint _j = 0; _j < blockProposals[proposalEndBlocks[_i]].length; ++_j) {
					executeProposal(blockProposals[proposalEndBlocks[_i]][_j]);
					delete blockProposals[proposalEndBlocks[_i]][_j];
				}

				if (proposalEndBlocks.length > 1) {
					proposalEndBlocks[_i] = proposalEndBlocks[proposalEndBlocks.length - 1];
				}
				proposalEndBlocks.pop();
			}
		}
	}

	function executeProposal(Proposal memory proposal) internal {
		console.log("-------- execute proposal", proposal.proposalId);

		IGovernanceContract(proposal.contractAddress).execute(
			proposal.targets,
			proposal.values,
			proposal.calldatas,
			proposal.descriptionHash
		);
	}

}
