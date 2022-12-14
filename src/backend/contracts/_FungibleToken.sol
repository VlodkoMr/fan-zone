// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

import "../abstract/utils.sol";
import "../interfaces/IMainContract.sol";
import {ByteHasher} from '../helpers/ByteHasher.sol';
import {IWorldID} from '../interfaces/IWorldID.sol';

contract FungibleToken is ERC20, Pausable, Ownable, ERC20Permit, ERC20Votes, Utils {

	event CampaignAction(
		uint indexed _communityId,
		uint indexed _campaignId,
		uint indexed _campaignType,
		address _address,
		uint _deposit,
		string _email,
		uint _dateTime
	);

	using ByteHasher for bytes;
	address mainContractAddress;

	uint public campaignLastId;
	uint[] public campaignsList;
	mapping(uint => DistributionCampaign) distributionCampaigns;

	IWorldID internal worldId;
	uint256 internal immutable groupId = 1;
	mapping(uint => bool) internal nullifierHashes;
	mapping(uint => mapping(address => bool)) public mintedList;

	error InvalidNullifier();

	enum DistributionType {
		None,
		Public,
		Whitelist,
		Email,
		Event,
		CreditCard
	}

	struct DistributionCampaign {
		uint id;
		uint tokensTotal;
		uint tokensMinted;
		uint tokensPerUser;
		uint dateStart;
		uint dateEnd;
		uint eventCode;
		DistributionType distType;
		address[] whitelist;
		string worldcoinAction;
	}

	constructor(
		address _mainContract, string memory _name, string memory _symbol, address _owner, uint _supply, IWorldID _worldId
	) ERC20(_name, _symbol) ERC20Permit(_name) {
		mainContractAddress = _mainContract;
		_mint(_owner, _supply * 1e18);
		transferOwnership(_owner);
		worldId = _worldId;
	}

	function pause() public onlyOwner {
		_pause();
	}

	function unpause() public onlyOwner {
		_unpause();
	}

	// New distribution campaign
	function createDistributionCampaign(
		DistributionType _distType, uint _dateStart, uint _dateEnd, address[] memory _whitelist, string memory _worldcoinAction, uint _tokensTotal, uint _tokensPerUser
	) public payable onlyOwner {
		require(_dateStart <= _dateEnd, "Wrong campaign date range");

		uint _randomNumber = 0;
		if (_distType == DistributionType.Event) {
			_randomNumber = Utils.randomNumber(999999, 1);
		}

		IERC20(address(this)).transferFrom(msg.sender, address(this), _tokensTotal);

		campaignLastId += 1;
		campaignsList.push(campaignLastId);
		distributionCampaigns[campaignLastId] = DistributionCampaign(
			campaignLastId,
			_tokensTotal,
			0,
			_tokensPerUser,
			_dateStart,
			_dateEnd,
			_randomNumber,
			_distType,
			_whitelist,
			_worldcoinAction
		);
	}

	// Get all distribution campaigns
	function getCampaigns() public view returns (DistributionCampaign[] memory) {
		DistributionCampaign[] memory _campaigns = new DistributionCampaign[](campaignsList.length);
		for (uint _i = 0; _i < campaignsList.length; ++_i) {
			_campaigns[_i] = distributionCampaigns[campaignsList[_i]];
		}
		return _campaigns;
	}

	// Cancel distribution campaign
	function cancelDistributionCampaign(uint _campaignId) public onlyOwner {
		DistributionCampaign memory _campaign = distributionCampaigns[_campaignId];
		uint _returnAmount = _campaign.tokensTotal - _campaign.tokensMinted;

		for (uint _i = 0; _i < campaignsList.length; ++_i) {
			if (campaignsList[_i] == _campaignId) {
				if (campaignsList.length > 1) {
					campaignsList[_i] = campaignsList[campaignsList.length - 1];
				}
				campaignsList.pop();
			}
		}
		delete distributionCampaigns[_campaignId];

		// return unused tokens
		if (_returnAmount > 0) {
			IERC20(address(this)).transfer(msg.sender, _returnAmount);
		}
	}

	function sendTokenAirdrop(uint _communityId, address[] memory _whitelisted, uint _tokensAmount) public onlyOwner payable {
		require(_tokensAmount > 0, "Wrong tokens amount");
		require(_whitelisted.length > 0, "Wrong list of addresses");

		uint _tokensPerAddress = _tokensAmount / _whitelisted.length;
		for (uint _i = 0; _i < _whitelisted.length; ++_i) {
			IERC20(address(this)).transferFrom(msg.sender, address(_whitelisted[_i]), _tokensPerAddress);
		}

		// Add stats event
		emit CampaignAction(
			_communityId,
			0,
			3,
			msg.sender,
			_tokensAmount,
			"",
			block.timestamp
		);
	}

	function claimFromCampaign(uint _communityId, uint _campaignId, uint _eventCode, string memory _email,
		uint root, uint nullifierHash, uint[8] calldata proof) public whenNotPaused payable {

		DistributionCampaign storage campaign = distributionCampaigns[_campaignId];
		require(campaign.tokensMinted + campaign.tokensPerUser <= campaign.tokensTotal, "Not enough tokens to claim");
		require(mintedList[_campaignId][msg.sender] == false, "You already claim tokens");

		// check worldID
		if (bytes(campaign.worldcoinAction).length > 0) {
			if (nullifierHashes[nullifierHash]) revert InvalidNullifier();
			worldId.verifyProof(
				root,
				groupId,
				abi.encodePacked(msg.sender).hashToField(),
				nullifierHash,
				abi.encodePacked(address(this)).hashToField(),
				proof
			);
			nullifierHashes[nullifierHash] = true;
		}

		// check Event Code
		if (campaign.distType == DistributionType.Event) {
			require(campaign.eventCode == _eventCode, "Wrong Event Code");
		}

		campaign.tokensMinted += campaign.tokensPerUser;
		mintedList[_campaignId][msg.sender] = true;

		// transfer tokens
		IERC20(address(this)).transfer(msg.sender, campaign.tokensPerUser);

		// Add stats event
		emit CampaignAction(
			_communityId,
			_campaignId,
			2,
			msg.sender,
			msg.value,
			_email,
			block.timestamp
		);
	}

	function _beforeTokenTransfer(address from, address to, uint256 amount) internal whenNotPaused override {
		super._beforeTokenTransfer(from, to, amount);
	}

	function _afterTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Votes) {
		super._afterTokenTransfer(from, to, amount);
	}

	function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
		super._mint(to, amount);
	}

	function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
		super._burn(account, amount);
	}
}
