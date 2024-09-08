"use client";
import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import "./globals.scss";
import { Web3Auth } from "@web3auth/modal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import RPC from "./web3RPC"; // Use web3.js for blockchain interactions
import Main from "./page";

const inter = Inter({ subsets: ["latin"] });

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [provider, setProvider] = useState<IProvider | null>(null);

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

  // Function to fetch user info
  const getUserInfo = async () => {
    if (!web3auth) {
      console.log("Web3Auth not initialized yet");
      return;
    }
    try {
      const user = await web3auth.getUserInfo();
      console.log(user);
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
      console.log("Logged out");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Function to get user's accounts
  const getAccounts = async () => {
    if (!provider) {
      console.log("Provider not initialized yet");
      return;
    }
    try {
      const address = await RPC.getAccounts(provider);
      console.log(address);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  // Function to get user's balance
  const getBalance = async () => {
    if (!provider) {
      console.log("Provider not initialized yet");
      return;
    }
    try {
      const balance = await RPC.getBalance(provider);
      console.log(balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  // Function to sign a message
  const signMessage = async () => {
    if (!provider) {
      console.log("Provider not initialized yet");
      return;
    }
    try {
      const signedMessage = await RPC.signMessage(provider);
      console.log(signedMessage);
    } catch (error) {
      console.error("Error signing message:", error);
    }
  };

  // Function to send a transaction
  const sendTransaction = async () => {
    if (!provider) {
      console.log("Provider not initialized yet");
      return;
    }
    console.log("Sending transaction...");
    try {
      const transactionReceipt = await RPC.sendTransaction(provider);
      console.log(transactionReceipt);
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

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

  return (
    <html lang="en">
      <body className={inter.className}>
        <Header loggedIn={loggedIn} login={login} logout={logout} />
        {!loggedIn ? <Main loggedIn={loggedIn} login={login} /> : children}
        <Footer />
      </body>
    </html>
  );
}
