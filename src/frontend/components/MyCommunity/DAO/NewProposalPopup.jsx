import React, { useEffect, useState } from "react";
import { Button, Input, Textarea } from '@material-tailwind/react';
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
    enabled: submitFormData?.description?.length > 10 && submitFormData?.key?.length > 0,
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
    hash: proposeData?.hash,
    onError: error => {
      setIsLoading(false);
      console.log('is err', error);
    },
    onSuccess: data => {
      if (data) {
        setSubmitFormData({});
        handleSuccess?.();
        setIsSuccess(true);
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
    if (formData.key.length === 0) {
      alert("Please provide voting key");
      return false;
    }
    if (formData.value.length === 0) {
      alert("Please provide voting value");
      return false;
    }
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
        key: "",
        value: "",
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
            <div className={"flex flex-row gap-8"}>
              <div className={"w-full"}>
                <Input type="text"
                       label="Voting Key*"
                       required={true}
                       value={formData.key}
                       onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                />
              </div>
              <div className={"w-full"}>
                <Input type="text"
                       label="Voting Value*"
                       required={true}
                       value={formData.value}
                       onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                />
              </div>
            </div>
            <div className={"rounded-md w-full mt-4"}>
              <Textarea label={`Proposal Description*`}
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
