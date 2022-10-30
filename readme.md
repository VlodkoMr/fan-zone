# Web3 Fan Zone

Best service to create your own web3 fan zone or community.

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

### Build & Deploy

```
npm run deploy
npm run start
```

## Production

```
npm run deploy:aurora
npm run build:aurora
```

- Update CONTRACT_PROXY in src/backend/scripts/update.aurora.js
- Fill environment variables for your chain
- Build frontend & deploy

### Verify Smart Contract

```
npm run verify:aurora
```

### Update Smart Contract

```
npm run update:aurora
```
