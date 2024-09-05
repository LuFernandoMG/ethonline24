"use client";
import React, { useEffect, useState } from "react";
import styles from "./page.module.scss";
import Image from "next/image";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3Auth } from "@web3auth/modal";
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
  const [userType, setUserType] = useState<"borrower" | "investor">("investor");
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
  });

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

  function Arrow(props: {
    disabled: boolean;
    left?: boolean;
    onClick: (e: any) => void;
  }) {
    const disabled = props.disabled ? " arrow--disabled" : "";
    return (
      <svg
        onClick={props.onClick}
        className={`arrow ${
          props.left ? "arrow--left" : "arrow--right"
        } ${disabled}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        {props.left && (
          <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />
        )}
        {!props.left && (
          <path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />
        )}
      </svg>
    );
  }

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

  const handleTypeUser = (event: any) => {
    setUserType(event.target.value);
  };

  // Render view for logged-in users
  const loggedInView = (
    <div className="">
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
    </div>
  );

  // Render view for users not logged in
  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );

  return (
    <div className={styles.container}>
      <Image
        src="/assets/landing-image.jpg"
        alt="Web3Auth Logo"
        width={200}
        height={200}
        className={styles.left_panel}
      />
      <div className={styles.right_panel}>
        <button className={styles.login_button} onClick={login}>
          Login
        </button>

        <h1>Crowdly</h1>

        <h3>How does it work?</h3>

        <div className={styles.switch}>
          <label className={(userType === "investor" && styles.active) || ""}>
            <input
              id="userType"
              type="radio"
              onChange={handleTypeUser}
              name="userType"
              value="investor"
            />
            Investor
          </label>
          <label className={(userType === "borrower" && styles.active) || ""}>
            <input
              id="userType"
              type="radio"
              onChange={handleTypeUser}
              name="userType"
              value="borrower"
            />
            Borrower
          </label>
        </div>

        <>
          <div className={styles.navigationWrapper}>
            <div ref={sliderRef} className="keen-slider">
              <div className="keen-slider__slide">
                <h3>{userType === "investor" ? "💵" : "📝"}</h3>
                <p>
                  {userType === "investor"
                    ? "Invest on projects"
                    : "Propose your projects"}
                </p>
              </div>
              <div className="keen-slider__slide">
                <h3>{userType === "investor" ? "📜" : "💸"}</h3>
                <p>
                  {userType === "investor"
                    ? "Get tokens as owner of the assets acquired"
                    : "Fund your project"}
                </p>
              </div>
              <div className="keen-slider__slide">
                <h3>{userType === "investor" ? "💰" : "🚛"}</h3>
                <p>
                  {userType === "investor"
                    ? "Get passive income by borrow over your physical assets"
                    : "Pay as you use with complete autonomy"}
                </p>
              </div>
            </div>
          </div>
          {loaded && instanceRef.current && (
            <div className={styles.dots}>
              {Array.from(
                Array(instanceRef.current.track.details.slides.length).keys()
              ).map((idx) => {
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      instanceRef.current?.moveToIdx(idx);
                    }}
                    className={currentSlide === idx ? styles.dotActive : styles.dot}
                  ></button>
                );
              })}
            </div>
          )}
        </>

        <button className={styles.button} onClick={login}>
          Start your journey!
        </button>
      </div>
    </div>
  );
}

export default App;
