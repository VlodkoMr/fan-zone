import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { addTransaction } from '../../../store/transactionSlice';
import { factoryGovernanceContract } from '../../../utils/contracts';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { Input, Button } from '@material-tailwind/react';

export function OneProposal({ proposal }) {
  const dispatch = useDispatch();
  const [voteData, setVoteData] = useState({
    id: "",
    option: "",
  });

  // ------------- Deploy TimeLock -------------

  const { config: configVote, error: errorVote } = usePrepareContractWrite({
    ...factoryGovernanceContract,
    enabled: voteData?.id.length > 0,
    functionName: 'castVote',
    args: [voteData?.id, voteData?.option]
  });

  const { data: voteTxData, write: voteWrite, status: voteStatus } = useContractWrite({
    ...configVote,
    onSuccess: ({ hash }) => {
      dispatch(addTransaction({
        hash: hash,
        description: `Voting...`
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

  const handleVote = (id, option) => {
    setVoteData({ id: id.toString(), option });
  }

  return (
    <div
      className={`text-gray-800 relative break-words bg-white rounded-lg shadow-gray-300/50 shadow-md px-8 py-6 mb-4`}>
      <div className={"font-medium text-base"}>{proposal.description}</div>
      <div className={"pt-4 mt-4 border-t border-dashed border-gray-300 text-right"}>
        <Button variant={"outlined"} size={"sm"} color={"red"} onClick={() => handleVote(0)}>
          Against
        </Button>
        <Button variant={"outlined"} size={"sm"} color={"gray"} className={"mx-2"} onClick={() => handleVote(2)}>
          Abstain
        </Button>
        <Button variant={"outlined"} size={"sm"} color={"green"} onClick={() => handleVote(1)}>
          Agree
        </Button>
      </div>
    </div>
  );
}
