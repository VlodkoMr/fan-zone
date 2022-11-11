import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { addTransaction } from '../../../store/transactionSlice';
import { factoryGovernanceContract, factoryTimeLockContract } from '../../../utils/contracts';
import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { Loader } from '../../Loader';
import { Input, Button } from '@material-tailwind/react';
import { isContractAddress } from "../../../utils/format";

export function DeployDAOContract({ reloadCommunityList }) {
  const dispatch = useDispatch();
  const { address } = useAccount();
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);
  const currentCommunity = useSelector(state => state.community.current);
  const [submitFormData, setSubmitFormData] = useState({});
  const [formData, setFormData] = useState({
    quorum: "",
    delay: "",
    period: "",
  });

  // ------------- Deploy TimeLock -------------

  const { config: configDeployTimeLock, error: errorDeployTimeLock } = usePrepareContractWrite({
    ...factoryTimeLockContract,
    enabled: !isContractAddress(currentCommunity?.timeLockContract) && Object.keys(submitFormData).length > 0,
    functionName: 'deployGovernanceTimeLockContract',
    args: [currentCommunity.id, [address], []]
  });

  const { data: deployTimeLockData, write: deployTimeLockWrite, status: deployTimeLockStatus } = useContractWrite({
    ...configDeployTimeLock,
    onSuccess: ({ hash }) => {
      dispatch(addTransaction({
        hash: hash,
        description: `Create your DAO Contract (1/2)`
      }));
    },
    onError: ({ message }) => {
      setIsLoadingCreate(false);
      setSubmitFormData({});
      console.log('onError message', message);
    },
  });

  useWaitForTransaction({
    hash: deployTimeLockData?.hash,
    onError: error => {
      console.log('is err', error);
      setSubmitFormData({});
    },
    onSuccess: data => {
      if (data) {
        reloadCommunityList();
      }
    },
  });

  useEffect(() => {
    if (!isContractAddress(currentCommunity?.timeLockContract) && !isFormErrors()) {
      if (deployTimeLockWrite && deployTimeLockStatus !== 'loading') {
        deployTimeLockWrite();
      }
    }
  }, [deployTimeLockWrite]);

  useEffect(() => {
    console.log(`errorDeployTimeLock`, errorDeployTimeLock);
  }, [errorDeployTimeLock]);

  // ------------- Deploy DAO

  const { config: configDeploy, error: errorDeploy } = usePrepareContractWrite({
    ...factoryGovernanceContract,
    enabled: isContractAddress(currentCommunity?.timeLockContract) && Object.keys(submitFormData).length > 0,
    functionName: 'deployGovernanceContract',
    args: [currentCommunity.id, currentCommunity?.ftContract, currentCommunity?.timeLockContract, submitFormData.quorum, submitFormData.delay, submitFormData.period]
  });

  const { data: deployData, write: deployWrite, status: deployStatus } = useContractWrite({
    ...configDeploy,
    onSuccess: ({ hash }) => {
      dispatch(addTransaction({
        hash: hash,
        description: `Create your DAO Contract (2/2)`
      }));
    },
    onError: ({ message }) => {
      setIsLoadingCreate(false);
      setSubmitFormData({});
      console.log('onError message', message);
    },
  });

  useWaitForTransaction({
    hash: deployData?.hash,
    onError: error => {
      console.log('is err', error);
      setSubmitFormData({});
    },
    onSuccess: data => {
      setSubmitFormData({});
      if (data) {
        reloadCommunityList();
      }
    },
  });

  useEffect(() => {
    if (deployWrite && deployStatus !== 'loading') {
      deployWrite();
    }
  }, [deployWrite]);

  useEffect(() => {
    console.log(`errorDeploy`, errorDeploy);
  }, [errorDeploy]);


  // ------------- Form -------------

  const isFormErrors = () => {
    if (formData.quorum.length === 0 || parseInt(formData.quorum) < 1) {
      return "Wrong voting quorum";
    }
    if (parseInt(formData.delay) < 0) {
      return "Wrong voting delay";
    }
    if (formData.period.length === 0 || parseInt(formData.period) < 1) {
      return "Wrong voting period";
    }
    return false;
  }

  // ------------- Actions -------------

  const deployFTContract = (e) => {
    e.preventDefault();

    const formError = isFormErrors();
    if (formError) {
      alert(formError);
      return;
    }

    setIsLoadingCreate(true);
    setSubmitFormData({ ...formData });
  }

  return (
    <>
      <p className="text-sm opacity-80 mb-4">
        You members will be able to vote and participate in the management and decision-making by holding your <b>Fungible Token</b>.
      </p>

      {isContractAddress(currentCommunity?.ftContract) ? (
        <>
          <form className="flex gap-4 relative" onSubmit={deployFTContract}>
            <div className="w-28">
              <Input type="number"
                     label="Quorum (%)"
                     className="w-28"
                     required={true}
                     maxLength={2}
                     min={0}
                     value={formData.quorum}
                     onChange={(e) => setFormData({ ...formData, quorum: e.target.value })}
              />
            </div>
            <div className="w-32">
              <Input type="number"
                     label="Voting Delay"
                     className="w-32"
                     required={true}
                     min={0}
                     value={formData.delay}
                     onChange={(e) => setFormData({ ...formData, delay: e.target.value })}
              />
            </div>
            <div className="w-32">
              <Input type="number"
                     label="Voting Period"
                     className="w-32"
                     required={true}
                     min={0}
                     value={formData.period}
                     onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              />
            </div>

            <Button disabled={isLoadingCreate || isFormErrors()} type="Submit" variant="gradient">
              {isLoadingCreate && (
                <span className="mr-2 align-bottom">
                  <Loader size={"sm"}/>
                </span>
              )}
              Create Governance
            </Button>
          </form>

          <div className={"mt-6 text-sm"}>
            <p><b>Quorum</b>: Percentage of total supply of tokens needed to approve proposals</p>
            <p><b>Voting Delay</b>: How many blocks after proposal until voting becomes active</p>
            <p><b>Voting Period</b>: How many blocks to allow voters to vote</p>
          </div>
        </>
      ) : (
        <p className={"mt-2 text-red-400"}>Please create Fungible Token contract before enabling DAO Governance.</p>
      )}
    </>
  );
}
