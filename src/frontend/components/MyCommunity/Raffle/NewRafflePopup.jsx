import React, { useEffect, useState } from "react";
import { useContract, useContractWrite, usePrepareContractWrite, useProvider, useWaitForTransaction } from 'wagmi';
import { useDispatch } from 'react-redux';
import { addTransaction } from '../../../store/transactionSlice';
import { Loader } from '../../Loader';
import { Input, Button, Option, Select } from '@material-tailwind/react';
import { Popup } from '../../Popup';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { mainContract } from "../../../utils/contracts";
import NFTCollectionABI from "../../../contractsData/NFTCollection.json";

export function NewRafflePopup(
  {
    popupVisible,
    setPopupVisible,
    handleSuccess,
    currentCommunity,
    collectionItems
  }) {
  const dispatch = useDispatch();
  const provider = useProvider();
  const [isLoading, setIsLoading] = useState(false);
  const [newRaffle, setNewRaffle] = useState({});
  const [formData, setFormData] = useState({
    nftSeries: "",
    countWinners: 0,
    addressList: []
  });

  const myNFTContract = {
    addressOrName: currentCommunity?.nftContract,
    contractInterface: NFTCollectionABI.abi,
  };

  const contractNFT = useContract({
    ...myNFTContract,
    signerOrProvider: provider
  });

  const { config: configRaffle, error: errorRaffle } = usePrepareContractWrite({
    ...mainContract,
    functionName: 'newRaffle',
    enabled: currentCommunity?.id?.length > 0 && newRaffle.countWinners > 0,
    args: [newRaffle.nftSeries, currentCommunity?.id, newRaffle.addressList, newRaffle.countWinners]
  });

  const { data: raffleData, write: raffleWrite, status: raffleStatus } = useContractWrite({
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
        resetForm();
        setPopupVisible(false);
        handleSuccess?.();
      }
    },
  });

  const handleCreateRaffle = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const actionsFilterNFT = await contractNFT.filters.CampaignAction(currentCommunity.id, formData.nftSeries.toString(), 1);
    const actionsNFT = await contractNFT.queryFilter(actionsFilterNFT);
    const addressList = actionsNFT.map(event => event.args._address);

    if (addressList.length > 500) {
      alert("Winners amount limit is 500 winners per raffle");
      return;
    }
    if (addressList.length < formData.countWinners) {
      alert("Not enough participants for this count of winners");
      return;
    }

    setNewRaffle({
      nftSeries: formData.nftSeries,
      countWinners: formData.countWinners,
      addressList
    });
  }

  const resetForm = () => {
    setIsLoading(false);
    setNewRaffle({});
    setFormData({
      nftSeries: "",
      countWinners: 0,
      addressList: []
    });
  }

  // call contract write when all is ready
  useEffect(() => {
    if (raffleWrite && raffleStatus !== 'loading') {
      raffleWrite();
    }
  }, [raffleWrite]);

  useEffect(() => {
    console.log(`errorRaffle`, errorRaffle);
  }, [errorRaffle]);

  useEffect(() => {
    console.log(`newRaffle`, newRaffle);
  }, [newRaffle]);

  return (
    <Popup title="Create new Raffle"
           isVisible={popupVisible}
           size={"sm"}
           setIsVisible={setPopupVisible}>
      <form className="relative" onSubmit={handleCreateRaffle}>
        <div>
          <div className={"mb-4"}>
            <Select label="NFT Collection*"
                    value={formData.nftSeries}
                    className={"bg-white"}
                    disabled={!collectionItems}
                    onChange={val => setFormData({ ...formData, nftSeries: val })}>
              {collectionItems.map((collection, index) => (
                <Option value={collection.id.toString()} key={index}>
                  {collection.title}
                </Option>
              ))}
            </Select>
          </div>
          <div className={"flex flex-row"}>
            <div className={"w-48"}>
              <Input type="number"
                     label="Winners Count*"
                     required={true}
                     min={0}
                     className={"w-48"}
                     value={formData.countWinners}
                     onChange={(e) => setFormData({ ...formData, countWinners: parseInt(e.target.value) })}
              />
            </div>
            <small className={"pt-2 ml-6"}>Max winners: 500</small>
          </div>
        </div>

        {!isLoading ? (
          <div className="flex justify-between mt-8 ">
            <div className="text-gray-500 text-sm pt-2"/>
            <Button type="Submit" variant="gradient">
              Create Raffle
              <MdKeyboardArrowRight className="text-lg align-bottom ml-1 inline-block"/>
            </Button>
          </div>
        ) : (
          <div className="bg-white/80 absolute top-[-20px] bottom-0 right-0 left-0 z-10">
            <div className={"w-12 mx-auto mt-10"}>
              <Loader/>
            </div>
          </div>
        )}
      </form>
    </Popup>
  );
}
