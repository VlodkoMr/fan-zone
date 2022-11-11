import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './frontend/App'
import store from "./frontend/store"

import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { Provider } from "react-redux";
import { ThemeProvider } from "@material-tailwind/react";
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { connectorsForWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { coinbaseWallet, injectedWallet, metaMaskWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";

import '@rainbow-me/rainbowkit/styles.css';

const auroraChain = {
  id: 1313161554,
  name: 'Aurora+',
  network: 'aurora',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: import.meta.env.VITE_AURORA_RPC_URL,
  },
  blockExplorers: {
    default: { name: 'aurorascan', url: 'https://aurorascan.dev' },
  },
  testnet: false,
}

console.log(`auroraChain`, auroraChain);

const { chains, provider } = configureChains(
  [auroraChain, chain.hardhat],
  [
    // publicProvider(),
    jsonRpcProvider({
      rpc: (chain) => {
        // if (chain.id !== auroraTestnetChain.id) return null
        return { http: chain.rpcUrls.default }
      },
    }),
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: 'FanZone',
    wallets: [
      injectedWallet({ chains }),
      metaMaskWallet({ chains }),
      walletConnectWallet({ chains }),
      coinbaseWallet({ chains, appName: 'FanZone App' }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider chains={chains}>
      <Provider store={store}>
        <ThemeProvider>
          <App/>
        </ThemeProvider>
      </Provider>
    </RainbowKitProvider>
  </WagmiConfig>
)
