import React, { useEffect, useState } from "react";
import { convertFromEther, formatNumber, timestampToDate } from '../../../utils/format';
import { InnerBlock } from '../../../assets/css/common.style';
import { distributionCampaignsFT } from '../../../utils/settings';
import { Button } from '@material-tailwind/react';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { addTransaction } from '../../../store/transactionSlice';
import { useDispatch } from 'react-redux';
import FungibleTokenABI from '../../../contractsData/FungibleToken.json';

export function OneFTDistribution({ campaign, currentCommunity, tokenSymbol, handleUpdate }) {
  const dispatch = useDispatch();
  const [ campaignDetails, setCampaignDetails ] = useState();

  const { config: configCancelCampaign, error: errorCancelCampaign } = usePrepareContractWrite({
    addressOrName: currentCommunity?.ftContract,
    contractInterface: FungibleTokenABI.abi,
    functionName: 'cancelDistributionCampaign',
    args: [ campaign?.id ]
  });

  const { data: cancelCampaignData, write: cancelCampaignWrite, error: errorCancelWrite } = useContractWrite({
    ...configCancelCampaign,
    onSuccess: ({ hash }) => {
      dispatch(addTransaction({
        hash: hash,
        description: `Cancel Distribution Campaign`
      }));
    },
    onError: ({ message }) => {
      console.log('onError message', message);
    },
  });

  useWaitForTransaction({
    hash: cancelCampaignData?.hash,
    onError: error => {
      console.log('is err', error)
    },
    onSuccess: data => {
      if (data) {
        handleUpdate?.();
      }
    },
  });

  useEffect(() => {
    distributionCampaignsFT.map(campSettings => {
      if (parseInt(campSettings.id) === campaign.distType) {
        setCampaignDetails(campSettings)
      }
    });
  }, []);

  const claimedPct = () => {
    const mintedPct = campaign.tokensMinted.mul(100).div(campaign.tokensTotal);
    return mintedPct.toNumber();
  }

  const handleCancel = () => {
    if (confirm('Please confirm Campaign cancellation')) {
      cancelCampaignWrite();
    }
  }

  return (
    <InnerBlock className="mb-3">
      <div className="flex-auto text-sm">
        <h2 className="text-lg font-semibold text-gray-800">
          {formatNumber(convertFromEther(campaign.tokensTotal, 0))} {tokenSymbol} for {campaignDetails?.title}
        </h2>
        {campaign.dateStart > 0 && campaign.dateEnd > 0 && (
          <span className="font-medium text-gray-500 text-sm bg-gray-100 rounded-md px-2 py-1 absolute right-6 top-6">
            {timestampToDate(campaign.dateStart)} - {timestampToDate(campaign.dateEnd)}
          </span>
        )}
        <div className="mt-2">
          Claimed: <b>{formatNumber(convertFromEther(campaign.tokensMinted))} {tokenSymbol}
          {campaign.tokensMinted > 0 && (
            <span className="ml-2 opacity-60">
              ({claimedPct()}%)
            </span>
          )}</b>
        </div>

        <div>
          {tokenSymbol} per User: <b>{formatNumber(convertFromEther(campaign.tokensPerUser))}</b>
        </div>

        {campaign.eventCode > 0 && (
          <div>
            Event Code: <b className={"text-gray-800 bg-gray-100 rounded px-1 py-0.5 inline-block"}>{campaign.eventCode}</b>
          </div>
        )}

        <div className={campaign.worldcoinAction.length > 0 ? "font-medium" : "opacity-60"}>
          {campaign.worldcoinAction.length > 0 ? "Protected" : "Not protected"} by Proof of Personhood
        </div>

        {campaign.whitelist.length > 0 && (
          <span onClick={() => alert("Coming soon, will be all whitelisted addresses")}
                className="absolute right-6 bottom-6 text-blue-500 cursor-pointer underline">
            whitelisted addresses
          </span>
        )}

        <div className={'mt-4'}>
          <Button color={'red'} variant={'outlined'} size={'sm'} onClick={() => handleCancel()}>
            Cancel Distribution
          </Button>
        </div>
      </div>
    </InnerBlock>
  );
}
