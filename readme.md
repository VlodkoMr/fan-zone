# Chainlink FanZone

Best service to create your own web3 fan-zone or community.

## Getting Started

These instructions will get you a copy of the project up and running on your Mumbai testnet for development and testing purposes.

### Prerequisites

```
nodeJS >= 16.0
npm
```

### Local usage:

Just run hardhat local server & deploy

``` 
npx hardhat run scripts/deploy.ts --network localhost
```

Run frontend

### Installing

Install dependencies and create environment file:

```
npm install
cp .env-sample .env
```

Fill environment variables in files:

- .env
- .env.localhost

Update Chainlink data in src/backend/scripts/deploy.js file. 

### Build & Deploy

```
npm run deploy
npm run start
```

## Production

```
npm run deploy:mumbai
npm run build:mumbai
```

- Update CONTRACT_PROXY in src/backend/scripts/update.mumbai.js
- Fill environment variables for your chain
- Build frontend & deploy
- To allow chainlink usage for raffles: add "Chainlink VRF" contract address to https://vrf.chain.link/
- To allow chainlink usage for DAO: add "Chainlink Executor Contract" contract address to https://automation.chain.link/ and select "checkExecutions" function to call.

### Verify Smart Contract

```
npm run verify:mumbai
```

### Update Smart Contract

```
npm run update:mumbai
```
