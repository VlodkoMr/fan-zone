import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { InnerBlock, InnerTransparentBlock } from '../../assets/css/common.style';
import NFTCollectionABI from "../../contractsData/NFTCollection.json";
import { useContract, useContractRead, useNetwork, useProvider } from "wagmi";
import { isContractAddress } from "../../utils/format";
import { transformCollectionNFT } from "../../utils/transform";
import { Option, Select, Switch } from "@material-tailwind/react";
import { Loader } from "../../components/Loader";

export const Members = () => {
  const provider = useProvider();
  const currentCommunity = useSelector(state => state.community.current);
  const [filterCollection, setFilterCollection] = useState("");
  const [filterCollectionTitle, setFilterCollectionTitle] = useState("");
  const [nftOwners, setNftOwners] = useState([]);
  const [isShowEmail, setIsShowEmail] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const myNFTContract = {
    addressOrName: currentCommunity?.nftContract,
    contractInterface: NFTCollectionABI.abi,
  };

  const contractNFT = useContract({
    ...myNFTContract,
    signerOrProvider: provider
  });

  const { data: collectionItems } = useContractRead({
    ...myNFTContract,
    enabled: isContractAddress(currentCommunity?.nftContract),
    functionName: "getCollections",
    select: data => data.map(collection => transformCollectionNFT(collection))
  });

  const loadHoldersNFT = async () => {
    const actionsFilterNFT = await contractNFT.filters.CampaignAction(currentCommunity.id, filterCollection, 1);
    const actionsNFT = await contractNFT.queryFilter(actionsFilterNFT);
    setNftOwners(actionsNFT.map(event => isShowEmail ? event.args._email : event.args._address));
    setIsReady(true);
  }

  useEffect(() => {
    setIsReady(false);
    setNftOwners([]);
    if (filterCollection) {
      collectionItems.map(item => {
        if (item.id.toString() === filterCollection) {
          setFilterCollectionTitle(item.title);
        }
      })

      loadHoldersNFT();
    }
  }, [filterCollection, isShowEmail]);

  return (
    <div>
      <InnerTransparentBlock>
        <InnerBlock.Header className="flex justify-between">
          <span>Members</span>

          <div className={"flex flex-row w-1/2 justify-end"}>
            <div className="w-32 mr-6 text-sm font-normal">
              <Switch checked={isShowEmail} onChange={() => setIsShowEmail(prev => !prev)} label="Show emails"/>
            </div>
            <div className="w-64 -mt-3">
              {collectionItems && (
                <Select label="NFT Collection*"
                        value={filterCollection}
                        className={"bg-white"}
                        disabled={!collectionItems}
                        onChange={val => setFilterCollection(val)}>
                  {collectionItems.map((collection, index) => (
                    <Option value={collection.id.toString()} key={index}>
                      {collection.title}
                    </Option>
                  ))}
                </Select>
              )}
            </div>
          </div>
        </InnerBlock.Header>
      </InnerTransparentBlock>

      <InnerBlock className={"flex-1"}>
        <div className="flex-auto">
          {filterCollection ? (
            <>
              {isReady ? (
                <>
                  {nftOwners && (
                    <div className={"text-sm"}>
                      <b className={"block mb-4 text-base"}>{isShowEmail ? "Email" : "Address"} List for "{filterCollectionTitle}"
                        collection:</b>
                      {nftOwners.filter(value => value.length > 0).map(value => (
                        <div key={value}>
                          <span>{value}</span>
                          <span className={"opacity-0"}>,</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className={"w-12 mx-auto mt-10"}>
                  <Loader/>
                </div>
              )}
            </>
          ) : (
            <div className={"text-gray-500"}>
              Please select NFT Collection to view all NFT holders.
            </div>
          )}
        </div>
      </InnerBlock>
    </div>
  );
}
