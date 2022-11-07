import React, { useEffect } from "react";
import { useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { useDispatch } from 'react-redux';
import { addTransaction } from '../../store/transactionSlice';
import { Button } from '@material-tailwind/react';
import { isContractAddress } from "../../utils/format";

export function PauseUnpausePopup({ contractAddress, contractABI, handleSuccess }) {
  const dispatch = useDispatch();

  // ---------- Read data ----------

  const { data: isPaused, refetch: refetchIsPaused } = useContractRead({
    addressOrName: contractAddress,
    enabled: contractAddress.length > 0 && isContractAddress(contractAddress),
    contractInterface: contractABI.abi,
    functionName: "paused",
  });

  // ---------- Pause ----------

  const { config: configPause } = usePrepareContractWrite({
    addressOrName: contractAddress,
    enabled: contractAddress.length > 0 && isContractAddress(contractAddress) && !isPaused,
    contractInterface: contractABI.abi,
    functionName: 'pause',
  });

  const { data: pauseData, write: pauseWrite, error: errorPause } = useContractWrite({
    ...configPause,
    onSuccess: ({ hash }) => {
      dispatch(addTransaction({
        hash: hash,
        description: `Pause Contract`
      }));
    },
    onError: ({ message }) => {
      console.log('onError message', message);
    },
  });

  useWaitForTransaction({
    hash: pauseData?.hash,
    onError: error => {
      console.log('is err', error)
    },
    onSuccess: data => {
      if (data) {
        handleSuccess?.();
        refetchIsPaused();
      }
    },
  });

  const handlePause = () => {
    if (confirm("Paused contract don't allow minting or transfer NFT. Are you sure?")) {
      pauseWrite();
    }
  }

  // ---------- UnPause ----------

  const { config: configUnPause, error: errorUnPause } = usePrepareContractWrite({
    addressOrName: contractAddress,
    contractInterface: contractABI.abi,
    enabled: contractAddress.length > 0 && isContractAddress(contractAddress) && isPaused,
    functionName: 'unpause',
  });

  const { data: unPauseData, write: unPauseWrite } = useContractWrite({
    ...configUnPause,
    onSuccess: ({ hash }) => {
      dispatch(addTransaction({
        hash: hash,
        description: `Unpause Contract`
      }));
    },
    onError: ({ message }) => {
      console.log('onError message', message);
    },
  });

  useWaitForTransaction({
    hash: unPauseData?.hash,
    onError: error => {
      console.log('is err', error)
    },
    onSuccess: data => {
      if (data) {
        handleSuccess?.();
        refetchIsPaused();
      }
    },
  });

  const handleUnPause = () => {
    if (confirm("Please confirm to Unpause contract")) {
      unPauseWrite();
    }
  }

  return isPaused ? (
    <Button size="sm"
            color="orange"
            className={"px-3 py-0.5"}
            onClick={handleUnPause}>
      UnPause Contract
    </Button>) : (
    <Button size="sm"
            color="red"
            variant="outlined"
            className={"px-3 py-0.5"}
            onClick={handlePause}>
      Pause Contract
    </Button>);
}
