import React, { useEffect, useState } from "react";
import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import NFTCollectionABI from '../../../contractsData/NFTCollection.json';
import { useDispatch } from 'react-redux';
import { addTransaction } from '../../../store/transactionSlice';
import { ImInfinite } from 'react-icons/im';
import { Loader } from '../../Loader';
import { Button, Input } from '@material-tailwind/react';
import { Popup } from '../../Popup';
import { MdKeyboardArrowRight } from 'react-icons/md';

export function MintNFTPopup({ popupVisible, setPopupVisible, handleSuccess, currentCommunity, collection }) {
  const dispatch = useDispatch();
  const { address } = useAccount();
  const [ isSubmitLoading, setIsSubmitLoading ] = useState(false);
  const [ submitFormData, setSubmitFormData ] = useState({});
  const [ formData, setFormData ] = useState({
    account: "",
    amount: ""
  });

  const { config: configMint, error: errorMint } = usePrepareContractWrite({
    addressOrName: currentCommunity?.nftContract,
    contractInterface: NFTCollectionABI.abi,
    enabled: submitFormData.account?.length > 0 && parseInt(submitFormData.amount) > 0,
    functionName: 'mint',
    args: [ submitFormData.account, collection?.id, submitFormData.amount ]
  });

  const { data: mintData, write: mintWrite, status: mintStatus } = useContractWrite({
    ...configMint,
    onSuccess: ({ hash }) => {
      setPopupVisible(false);
      setIsSubmitLoading(false);
      resetForm();

      dispatch(addTransaction({
        hash: hash,
        description: `Mint NFT`
      }));
    },
    onError: ({ message }) => {
      console.log('onError message', message);
      setIsSubmitLoading(false);
      setSubmitFormData({});
    },
  });

  useWaitForTransaction({
    hash: mintData?.hash,
    onError: error => {
      console.log('is err', error);
      setSubmitFormData({});
    },
    onSuccess: data => {
      if (data) {
        handleSuccess?.();
      }
    },
  });

  const handleMintNFT = (e) => {
    e.preventDefault();
    const formError = isFormErrors();
    if (formError) {
      alert(formError);
      return;
    }

    setIsSubmitLoading(true);
    setSubmitFormData({ ...formData });
  }

  const resetForm = () => {
    setSubmitFormData({});
    setFormData({
      account: "",
      amount: ""
    });
  }

  useEffect(() => {
    if (mintWrite && mintStatus !== 'loading') {
      mintWrite();
    }
  }, [ mintWrite ]);

  const isFormErrors = () => {
    if (formData.account.length < 1) {
      return "Wrong account address";
    }
    if (collection.supply > 0) {
      if (collection.supply < collection.mintedTotal + formData.amount) {
        return "Not enough NFT supply";
      }
    }
    if (parseInt(formData.amount) < 1) {
      return "Wrong mint amount";
    }
    return false;
  }

  const setMyAddress = () => {
    setFormData({ ...formData, account: address })
  }

  return (
    <>
      {collection && (
        <Popup isVisible={popupVisible}
               setIsVisible={setPopupVisible}
               title="Mint NFT">
          <form className="flex flex-row gap-8 relative" onSubmit={handleMintNFT}>
            <div className="w-36">
              <img className="mt-2 h-36 w-36 bg-gray-50 rounded-lg object-cover" src={collection.mediaUri} alt=""/>
            </div>
            <div className="flex-1">
              <div className="mb-3">
                <div className="mb-1 block text-left flex justify-between">
                  <div/>
                  <div className="text-sm text-gray-500 underline cursor-pointer" onClick={() => setMyAddress()}>
                    set my wallet
                  </div>
                </div>

                <Input type="text"
                       label="Send to wallet"
                       required={true}
                       value={formData.account}
                       onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                />
              </div>

              <div className="flex flex-row mb-3">
                <div className="w-48">
                  <Input type="number"
                         label="NFT Amount"
                         required={true}
                         min={0}
                         max={1000000000}
                         value={formData.amount}
                         onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className="text-sm text-gray-500 ml-6 pt-2.5">
                  Total Supply: {collection.supply === 0 ?
                  <ImInfinite size="16" className="inline"/> : `${collection.supply} NFT`}
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <div className="text-gray-500 text-sm pt-2"/>
                <Button type="Submit"
                        variant="gradient"
                        disabled={isFormErrors()}>
                  Mint NFT
                  <MdKeyboardArrowRight className="text-lg align-bottom ml-1 inline-block"/>
                </Button>
              </div>
            </div>

            {isSubmitLoading && (
              <div className="bg-white/80 absolute top-[-20px] bottom-0 right-0 left-0 z-10">
                <div className={"w-12 mx-auto mt-10"}>
                  <Loader/>
                </div>
              </div>
            )}
          </form>
        </Popup>
      )}
    </>
  );
}
