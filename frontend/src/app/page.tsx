"use client";
import React, { useEffect, useState } from "react";
import styles from "./page.module.scss";
import Image from "next/image";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3Auth } from "@web3auth/modal";
import RPC from "./web3RPC"; 
import { createLeasingContract } from './contract';

// Access environment variables
const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || ""; 
const rpcUrl = process.env.NEXT_PUBLIC_ROOTSTOCK_RPC_URL || ""; 

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x1f", // Rootstock Testnet Chain ID
  rpcTarget: rpcUrl, 
  displayName: "Rootstock Testnet",
  blockExplorerUrl: "https://explorer.testnet.rootstock.io/",
  ticker: "tRBTC",
  tickerName: "Rootstock Testnet RBTC",
  logo: "https://pbs.twimg.com/profile_images/1592915327343624195/HPPSuVx3_400x400.jpg",
};

// Initialize Web3Auth
const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});
const web3auth = new Web3Auth({
  clientId, 
  web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET, 
  privateKeyProvider,
});

function App() {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [userType, setUserType] = useState<"borrower" | "investor">("investor");
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeLeasingRequests, setActiveLeasingRequests] = useState<string[]>([]);
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [fundingPeriod, setFundingPeriod] = useState("");
  const [tokenPrice, setTokenPrice] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");

  // Landing page stays until login
  useEffect(() => {
    const init = async () => {
      try {
        await web3auth.initModal();
        setProvider(web3auth.provider);
        if (web3auth.connected) {
          setLoggedIn(true);
          const accounts = await RPC.getAccounts(web3auth.provider);
          const balance = await RPC.getBalance(web3auth.provider);
          setAccount(accounts[0]);
          setBalance(balance);
        }
      } catch (error) {
        console.error("Error initializing Web3Auth:", error);
      }
    };
    init();
  }, []);

  // Handle login
  const login = async () => {
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      setLoggedIn(true);
      const accounts = await RPC.getAccounts(web3authProvider);
      const balance = await RPC.getBalance(web3authProvider);
      setAccount(accounts[0]);
      setBalance(balance);
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  // Handle logout
  const logout = async () => {
    try {
      await web3auth.logout();
      setProvider(null);
      setLoggedIn(false);
      setAccount("");
      setBalance("");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Borrower creates a new leasing contract
  const handleCreateLeasingContract = async () => {
    try {
        if (provider) {
            // Check if all the required values are present
            if (!tokenName || !tokenSymbol || !amount || !duration || !fundingPeriod || !tokenPrice) {
                alert("Please fill in all the fields."); // Alert user if any field is missing
                return; // Stop execution if any field is missing
            }

            const accounts = await RPC.getAccounts(provider); // Fetch the user's account from the provider
            
            // Call createLeasingContract function and pass all the necessary parameters
            await createLeasingContract(
                accounts[0],       // The user's address (from the fetched accounts)
                tokenName,         // Name of the token
                tokenSymbol,       // Symbol of the token
                provider,          // The provider object (from Web3Auth)
                amount,            // Amount in ether (from the form input)
                duration,          // Duration of the leasing contract (from the form input)
                fundingPeriod,     // Funding period for the leasing contract (from the form input)
                tokenPrice         // Price of the token (from the form input)
            );
            
            alert('Leasing contract and request created successfully'); // Alert success message
        }
    } catch (error) {
        console.error("Error creating leasing contract:", error); // Log any error that occurs
    }
  };



  // Investor views active leasing requests
  const handleViewActiveLeases = async () => {
    try {
        const leases = await getActiveLeasingContracts(provider); 
        setActiveLeasingRequests(leases); 
    } catch (error) {
        console.error("Error listing active leasing requests:", error);
    }
  };


  const handleTypeUser = (event: any) => {
    setUserType(event.target.value);
  };

  // Render for borrower (form)
  const borrowerForm = (
    <div className={styles.formContainer}>
      <div className={styles.form}>
        <h3>Create Leasing Request</h3>
        <input type="text" placeholder="Token Name" value={tokenName} onChange={e => setTokenName(e.target.value)} />
        <input type="text" placeholder="Token Symbol" value={tokenSymbol} onChange={e => setTokenSymbol(e.target.value)} />
        <input type="text" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
        <input type="text" placeholder="Duration (days)" value={duration} onChange={e => setDuration(e.target.value)} />
        <input type="text" placeholder="Funding Period (days)" value={fundingPeriod} onChange={e => setFundingPeriod(e.target.value)} />
        <input type="text" placeholder="Token Price" value={tokenPrice} onChange={e => setTokenPrice(e.target.value)} />
        <button onClick={handleCreateLeasingContract}>Submit Leasing Request</button>
      </div>
    </div>
  );

  // Render for investor (list of active leases)
  const investorView = (
    <div className={styles.investor}>
      <button onClick={handleViewActiveLeases} className={styles.refreshButton}>Refresh List</button>
      <h3>Active Leasing Requests</h3>
      {activeLeasingRequests.length > 0 ? (
        <ul>
          {activeLeasingRequests.map((contractAddress, idx) => (
              <li key={idx}>
                  Contract Address: {contractAddress} 
                  <button onClick={() => handleFundContract(contractAddress)}>Fund</button>
              </li>
          ))}
        </ul>
      ) : (
        <p>No active leasing requests available</p>
      )}

    </div>
  );

  // Profile section to display wallet and balance
  const profileView = (
    <div className={styles.profile}>
      <h3>Profile</h3>
      <p><strong>Wallet Address:</strong> {account}</p>
      <p><strong>Balance:</strong> {balance} tRBTC</p>
    </div>
  );

  return (
    <div className={styles.container}>
      <Image src="/assets/landing-image.jpg" alt="Web3Auth Logo" width={200} height={200} className={styles.left_panel} />
      <div className={styles.right_panel}>
        {!loggedIn ? (
          <>
            <button className={styles.login_button} onClick={login}>Login</button>
            <h1>Crowdly</h1>
            <h3>How does it work?</h3>
            <div className={styles.switch}>
              <label className={(userType === "investor" && styles.active) || ""}>
                <input id="userType" type="radio" onChange={handleTypeUser} name="userType" value="investor" /> Investor
              </label>
              <label className={(userType === "borrower" && styles.active) || ""}>
                <input id="userType" type="radio" onChange={handleTypeUser} name="userType" value="borrower" /> Borrower
              </label>
            </div>
            <p>Start your journey by selecting your role and logging in!</p>
            <button className={styles.start_button} onClick={login}>Start your journey!</button>
          </>
        ) : (
          <>
            {profileView}
            {userType === "borrower" ? borrowerForm : investorView}
            <button className={styles.logout_button} onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;