// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "hardhat/console.sol";
import "../abstract/utils.sol";
import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
import '@chainlink/contracts/src/v0.8/ConfirmedOwner.sol';

contract ChainlinkVRF is VRFConsumerBaseV2, ConfirmedOwner, Utils {
	mapping(uint => Raffle[]) public communityRaffles;

	struct Raffle {
		uint requestId;
		uint maxValue;
		uint[] result;
	}

	event RequestSent(uint256 requestId, uint32 numWords);
	event RequestFulfilled(uint256 requestId, uint256[] randomWords);

	struct RequestStatus {
		bool fulfilled;
		bool exists;
		uint[] randomWords;
		uint communityId;
		uint raffleIndex;
	}

	mapping(uint => RequestStatus) public s_requests;
	VRFCoordinatorV2Interface COORDINATOR;
	uint64 s_subscriptionId;
	uint[] public requestIds;
	uint public lastRequestId;
	bytes32 keyHash;
	uint16 requestConfirmations = 3;

	constructor(uint64 _subscriptionId, address _coordinator, bytes32 _keyHash) VRFConsumerBaseV2(_coordinator) ConfirmedOwner(msg.sender) {
		COORDINATOR = VRFCoordinatorV2Interface(_coordinator);
		s_subscriptionId = _subscriptionId;
		keyHash = _keyHash;
	}

	function requestRandomWords(uint _communityId, uint _maxValue, uint32 _winnersAmount) external onlyOwner returns (uint256 requestId) {
		require(_winnersAmount <= 110, "Winners amount limit is 110 winners per raffle");

		uint32 _callbackGasLimit = _winnersAmount * 22000;
		requestId = COORDINATOR.requestRandomWords(
			keyHash,
			s_subscriptionId,
			requestConfirmations,
			_callbackGasLimit,
			_winnersAmount
		);

		// Add community raffle
		communityRaffles[_communityId].push(Raffle({
			requestId : requestId,
			maxValue : _maxValue,
			result : new uint[](0)
		}));

		s_requests[requestId] = RequestStatus({
			randomWords : new uint[](0),
			exists : true,
			fulfilled : false,
			communityId : _communityId,
			raffleIndex : communityRaffles[_communityId].length - 1
		});
		requestIds.push(requestId);
		lastRequestId = requestId;
		emit RequestSent(requestId, _winnersAmount);

		return requestId;
	}

	function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
		require(s_requests[_requestId].exists, 'request not found');
		s_requests[_requestId].fulfilled = true;
		s_requests[_requestId].randomWords = _randomWords;
		emit RequestFulfilled(_requestId, _randomWords);

		RequestStatus storage _request = s_requests[_requestId];
		Raffle storage raffle = communityRaffles[_request.communityId][_request.raffleIndex];

		uint[] memory _results = new uint[](_randomWords.length);
		for (uint _i = 0; _i < _randomWords.length; ++_i) {
			_results[_i] = (_randomWords[_i] % raffle.maxValue) + 1;
		}
		raffle.result = _results;
	}

	function getRequestStatus(uint256 _requestId) external view returns (bool fulfilled, uint256[] memory randomWords) {
		require(s_requests[_requestId].exists, 'request not found');
		RequestStatus memory request = s_requests[_requestId];
		return (request.fulfilled, request.randomWords);
	}

}
