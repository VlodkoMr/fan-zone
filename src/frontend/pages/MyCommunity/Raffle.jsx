import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { InnerBlock, InnerTransparentBlock } from '../../assets/css/common.style';
import { Button } from "@material-tailwind/react";
import { useContractRead } from "wagmi";
import { chainlinkVRFContract } from "../../utils/contracts";
import { transformCollectionNFT, transformRaffle } from "../../utils/transform";
import NFTCollectionABI from "../../contractsData/NFTCollection.json";
import { isContractAddress } from "../../utils/format";
import { NewRafflePopup } from "../../components/MyCommunity/Raffle/NewRafflePopup";

export const Raffle = () => {
  const [isRafflePopupVisible, setIsRafflePopupVisible] = useState(false);
  const currentCommunity = useSelector(state => state.community.current);

  const { data: raffleList } = useContractRead({
    ...chainlinkVRFContract,
    enabled: currentCommunity?.id?.length > 0,
    functionName: "getCommunityRaffleList",
    args: [parseInt(currentCommunity?.id)],
    select: data => data.map(raffle => transformRaffle(raffle))
  });

  // ------------ NFT Series -------------

  const myNFTContract = {
    addressOrName: currentCommunity?.nftContract,
    contractInterface: NFTCollectionABI.abi,
  };

  const { data: collectionItems } = useContractRead({
    ...myNFTContract,
    enabled: isContractAddress(currentCommunity?.nftContract),
    functionName: "getCollections",
    select: data => data.map(collection => transformCollectionNFT(collection))
  });

  useEffect(() => {
    console.log(`raffleList`, raffleList);
  }, [raffleList]);

  useEffect(() => {
    console.log(`collectionItems`, collectionItems);
  }, [collectionItems]);

  return (
    <div>
      <InnerTransparentBlock>
        <InnerBlock.Header className="flex justify-between">
          <span>Raffle</span>
          <div className="-mt-3 justify-end">
            {collectionItems && collectionItems.length > 0 && (
              <Button onClick={() => setIsRafflePopupVisible(true)}>
                New Raffle
              </Button>
            )}
          </div>
        </InnerBlock.Header>
      </InnerTransparentBlock>

      <InnerBlock className={"flex-1"}>
        <div className="flex-auto">
          Create raffle and <b>get random winners</b> from your NFT Series campaign participants.
          {(!collectionItems || !collectionItems.length) ? (
            <p className={"mt-2 text-red-400"}>Please create NFT Series before using it for Raffles!</p>
          ) : (
            <>
              <hr className={"my-4"}/>
              {raffleList && raffleList.length > 0 ? (
                <>
                  {raffleList.map(raffle => (
                    <div key={raffle.requestId}>
                      <div>{raffle.nftSeries}</div>
                      <div>Result: {raffle.result}</div>
                      <div>participants count: {raffle.participants.length}</div>
                    </div>
                  ))}
                </>
              ) : (
                <p className={"text-gray-400"}>*No Raffles</p>
              )}
            </>
          )}
        </div>
      </InnerBlock>

      {isRafflePopupVisible && (
        <NewRafflePopup currentCommunity={currentCommunity}
                        collectionItems={collectionItems}
                        setPopupVisible={setIsRafflePopupVisible}
                        popupVisible={isRafflePopupVisible}
        />
      )}

    </div>
  );
}
