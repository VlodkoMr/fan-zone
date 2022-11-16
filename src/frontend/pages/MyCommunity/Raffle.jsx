import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { InnerBlock, InnerTransparentBlock } from '../../assets/css/common.style';
import { Button } from "@material-tailwind/react";
import { useContract, useContractRead, useContractWrite, usePrepareContractWrite, useProvider, useWaitForTransaction } from "wagmi";
import { chainlinkVRFContract, mainContract } from "../../utils/contracts";
import { addTransaction } from "../../store/transactionSlice";

export const Raffle = () => {
  const provider = useProvider();
  const dispatch = useDispatch();
  const currentCommunity = useSelector(state => state.community.current);

  const chainlinkVRF = useContract({
    ...chainlinkVRFContract,
    signerOrProvider: provider
  });

  const { data: raffles } = useContractRead({
    ...chainlinkVRF,
    enabled: currentCommunity?.id?.length > 0,
    functionName: "getCommunityRaffles",
    args: [currentCommunity.id]
  });

  // ------------ New Raffle -------------

  const { config: configRaffle, error: errorRaffle } = usePrepareContractWrite({
    ...mainContract,
    functionName: 'newRaffle',
    args: ["1", 100, 2]
  });

  const { data: raffleData, write: raffleWrite } = useContractWrite({
    ...configRaffle,
    onSuccess: ({ hash }) => {
      dispatch(addTransaction({
        hash: hash,
        description: `Create new Raffle`
      }));
    },
    onError: ({ message }) => {
      console.log('onError message', message);
    },
  });

  useWaitForTransaction({
    hash: raffleData?.hash,
    onError: error => {
      console.log('is err', error)
    },
    onSuccess: data => {
      if (data) {
        console.log(`onSuccess`);
      }
    },
  });

  useEffect(() => {
    console.log(`errorRaffle`, errorRaffle);
  }, [errorRaffle]);

  useEffect(() => {
    console.log(`mainContract`, mainContract);
    console.log(`raffleWrite`, raffleWrite);
  }, [raffleWrite]);

  useEffect(() => {
    console.log(`currentCommunity`, currentCommunity);
  }, [currentCommunity]);

  const handleNewRaffle = () => {
    raffleWrite();
  }

  useEffect(() => {
    console.log(`currentCommunity`, currentCommunity);
    console.log(`raffles`, raffles);
  }, [raffles]);

  return (
    <div>
      <InnerTransparentBlock>
        <InnerBlock.Header className="flex justify-between">
          <span>Raffle (coming soon)</span>
          <div className="-mt-3 justify-end">
            <Button onClick={() => handleNewRaffle()}>
              New Raffle
            </Button>
          </div>
        </InnerBlock.Header>
      </InnerTransparentBlock>

      <InnerBlock className={"flex-1"}>
        <div className="flex-auto">
          Create raffle and <b>get random winners</b> from your NFT Holders!
        </div>
      </InnerBlock>
    </div>
  );
}
