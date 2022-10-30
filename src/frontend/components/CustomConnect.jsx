import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useNavigate } from "react-router-dom";
import { Btn, BtnSmall } from "../assets/css/common.style.jsx";
import Identicon from 'react-hooks-identicons';

const dashboardURL = "/my/dashboard";

export const CustomConnect = ({ isHeader }) => {
  const navigate = useNavigate();

  const redirectOrConnect = (isConnected, openConnectModal) => {
    if (isConnected) {
      navigate(dashboardURL);
    } else {
      openConnectModal();
    }
  }

  return (
    <ConnectButton.Custom>
      {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');
        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {!isHeader ? (
              <Btn onClick={() => redirectOrConnect(connected, openConnectModal)} type="button">
                {!connected ? "Create Community" : "Open Dashboard"}
              </Btn>
            ) : (
              <>
                {!connected ? (
                  <BtnSmall onClick={() => openConnectModal()} type="button">
                    Connect Wallet
                  </BtnSmall>
                ) : (
                  <div style={{ display: 'flex' }}>
                    <button
                      className={"bg-white rounded-l-xl pl-3 pr-2.5 hover:bg-gray-100 transition border-r border-gray-200"}
                      onClick={openChainModal}
                      type="button"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 26,
                            height: 26,
                            borderRadius: 999,
                            overflow: 'hidden',
                            marginRight: 4,
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              style={{ width: 26, height: 26 }}
                            />
                          )}
                        </div>
                      )}
                      {/*{chain.name}*/}
                    </button>

                    {chain.unsupported ? (
                      <BtnSmall onClick={() => openChainModal()} type="button">
                        Wrong network
                      </BtnSmall>
                    ) : (
                      <BtnSmall onClick={() => openAccountModal()} type="button" className={"rounded-l-none"}>
                        <div className={"w-6 h-6 border-2 border-gray-300 rounded-full bg-gray-200 p-0.5 mr-2 opacity-80"}>
                          {account.ensImage ? (
                            <img src={account.ensImage ? account.ensImage : ""} alt="" className={"w-6 h-6"}/>
                          ) : (
                            <Identicon string={account.displayName} size={16}/>
                          )}
                        </div>
                        <span>{account.displayName}</span>
                        {/*{account.displayBalance ? ` (${account.displayBalance})` : ''}*/}
                      </BtnSmall>
                    )}

                  </div>
                )}
              </>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};