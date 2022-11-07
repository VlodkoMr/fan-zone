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

  let x = {
    address: event.args._address,
    campaignId: parseInt(event.args._campaignId),
    campaignTypeId: parseInt(event.args._campaignType),
    campaignType: getCampaignType(parseInt(event.args._campaignType)),
    dateTime: timestampToDate(parseInt(event.args._dateTime) * 1000),
    deposit: convertFromEther(event.args._deposit, countDecimals),
    email: event.args._email
  }
  console.log(`x`, x);
  return x;
};
