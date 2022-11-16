// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

interface IChainlinkVRF {
	function requestRandomWords(uint, uint, uint32) external returns (uint);
}
