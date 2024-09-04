// src/web3RPC.ts
import type { IProvider } from "@web3auth/base";
import Web3 from "web3";

// Function to get the connected chain ID
const getChainId = async (provider: IProvider): Promise<string> => {
  try {
    const web3 = new Web3(provider as any);
    const chainId = await web3.eth.getChainId();
    return chainId.toString();
  } catch (error) {
    return error as string;
  }
};

// Function to get user's Ethereum public address
const getAccounts = async (provider: IProvider): Promise<any> => {
  try {
    const web3 = new Web3(provider as any);
    const address = await web3.eth.getAccounts();
    return address;
  } catch (error) {
    return error;
  }
};

// Function to get the user's balance in RBTC
const getBalance = async (provider: IProvider): Promise<string> => {
  try {
    const web3 = new Web3(provider as any);
    const address = (await web3.eth.getAccounts())[0];
    const balance = web3.utils.fromWei(await web3.eth.getBalance(address), "ether");
    return balance;
  } catch (error) {
    return error as string;
  }
};

// Function to sign a message
const signMessage = async (provider: IProvider): Promise<string> => {
  try {
    const web3 = new Web3(provider as any);
    const fromAddress = (await web3.eth.getAccounts())[0];
    const originalMessage = "YOUR_MESSAGE";
    const signedMessage = await web3.eth.personal.sign(originalMessage, fromAddress, "test password!");
    return signedMessage;
  } catch (error) {
    return error as string;
  }
};

// Function to send a transaction
const sendTransaction = async (provider: IProvider): Promise<any> => {
  try {
    const web3 = new Web3(provider as any);
    const fromAddress = (await web3.eth.getAccounts())[0];
    const destination = fromAddress; // For demo purposes, sending to the same address
    const amount = web3.utils.toWei("0.00005", "ether");

    // Estimate gas for the transaction
    const gas = await web3.eth.estimateGas({
      from: fromAddress,
      to: destination,
      value: amount,
    });

    // Get the current gas price
    const gasPrice = await web3.eth.getGasPrice();

    // Prepare the transaction object using legacy gas price
    const transaction = {
      from: fromAddress,
      to: destination,
      value: amount,
      gas,
      gasPrice, // Explicitly specify gasPrice for Rootstock
    };

    // Send the transaction
    const receipt = await web3.eth.sendTransaction(transaction);
    return JSON.stringify(receipt, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );
  } catch (error) {
    console.error("Error sending transaction:", error);
    return error as string;
  }
};



export default { getChainId, getAccounts, getBalance, signMessage, sendTransaction };
