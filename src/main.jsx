import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './frontend/App'
import store from "./frontend/store"

import { chain, configureChains, createClient, WagmiConfig } from 'wagmi'
import { Provider } from "react-redux"

import { ThemeProvider } from "@material-tailwind/react";
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
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

const { chains, provider } = configureChains(
  [auroraChain, chain.hardhat, chain.polygonMumbai],
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

const { connectors } = getDefaultWallets({
  appName: 'FanZone',
  chains
});

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
