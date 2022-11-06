import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Badge, InnerBlock, InnerSmallBlock, InnerTransparentBlock, TableTd, TableTh } from '../../assets/css/common.style';
import { Link } from "react-router-dom";
import { useAccount, useContractRead, useContract, useProvider } from "wagmi";
import NFTCollectionABI from "../../contractsData/NFTCollection.json";
import FungibleTokenABI from '../../contractsData/FungibleToken.json';
import { convertFromEther, formatNumber, isContractAddress } from "../../utils/format";
import { transformCampaignEvent, transformFTCampaign } from "../../utils/transform";

export const MyDashboard = () => {
  const { address } = useAccount();
  const [lastActions, setLastActions] = useState([]);
  const currentCommunity = useSelector(state => state.community.current);
  const provider = useProvider();

  // ---------------- NFT ----------------

  const myNFTContract = {
    addressOrName: currentCommunity?.nftContract,
    contractInterface: NFTCollectionABI.abi
  };

  const { data: totalCollections } = useContractRead({
    ...myNFTContract,
    enabled: isContractAddress(currentCommunity?.nftContract),
    functionName: "collectionsTotal",
  });

  const { data: mintedTotal } = useContractRead({
    ...myNFTContract,
    enabled: isContractAddress(currentCommunity?.nftContract),
    functionName: "mintedTotal",
  });

  const contractNFT = useContract({
    ...myNFTContract,
    signerOrProvider: provider
  });

  // ---------------- FT ----------------

  const myFTContract = {
    addressOrName: currentCommunity?.ftContract,
    contractInterface: FungibleTokenABI.abi
  };

  const { data: distributionFTCampaigns } = useContractRead({
    ...myFTContract,
    enabled: isContractAddress(currentCommunity?.ftContract),
    functionName: "getCampaigns",
    select: (data) => data.map(camp => transformFTCampaign(camp))
  });

  const contractFT = useContract({
    ...myFTContract,
    signerOrProvider: provider
  });

  // ---------------- Actions ----------------

  const loadLastActions = async () => {
    const actionsFilterNFT = await contractNFT.filters.CampaignAction();
    const actionsFilterFT = await contractFT.filters.CampaignAction();
    const actionsNFT = await contractNFT.queryFilter(actionsFilterNFT);
    const actionsFT = await contractFT.queryFilter(actionsFilterFT);

    const allEvents = actionsNFT.concat(actionsFT);
    allEvents.sort((a, b) => b.blockNumber - a.blockNumber);

    setLastActions(allEvents.map(event => transformCampaignEvent(event)));
    console.log(`allEvents`, allEvents);
  }

  useEffect(() => {
    loadLastActions();
  }, [])

  const InfoBlock = ({ title, value }) => (
    <InnerSmallBlock className={"w-1/4"}>
      <div className="flex-auto">
        <div className="flex justify-between text-sm text-gray-500 ml-1 font-medium">
          {title}
        </div>
        <div className="mt-2 text-3xl text-gray-800 text-right mr-2">
          {value}
        </div>
      </div>
    </InnerSmallBlock>
  );

  return (
    <>
      <InnerTransparentBlock>
        <InnerBlock.Header className="flex justify-between">
          <span>Dashboard</span>
          <div className={"text-sm flex flex-row"}>
            {currentCommunity.privacy === "0" ? (
              <>
                <span className="pt-1 text-gray-600">Public URL:</span>
                <Badge className={"border relative bg-blue-50/50 border-blue-100"}>
                  <Link className={"text-blue-600"} to={`/category/${currentCommunity.category}/${currentCommunity.id}`}>
                    {import.meta.env.VITE_WEBSITE_URL}category/{currentCommunity.category}/{currentCommunity.id}
                  </Link>
                </Badge>
                {/*<VscCopy className={"absolute right-1.5 top-1.5"}/>*/}
              </>
            ) : (
              <Badge className={"border border-red-100"}>
                <Link to={`/my/settings`} className={"text-red-400"}>Private Community</Link>
              </Badge>
            )}
          </div>
        </InnerBlock.Header>
      </InnerTransparentBlock>

      <div className="flex flex-row gap-6 mt-2">
        <InfoBlock title={"NFT Series"} value={parseInt(totalCollections || "0")}></InfoBlock>
        <InfoBlock title={"FT Campaigns"} value={distributionFTCampaigns?.length || "0"}></InfoBlock>
        <InfoBlock title={"New Members (24h)"} value={"0"}></InfoBlock>
        <InfoBlock title={"New Members (30d)"} value={"0"}></InfoBlock>
      </div>
      <div className={"mt-6 border-t pt-4 mb-8"}>
        <InnerBlock>
          <div className={"w-full"}>
            <InnerBlock.Header>Last Activity</InnerBlock.Header>

            <table className="border-collapse table-auto w-full text-sm mt-4">
              <thead className={"bg-gray-50"}>
              <tr>
                <TableTh>Member</TableTh>
                <TableTh>Action</TableTh>
                <TableTh>Series / Campaign</TableTh>
                <TableTh>Payment</TableTh>
                <TableTh>Date</TableTh>
              </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800">
              {lastActions.map((action, index) => (
                <tr key={index}>
                  <TableTd>{action.address}</TableTd>
                  <TableTd>{action.campaignType}</TableTd>
                  <TableTd>{action.campaignId} / Serie v1</TableTd>
                  <TableTd>{action.deposit || "&minus;"}</TableTd>
                  <TableTd>{action.dateTime}</TableTd>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </InnerBlock>
      </div>

    </>
  );
}
