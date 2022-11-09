import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { InnerBlock, InnerTransparentBlock } from '../../assets/css/common.style';
import { isContractAddress } from "../../utils/format";
import { useOutletContext } from "react-router-dom";
import { DeployDAOContract } from "../../components/MyCommunity/DAO/DeployDAOContract";
import GovernanceABI from "../../contractsData/Governance.json";
import { useContract, useContractRead, useProvider } from "wagmi";
import { Button } from "@material-tailwind/react";
import { NewProposalPopup } from "../../components/MyCommunity/DAO/NewProposalPopup";
import { Loader } from "../../components/Loader";
import { transformProposal } from "../../utils/transform";
import { OneProposal } from "../../components/MyCommunity/DAO/OneProposal";

export const DAO = () => {
  const provider = useProvider();
  const [reloadCommunityList] = useOutletContext();
  const [proposals, setProposals] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const currentCommunity = useSelector(state => state.community.current);
  const [createProposalPopupVisible, setCreateProposalPopupVisible] = useState(false);

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

  const contractDAO = useContract({
    ...myDAOContract,
    signerOrProvider: provider
  });

  const loadAllProposals = async () => {
    const actionsFilterProposals = await contractDAO.filters.ProposalCreated();
    const proposalList = await contractDAO.queryFilter(actionsFilterProposals);
    setProposals(proposalList.map(proposal => transformProposal(proposal)));
    console.log(`proposalList`, proposalList);
    setIsReady(true);
  }

  useEffect(() => {
    loadAllProposals();
  }, []);

  const handleVote = (id) => {

  }

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
              <div className="text-sm mb-4">
                {isReady ? (
                  <>
                    <div className={"flex justify-between"}>
                      {(!proposals.length) ? (
                        <span className={"opacity-60"}>*No Proposals for voting</span>
                      ) : (
                        <div className="pt-1">
                          <span className="opacity-80">Total Proposals:</span>
                          <b className="ml-1">{proposals.length}</b>
                        </div>
                      )}

                      <div className="-mt-3 justify-end">
                        <Button onClick={() => setCreateProposalPopupVisible(true)}>
                          Create new Proposal
                        </Button>
                      </div>
                    </div>

                    <div className={"mt-4"}>
                      {proposals.map(proposal => (
                        <OneProposal key={proposal.id} proposal={proposal}/>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="w-12 mb-3 mx-auto">
                    <Loader/>
                  </div>
                )}
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
