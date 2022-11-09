import React from 'react';

export const defaultCommunityLogo = "bafkreiay2vqt2at4mpvesur66mqwcl6ppyyaqa67hw7jvoic2ocf5ssxfi";

export const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const communityTypes = [
  "Animals",
  "Art",
  "Brand",
  "Business",
  "Education",
  "Environment",
  "Fashion",
  "Food",
  "Gaming",
  "Health",
  "Infrastructure",
  "Literature",
  "Music",
  "Photography",
  "Science",
  "Social",
  "Sports",
  "Technology",
  "Virtual Worlds",
  "Other"
];

export const distributionCampaignsNFT = [
  {
    id: "1",
    title: "Public Access",
    text: "Get public page URL and share this link with your audience. All users will be able to mint NFT on this page.",
    isAvailable: true
  },
  {
    id: "2",
    title: "Whitelisted Only",
    text: "Get public page URL and share this link to whitelisted wallet addresses. Only whitelisted users will be able to mint NFT.",
    isAvailable: true
  },
  {
    id: "3",
    title: "Email Verification",
    text: "Get public page URL and share this link with your audience. User should confirm email to mint NFT.",
    isAvailable: true
  },
  {
    id: "4",
    title: "Event",
    text: "You will receive unique 6 digits code that is required to mint NFT. Can be used to limit access on local or online events.",
    isAvailable: true
  }
];

export const distributionCampaignsFT = [
  {
    id: "1",
    title: "Public Access",
    text: "Get public page URL and share this link with your audience. All users will be able to claim Tokens on this page.",
    isAvailable: true
  },
  {
    id: "2",
    title: "Whitelisted Only",
    text: "Get public page URL and share this link to whitelisted wallet addresses. Only whitelisted users will be able to claim Tokens.",
    isAvailable: true
  },
  {
    id: "3",
    title: "Email Verification",
    text: "Get public page URL and share this link with your audience. User should confirm email to mint NFT.",
    isAvailable: true
  },
  {
    id: "4",
    title: "Event",
    text: "You will receive unique 6 digits code that is required to claim Tokens. Can be used to limit access on local or online events.",
    isAvailable: true
  }
];

export const getTokenName = (currentChain) => {
  let token = "ETH";
  switch (currentChain.id) {
    case 1313161555:
      token = "Aurora";
      break;
  }

  return token;
}

export const getCampaignType = (id) => {
  switch (id) {
    case 1:
      return "Mint NFT";
    case 2:
      return "Claim Token";
    case 3:
      return "Send Airdrop";
  }
}