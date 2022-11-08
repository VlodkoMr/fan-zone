import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { InnerBlock, InnerTransparentBlock } from '../../assets/css/common.style';
import { isContractAddress } from "../../utils/format";
import { useOutletContext } from "react-router-dom";
import { DeployDAOContract } from "../../components/MyCommunity/DAO/DeployDAOContract";
import GovernanceABI from "../../contractsData/Governance.json";
import { useContractRead } from "wagmi";
import { Button } from "@material-tailwind/react";
import { NewProposalPopup } from "../../components/MyCommunity/DAO/NewProposalPopup";

export const DAO = () => {
  const [reloadCommunityList] = useOutletContext();
  const [totalProposal, setTotalProposal] = useState(0);
  const [createProposalPopupVisible, setCreateProposalPopupVisible] = useState(false);
  const currentCommunity = useSelector(state => state.community.current);

  const myDAOContract = {
    addressOrName: currentCommunity?.daoContract,
    contractInterface: GovernanceABI.abi,
  };

  const { data: votingDelay } = useContractRead({
    ...myDAOContract,
    enabled: isContractAddress(currentCommunity?.daoContract),
    functionName: "votingDelay",
  });

  const { data: votingPeriod } = useContractRead({
    ...myDAOContract,
    enabled: isContractAddress(currentCommunity?.daoContract),
    functionName: "votingPeriod",
  });

  // const { data: quorum } = useContractRead({
  //   ...myDAOContract,
  //   enabled: isContractAddress(currentCommunity?.daoContract),
  //   functionName: "quorumNumerator",
  // });

  return (
    <>
      <InnerTransparentBlock>
        <InnerBlock.Header className="flex justify-between">
          <span>DAO</span>
        </InnerBlock.Header>
        <div>
          {isContractAddress(currentCommunity.daoContract) ? (
            <>
              <div className="flex justify-between text-sm mb-3 -mt-1">
                <div className="mr-10">
                  <span className={"mr-4"}>Delay: {parseInt(votingDelay)} blocks</span>
                  <span>Period: {parseInt(votingPeriod)} blocks</span>
                </div>
                <span className="text-sm font-normal text-slate-500">
                  <span className="font-medium mr-1">Contract:</span>
                  <small className="opacity-80">{currentCommunity.daoContract}</small>
                </span>
              </div>

              <hr className="mb-6"/>
              <div className="flex justify-between text-sm mb-4">
                <div>
                  {(parseInt(totalProposal || "0") === 0) ? (
                    <span className={"opacity-60"}>*No Proposals for voting</span>
                  ) : (
                    <div className="pt-1">
                      <span className="opacity-80">Total Proposal:</span>
                      <b className="ml-1">{parseInt(totalProposal)}</b>
                    </div>
                  )}
                </div>

                <div className="-mt-3 justify-end">
                  <Button onClick={() => setCreateProposalPopupVisible(true)}>
                    Create new Proposal
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <DeployDAOContract reloadCommunityList={reloadCommunityList}/>
          )}
        </div>
      </InnerTransparentBlock>

      <NewProposalPopup currentCommunity={currentCommunity}
                        setPopupVisible={setCreateProposalPopupVisible}
                        popupVisible={createProposalPopupVisible}
      />
    </>
  );
}
