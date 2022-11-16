// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

interface IChainlinkVRF {
	function requestRandomWords(uint, uint, address[] memory, uint32) external returns (uint);
}
