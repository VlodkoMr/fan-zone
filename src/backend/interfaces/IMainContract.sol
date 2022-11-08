// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

interface IMainContract {
	function isCommunityOwner(uint, address) external view returns (bool);

	function isContractExists(uint) external view returns (bool, bool, bool);

	function updateCommunityNFT(uint, address) external;

	function updateCommunityFT(uint, address) external;

	function updateCommunityDAO(uint, address) external;

	function updateCommunityTokenLock(uint, address) external;
}
