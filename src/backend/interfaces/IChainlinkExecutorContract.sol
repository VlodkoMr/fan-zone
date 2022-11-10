// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

interface IChainlinkExecutorContract {
	function addProposal(
		address contractAddress,
		uint proposalId,
		address[] memory targets,
		uint[] memory values,
		bytes[] memory calldatas,
		bytes32 descriptionHash
	) external;
}
