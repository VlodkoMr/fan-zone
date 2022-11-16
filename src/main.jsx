import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './frontend/App'
import store from "./frontend/store"

import { chain, configureChains, createClient, WagmiConfig } from 'wagmi'
import { Provider } from "react-redux"
import { ThemeProvider } from "@material-tailwind/react";
import { publicProvider } from 'wagmi/providers/public';

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { alchemyProvider } from 'wagmi/providers/alchemy'

const { chains, provider } = configureChains(
  [chain.polygonMumbai],
  [
    // publicProvider(),
    alchemyProvider({ apiKey: import.meta.env.VITE_MUMBAI_API_KEY })
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
