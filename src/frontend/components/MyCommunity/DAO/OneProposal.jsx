import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { addTransaction } from '../../../store/transactionSlice';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { Button } from '@material-tailwind/react';
import GovernanceABI from "../../../contractsData/Governance.json";

export function OneProposal({ proposal, showBlocks, canVote, currentCommunity, currentBlockNumber }) {
  const dispatch = useDispatch();
  const [voteData, setVoteData] = useState({
    id: "",
    option: "",
  });

  // ------------- Deploy TimeLock -------------

  const { config: configVote, error: errorVote } = usePrepareContractWrite({
    addressOrName: currentCommunity?.daoContract,
    contractInterface: GovernanceABI.abi,
    enabled: canVote && voteData?.id.toString().length > 0,
    functionName: 'castVote',
    args: [voteData?.id, voteData?.option]
  });

  const { data: voteTxData, write: voteWrite, status: voteStatus } = useContractWrite({
    ...configVote,
    onSuccess: ({ hash }) => {
      dispatch(addTransaction({
        hash: hash,
        description: `Voting for proposal`
      }));
    },
    onError: ({ message }) => {
      resetForm();
      console.log('onError message', message);
    },
  });

  useWaitForTransaction({
    hash: voteTxData?.hash,
    onError: error => {
      console.log('is err', error);
      resetForm();
    },
    onSuccess: data => {
      if (data) {
        resetForm();
        console.log(`update info...`);
      }
    },
  });

  const resetForm = () => {
    setVoteData({
      id: "",
      option: "",
    });
  }

  useEffect(() => {
    if (voteWrite && voteStatus !== 'loading') {
      voteWrite();
    }
  }, [voteWrite]);

  useEffect(() => {
    console.log(`errorVote`, errorVote);
  }, [errorVote]);

  // ------------- Actions -------------

  const handleVote = (option) => {
    setVoteData({ id: proposal.proposalId, option });
  }

  return (
    <div
      className={`text-gray-800 relative break-words bg-white rounded-lg shadow-gray-300/50 shadow-md px-8 py-6 mb-4`}>
      <div className={"font-medium text-base"}>{proposal.description}</div>
      {canVote && (
        <div className={"pt-4 mt-4 border-t border-dashed border-gray-300 text-center text-gray-600"}>
          {(currentBlockNumber >= proposal.startBlock && currentBlockNumber < proposal.endBlock) && (
            <>
              <Button variant={"outlined"} size={"sm"} color={"red"} onClick={() => handleVote(0)}>
                Against
              </Button>
              <Button variant={"outlined"} size={"sm"} color={"gray"} className={"mx-2"} onClick={() => handleVote(2)}>
                Abstain
              </Button>
              <Button variant={"outlined"} size={"sm"} color={"green"} onClick={() => handleVote(1)}>
                Agree
              </Button>
            </>
          )}
        </div>
      )}

      {showBlocks && (
        <div className={"pt-4 mt-4 border-t border-dashed border-gray-300 text-gray-600"}>
          <span>Start Block: {proposal.startBlock}</span>
          <span className={"mx-5"}>End Block: {proposal.endBlock}</span>

          {currentBlockNumber < proposal.startBlock && (
            <span className={"font-semibold text-gray-400"}>Voting not Started</span>
          )}
          {currentBlockNumber > proposal.endBlock && (
            <span className={"font-semibold text-red-600"}>Voting End</span>
          )}
          {(currentBlockNumber >= proposal.startBlock && currentBlockNumber < proposal.endBlock) && (
            <span className={"font-semibold text-green-600"}>Active Voting</span>
          )}
        </div>
      )}
    </div>
  );
}
