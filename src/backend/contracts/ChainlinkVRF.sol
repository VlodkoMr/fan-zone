// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
import '@chainlink/contracts/src/v0.8/ConfirmedOwner.sol';

contract ChainlinkVRF is VRFConsumerBaseV2, ConfirmedOwner {
	address mainContractAddress;
	uint public totalCommunityRaffles;
	mapping(uint => Raffle[]) public communityRaffles;

	struct Raffle {
		uint date;
		uint nftSeries;
		uint requestId;
		address[] participants;
		uint[] result;
	}

	event RequestSent(uint requestId, uint32 numWords);
	event RequestFulfilled(uint requestId, uint[] randomWords);

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

	constructor(address _mainContractAddress, uint64 _subscriptionId, address _coordinator, bytes32 _keyHash) VRFConsumerBaseV2(_coordinator) ConfirmedOwner(msg.sender) {
		COORDINATOR = VRFCoordinatorV2Interface(_coordinator);
		s_subscriptionId = _subscriptionId;
		keyHash = _keyHash;
		mainContractAddress = _mainContractAddress;
	}

	function requestRandomWords(uint _nftSeries, uint _communityId, address[] memory _participants, uint32 _winnersAmount) external returns (uint) {
		require(_winnersAmount <= 500, "Winners amount limit is 500 winners per raffle");
		require(msg.sender == mainContractAddress, "No Access to requestRandomWords");

		uint32 _callbackGasLimit = 100000 + _winnersAmount * 30000;
		uint requestId = COORDINATOR.requestRandomWords(
			keyHash,
			s_subscriptionId,
			requestConfirmations,
			_callbackGasLimit,
			_winnersAmount
		);

		// Add community raffle
		Raffle memory _raffle = Raffle(block.timestamp, _nftSeries, requestId, _participants, new uint[](0));
		Raffle[] storage currentRaffles = communityRaffles[_communityId];
		currentRaffles.push(_raffle);
		totalCommunityRaffles += 1;

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

	function fulfillRandomWords(uint _requestId, uint[] memory _randomWords) internal override {
		require(s_requests[_requestId].exists, 'request not found');

		RequestStatus storage _request = s_requests[_requestId];
		_request.fulfilled = true;
		_request.randomWords = _randomWords;
		emit RequestFulfilled(_requestId, _randomWords);

		Raffle storage raffle = communityRaffles[_request.communityId][_request.raffleIndex];
		uint[] memory _results = new uint[](_randomWords.length);

		for (uint _i = 0; _i < _randomWords.length; ++_i) {
			_results[_i] = (_randomWords[_i] % raffle.participants.length) + 1;
		}
		raffle.result = _results;
	}

	function getRequestStatus(uint _requestId) external view returns (bool fulfilled, uint[] memory randomWords) {
		require(s_requests[_requestId].exists, 'request not found');
		RequestStatus memory request = s_requests[_requestId];
		return (request.fulfilled, request.randomWords);
	}

	function getCommunityRaffleList(uint _communityId) public view returns (Raffle[] memory) {
		Raffle[] memory _result = new Raffle[](communityRaffles[_communityId].length);
		for (uint _i = 0; _i < communityRaffles[_communityId].length; ++_i) {
			_result[_i] = communityRaffles[_communityId][_i];
		}
		return _result;
	}

}
