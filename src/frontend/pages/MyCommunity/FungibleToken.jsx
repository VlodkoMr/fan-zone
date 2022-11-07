import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { InnerBlock, InnerTransparentBlock } from '../../assets/css/common.style';
import { useAccount, useContract, useContractRead, useNetwork, useProvider } from 'wagmi';
import { convertFromEther, formatNumber, isContractAddress, shortAddress } from '../../utils/format';
import { transformCampaignEvent, transformFTCampaign } from '../../utils/transform';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@material-tailwind/react';
import { DeployFTContract } from '../../components/MyCommunity/FungibleToken/DeployFTContract';
import { DistributionCampaignFTPopup } from '../../components/MyCommunity/FungibleToken/DistributionCampaignFTPopup';
import { OneFTDistribution } from '../../components/MyCommunity/FungibleToken/OneFTDistribution';
import { PauseUnpausePopup } from '../../components/MyCommunity/PauseUnpausePopup';
import { AirdropFTPopup } from "../../components/MyCommunity/FungibleToken/AirdropFTPopup";
import FungibleTokenABI from '../../contractsData/FungibleToken.json';
import { getTokenName } from "../../utils/settings";

export const FungibleToken = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const provider = useProvider();
  const [lastActions, setLastActions] = useState([]);
  const [reloadCommunityList] = useOutletContext();
  const currentCommunity = useSelector(state => state.community.current);
  const [campaignPopupVisible, setCampaignPopupVisible] = useState(false);
  const [airdropPopupVisible, setAirdropPopupVisible] = useState(false);

  const myFTContract = {
    addressOrName: currentCommunity?.ftContract,
    contractInterface: FungibleTokenABI.abi,
  };

  const contractFT = useContract({
    ...myFTContract,
    signerOrProvider: provider
  });

  const { data: totalSupply } = useContractRead({
    ...myFTContract,
    enabled: isContractAddress(currentCommunity?.ftContract),
    functionName: "totalSupply",
  });
  const { data: tokenSymbol } = useContractRead({
    ...myFTContract,
    enabled: isContractAddress(currentCommunity?.ftContract),
    functionName: "symbol",
  });


  const { data: myBalance, refetch: refetchBalance } = useContractRead({
    ...myFTContract,
    enabled: isContractAddress(currentCommunity?.ftContract),
    functionName: "balanceOf",
    args: [address]
  });

  const { data: distributionCampaigns, refetch: refetchDistributionCampaigns } = useContractRead({
    ...myFTContract,
    enabled: isContractAddress(currentCommunity?.ftContract),
    functionName: "getCampaigns",
    select: (data) => data.map(camp => transformFTCampaign(camp))
  });

  const refetchCampaignsList = () => {
    refetchBalance();
    refetchDistributionCampaigns();
  }

  const loadLastActions = async () => {
    const actionsFilterFT = await contractFT.filters.CampaignAction();
    const events = await contractFT.queryFilter(actionsFilterFT);
    events.sort((a, b) => b.blockNumber - a.blockNumber);
    setLastActions(events.filter((event, index) => index < 5).map(event => transformCampaignEvent(event)));
  }

  useEffect(() => {
    if (currentCommunity?.ftContract) {
      refetchCampaignsList();
      loadLastActions();
    }
  }, [currentCommunity?.ftContract]);

  const getTokenSymbol = (campaignTypeId) => {
    if (campaignTypeId === 3) {
      return tokenSymbol;
    }
    return getTokenName(chain);
  }

  return (
    <div className="flex flex-row">
      <InnerTransparentBlock>
        <InnerBlock.Header className="flex justify-between">
          <span>Fungible Token</span>
          {isContractAddress(currentCommunity?.ftContract) && (
            <PauseUnpausePopup contractAddress={currentCommunity.ftContract}
                               contractABI={FungibleTokenABI}
                               handleSuccess={reloadCommunityList}
            />
          )}
        </InnerBlock.Header>
        <div>
          {isContractAddress(currentCommunity.ftContract) ? (
            <>
              <div className="flex justify-between text-sm mb-3 -mt-1">
                <div className="mr-10">
                  <span>Total Supply:</span>
                  <b className="ml-1 font-medium">{formatNumber(convertFromEther(totalSupply, 0))} {tokenSymbol}</b>

                </div>
                <span className="text-sm font-normal text-slate-500">
                  <span className="font-medium mr-1">Contract:</span>
                  <small className="opacity-80">{currentCommunity.ftContract}</small>
                </span>
              </div>

              <hr className="mb-6"/>

              <div className="flex flex-row gap-8">
                <div className="w-2/3">
                  <div className="flex justify-between">
                    <h4 className="mb-3 mt-1 font-semibold">Distribution Campaigns</h4>
                    <div className="-mt-3">
                      <Button onClick={() => setCampaignPopupVisible(true)}>
                        New Distribution Campaign
                      </Button>
                    </div>
                  </div>
                  {distributionCampaigns?.length > 0 ? (
                    <>
                      {distributionCampaigns.map(campaign => (
                        <OneFTDistribution key={campaign.id}
                                           campaign={campaign}
                                           tokenSymbol={tokenSymbol}
                                           currentCommunity={currentCommunity}
                                           handleUpdate={refetchCampaignsList}
                        />
                      ))}
                    </>
                  ) : (
                    <InnerBlock className={"text-center text-gray-500"}>
                      *No Distribution Campaigns
                    </InnerBlock>
                  )}
                </div>
                <div className="w-1/3">
                  <div className="-mt-3 mb-3 flex justify-end">
                    <Button onClick={() => setAirdropPopupVisible(true)}>
                      New Token Airdrop
                    </Button>
                  </div>

                  <div className="bg-white rounded-xl shadow-gray-300/50 shadow-lg px-8 py-6 mb-6 text-center">
                    <h4>
                      <span className={"mr-2"}>My Balance:</span>
                      <b>{formatNumber(convertFromEther(myBalance, 0))} {tokenSymbol}</b>
                    </h4>
                  </div>

                  <InnerBlock className={"text-center mb-8"}>
                    <div className={"w-full"}>
                      <h4 className="pb-3 font-semibold border-b">Last Activity</h4>
                      {lastActions.map((action, index) => (
                        <div className={"border-b py-2"} key={index}>
                          <div className={"flex flex-row text-sm justify-between"}>
                            <p>{shortAddress(action.address)}</p>
                            <p className={"opacity-60"}>{action.dateTime}</p>
                          </div>
                          <div className={"flex flex-row text-sm justify-between"}>
                            <span className={"font-medium"}>{action.campaignType}</span>
                            <span>{action.deposit > 0 ? `${action.deposit} ${getTokenSymbol(action.campaignTypeId)}` : ("")}</span>
                          </div>
                        </div>
                      ))}

                      {lastActions.length === 0 && (
                        <div className={"text-center my-4 opacity-60 text-sm"}>
                          *No Activity
                        </div>
                      )}
                    </div>
                  </InnerBlock>
                </div>
              </div>
            </>
          ) : (
            <DeployFTContract reloadCommunityList={reloadCommunityList}/>
          )}
        </div>
      </InnerTransparentBlock>

      <AirdropFTPopup
        popupVisible={airdropPopupVisible}
        setPopupVisible={setAirdropPopupVisible}
        currentCommunity={currentCommunity}
        tokenSymbol={tokenSymbol}
        myBalance={myBalance}
        tokenAddress={currentCommunity?.ftContract}
        handleSuccess={() => refetchCampaignsList()}
      />

      <DistributionCampaignFTPopup
        popupVisible={campaignPopupVisible}
        setPopupVisible={setCampaignPopupVisible}
        currentCommunity={currentCommunity}
        tokenSymbol={tokenSymbol}
        myBalance={myBalance}
        handleSuccess={() => refetchCampaignsList()}
      />
    </div>
  );
}
