import { convertFromEther, formatPrice, isContractAddress, mediaURL, timestampToDate } from './format';
import { getCampaignType } from "./settings";

export const transformCommunity = (item) => {
  return {
    id: item.id.toString(),
    name: item.name,
    logo: item.logo,
    category: item.category.toString(),
    privacy: item.privacy.toString(),
    nftContract: item.nftContract,
    ftContract: item.ftContract,
    daoContract: item.daoContract,
    timeLockContract: item.timeLockContract,
    description: item.description,
  }
};

export const transformCollectionNFT = (item) => {
  let royalty = null;
  if (isContractAddress(item.royalty.account)) {
    royalty = {
      address: item.royalty.account,
      percent: parseInt(item.royalty.percent)
    };
  }

  let distribution = null;
  if (item.distribution.distType > 0) {
    distribution = {
      distType: item.distribution.distType,
      dateStart: parseInt(item.distribution.dateStart),
      dateEnd: parseInt(item.distribution.dateEnd),
      eventCode: parseInt(item.distribution.eventCode),
      whitelist: item.distribution.whitelist,
      worldcoinAction: item.distribution.worldcoinAction
    }
  }

  return {
    id: parseInt(item.id),
    title: item.title,
    price: formatPrice(item.price),
    mintedTotal: parseInt(item.mintedTotal),
    supply: parseInt(item.supply),
    jsonUri: item.jsonUri,
    mediaUri: mediaURL(item.mediaUri),
    royalty,
    distribution
  }
};

export const transformFTCampaign = (item) => {
  return {
    id: parseInt(item.id),
    distType: item.distType,
    dateStart: parseInt(item.dateStart),
    dateEnd: parseInt(item.dateEnd),
    eventCode: parseInt(item.eventCode),
    whitelist: item.whitelist,
    tokensTotal: item.tokensTotal,
    tokensMinted: item.tokensMinted,
    tokensPerUser: item.tokensPerUser,
    worldcoinAction: item.worldcoinAction
  }
};


export const transformCampaignEvent = (event) => {
  let countDecimals = 5;
  if (parseInt(event.args._deposit) > 100) {
    countDecimals = 0;
  } else if (parseInt(event.args._deposit) > 1) {
    countDecimals = 2;
  }

  return {
    address: event.args._address,
    campaignId: parseInt(event.args._campaignId),
    campaignTypeId: parseInt(event.args._campaignType),
    campaignType: getCampaignType(parseInt(event.args._campaignType)),
    dateTime: timestampToDate(parseInt(event.args._dateTime) * 1000),
    deposit: convertFromEther(event.args._deposit, countDecimals),
    email: event.args._email
  }
};

export const transformProposal = (item) => {
  return {
    proposalId: item.args.proposalId,
    id: parseInt(item.args.proposalId),
    description: item.args.description,
    startBlock: parseInt(item.args.startBlock),
    endBlock: parseInt(item.args.endBlock),
  }
};

const getWinner = (list, num) => {
  let index = num - 1;
  if (list.length >= num) {
    return list.splice(index, 1);
  } else {
    return list.pop();
  }
}

export const transformRaffle = (item) => {
  const winnerNumbers = item.result.map(num => parseInt(num));
  let list = [...item.participants];

  let winners = [];
  winnerNumbers.map(num => {
    winners.push(getWinner(list, num));
  });

  return {
    date: parseInt(item.date),
    nftSeries: parseInt(item.nftSeries),
    participants: item.participants,
    requestId: item.requestId.toString(),
    result: winnerNumbers,
    winners: winners,
  }
};