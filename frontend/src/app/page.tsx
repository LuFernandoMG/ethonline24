// src/page.tsx

"use client";

import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3Auth } from "@web3auth/modal";
import { useEffect, useState } from "react";
import RPC from "./web3RPC"; // Use web3.js for blockchain interactions

// Access environment variables using process.env
const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || ""; // Web3Auth Client ID
const rpcUrl = process.env.NEXT_PUBLIC_ROOTSTOCK_RPC_URL || ""; // Rootstock RPC URL

// Configuration for Rootstock Testnet
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x1f", // Rootstock Testnet Chain ID
  rpcTarget: rpcUrl, // Rootstock Testnet RPC URL
  displayName: "Rootstock Testnet",
  blockExplorerUrl: "https://explorer.testnet.rootstock.io/",
  ticker: "tRBTC",
  tickerName: "Rootstock Testnet RBTC",
  logo: "https://pbs.twimg.com/profile_images/1592915327343624195/HPPSuVx3_400x400.jpg",
};

// Initialize Web3Auth with Ethereum private key provider
const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3auth = new Web3Auth({
  clientId, // Client ID from environment variable
  web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET, // Use TESTNET for development
  privateKeyProvider,
});

function App() {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await web3auth.initModal();
        setProvider(web3auth.provider);

        if (web3auth.connected) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error("Error initializing Web3Auth:", error);
      }
    };

    init();
  }, []);

  // Function to handle user login
  const login = async () => {
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      if (web3auth.connected) {
        setLoggedIn(true);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  // Function to fetch user info
  const getUserInfo = async () => {
    if (!web3auth) {
      console.log("Web3Auth not initialized yet");
      return;
    }
    try {
      const user = await web3auth.getUserInfo();
      uiConsole(user);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  // Function to handle user logout
  const logout = async () => {
    try {
      await web3auth.logout();
      setProvider(null);
      setLoggedIn(false);
      uiConsole("Logged out");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Function to get user's accounts
  const getAccounts = async () => {
    if (!provider) {
      uiConsole("Provider not initialized yet");
      return;
    }
    try {
      const address = await RPC.getAccounts(provider);
      uiConsole(address);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  // Function to get user's balance
  const getBalance = async () => {
    if (!provider) {
      uiConsole("Provider not initialized yet");
      return;
    }
    try {
      const balance = await RPC.getBalance(provider);
      uiConsole(balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  // Function to sign a message
  const signMessage = async () => {
    if (!provider) {
      uiConsole("Provider not initialized yet");
      return;
    }
    try {
      const signedMessage = await RPC.signMessage(provider);
      uiConsole(signedMessage);
    } catch (error) {
      console.error("Error signing message:", error);
    }
  };

  // Function to send a transaction
  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("Provider not initialized yet");
      return;
    }
    uiConsole("Sending transaction...");
    try {
      const transactionReceipt = await RPC.sendTransaction(provider);
      uiConsole(transactionReceipt);
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  // Utility function to display output in console
  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
      console.log(...args);
    }
  }

  // Render view for logged-in users
  const loggedInView = (
    <>
      <div className="flex-container">
        <div>
          <button onClick={getUserInfo} className="card">
            Get User Info
          </button>
        </div>
        <div>
          <button onClick={getAccounts} className="card">
            Get Accounts
          </button>
        </div>
        <div>
          <button onClick={getBalance} className="card">
            Get Balance
          </button>
        </div>
        <div>
          <button onClick={signMessage} className="card">
            Sign Message
          </button>
        </div>
        <div>
          <button onClick={sendTransaction} className="card">
            Send Transaction
          </button>
        </div>
        <div>
          <button onClick={logout} className="card">
            Log Out
          </button>
        </div>
      </div>
    </>
  );

  // Render view for users not logged in
  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );

  return (
    <div className="container">
      <h1 className="title">
        Web3Auth & NextJS Quick Start
      </h1>
      <div className="grid">{loggedIn ? loggedInView : unloggedInView}</div>
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>
    </div>
  );
}

export default App;

