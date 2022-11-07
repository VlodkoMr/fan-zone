import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import {
  Category, Home, Error404,
  MyDashboard, FungibleToken, NftCollection, Settings, DAO, Members, Dashboard, NFTDetails, Raffle
} from './pages';
import { useAccount } from 'wagmi'
import { Transaction } from './components/Transaction';
import { useSelector } from 'react-redux';

export default function App() {
  const { isConnected } = useAccount();
  const transactions = useSelector(state => state.transactions.list);

  useAccount({
    onDisconnect() {
      localStorage.removeItem("communityId");
    }
  });

  const ProtectedRoute = () => {
    if (!isConnected) {
      return <Navigate to="/" replace/>;
    }
    return <Outlet/>;
  };

  const MyCommunityLayout = lazy(() => import("./pages/MyCommunity/MyCommunityLayout"))
  const CommunityPageLayout = lazy(() => import("./pages/CommunityPage/CommunityPageLayout"))

  const loadingFallback = () => (
    <small>...</small>
  )

  return (
    <>
      <BrowserRouter>
        <Suspense fallback={loadingFallback()}>
          <Routes>
            <Route exact path="/" element={<Home/>}/>

            <Route element={<ProtectedRoute/>}>
              <Route exact path="/my" element={<MyCommunityLayout/>}>
                <Route exact path="dashboard" element={<MyDashboard/>}/>
                <Route exact path="nft" element={<NftCollection/>}/>
                <Route exact path="token" element={<FungibleToken/>}/>
                <Route exact path="settings" element={<Settings/>}/>
                <Route exact path="dao" element={<DAO/>}/>
                <Route exact path="raffle" element={<Raffle/>}/>
                <Route exact path="members" element={<Members/>}/>
              </Route>
            </Route>

            <Route exact path="/category/:categoryId" element={<Category/>}/>
            <Route exact path="/category/:categoryId/:communityId" element={<CommunityPageLayout/>}>
              <Route exact path="" element={<Dashboard/>}/>
              <Route exact path="nft/:nftId" element={<NFTDetails/>}/>
            </Route>

            <Route path='*' element={<Error404/>}/>
          </Routes>
        </Suspense>
      </BrowserRouter>

      {transactions.length > 0 && (
        <div className="fixed z-100 right-0 top-0 w-[420px] pr-4 pt-4">
          {transactions.map(tx => (
            <Transaction tx={tx} key={tx.hash}/>
          ))}
        </div>
      )}
    </>
  )
}
