import React, { useEffect, useState } from "react";
import { Button, Textarea } from '@material-tailwind/react';
import { Loader } from '../../Loader';
import { Popup } from '../../Popup';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import GovernanceABI from "../../../contractsData/Governance.json";
import { addTransaction } from "../../../store/transactionSlice";
import { useDispatch } from "react-redux";
import { governanceInterface } from "../../../utils/contracts";

export function NewProposalPopup(
  {
    popupVisible,
    setPopupVisible,
    handleSuccess,
    currentCommunity
  }) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitFormData, setSubmitFormData] = useState({});
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    description: ""
  });

  // ------------ Propose ------------

  const encodedFunctionCall = governanceInterface.encodeFunctionData("voteResultsUpdate", [formData.key || "", formData.value || ""]);

  const { config: configPropose, error: errorPropose } = usePrepareContractWrite({
    addressOrName: currentCommunity?.daoContract,
    contractInterface: GovernanceABI.abi,
    enabled: submitFormData?.description?.length > 0,
    functionName: 'propose',
    args: [[currentCommunity?.daoContract], [0], [encodedFunctionCall], submitFormData.description]
  });

  const { data: proposeData, write: proposeWrite, status: proposeStatus } = useContractWrite({
    ...configPropose,
    onSuccess: ({ hash }) => {
      dispatch(addTransaction({
        hash: hash,
        description: `New DAO Proposal`
      }));
    },
    onError: ({ message }) => {
      setIsLoading(false);
      setSubmitFormData({});
      console.log('onError message', message);
    },
  });

  useWaitForTransaction({
    hash: submitFormData?.hash,
    onError: error => {
      setIsLoading(false);
      console.log('is err', error);
    },
    onSuccess: data => {
      if (data) {
        setSubmitFormData({});
        handleSuccess?.();
      }
    },
  });

  // call contract write when all is ready
  useEffect(() => {
    if (proposeWrite && proposeStatus !== 'loading') {
      proposeWrite();
    }
  }, [proposeWrite]);

  useEffect(() => {
    console.log(`errorPropose`, errorPropose);
  }, [errorPropose]);

  // ------------ Create Distribution Campaign ------------

  const handleNewProposal = (e) => {
    e.preventDefault();
    if (formData.description.length < 10) {
      alert("Please provide full proposal description");
      return false;
    }

    setIsLoading(true);
    try {
      setSubmitFormData({ ...formData });
    } catch (e) {
      setIsLoading(false);
      alert('Error, please try one mo time');
    }
  }

  useEffect(() => {
    if (!popupVisible) {
      setIsLoading(false);
      setIsSuccess(false);
      setFormData({
        description: "",
      });
    }
  }, [popupVisible]);

  return (
    <>
      <Popup title="New DAO Proposal"
             isVisible={popupVisible}
             setIsVisible={setPopupVisible}>
        {!isSuccess ? (
          <form className={"p-4"} onSubmit={handleNewProposal}>
            <div className={"rounded-md w-full"}>
              <Textarea label={`Proposal Text*`}
                        className="flex-1 bg-white h-12"
                        required={true}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {isLoading ? (
              <div className="bg-white/80 absolute top-[-20px] bottom-0 right-0 left-0 z-10">
                <div className={"w-12 mx-auto mt-10"}>
                  <Loader/>
                </div>
              </div>
            ) : (
              <div className={"text-right mt-2"}>
                <Button type={"submit"}>Create new Proposal</Button>
              </div>
            )}
          </form>
        ) : (
          <div className={"text-center font-medium py-16 text-green-500 text-xl"}>
            DAO Proposal created.
          </div>
        )}
      </Popup>
    </>
  );
}
