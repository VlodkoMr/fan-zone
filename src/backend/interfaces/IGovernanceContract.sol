// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

interface IGovernanceContract {
	function execute(
		address[] memory,
		uint[] memory,
		bytes[] memory,
		bytes32
	) payable external returns (uint);

	function proposalDeadline(
		uint
	) external view returns (uint);
}
