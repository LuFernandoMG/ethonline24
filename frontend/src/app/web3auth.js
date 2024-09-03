// Import Web3Auth core and the OpenloginAdapter
import { Web3Auth } from "@web3auth/web3auth";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

// Get the client ID from the environment variable
const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;

// Initialize the Web3Auth instance
const web3auth = new Web3Auth({
  clientId, // Client ID from Web3Auth Dashboard
  chainConfig: {
    chainNamespace: "eip155", // Chain namespace for EVM chains
    chainId: "0x31", // Chain ID for Rootstock; replace with your target chain
    rpcTarget: process.env.NEXT_PUBLIC_ROOTSTOCK_RPC_URL, // RPC URL for the blockchain
  },
});

// Configure the OpenloginAdapter with desired settings
const openloginAdapter = new OpenloginAdapter({
  adapterSettings: {
    network: "testnet", // Use "mainnet" for production
    clientId, // Client ID from Web3Auth Dashboard
  },
});

// Attach the adapter to Web3Auth instance
web3auth.configureAdapter(openloginAdapter);

// Export the configured Web3Auth instance
export default web3auth;
