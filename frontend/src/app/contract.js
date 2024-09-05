// Import Web3 library to interact with Ethereum blockchain
import Web3 from 'web3';
// Import ABI (Application Binary Interface) files for the contracts
import leasingFactoryABI from './abi/CrowdLeasingFactory.json';
import leasingContractABI from './abi/CrowdLeasingContract.json';

// Initialize Web3 instance and configure the provider (e.g., Infura, Alchemy, etc.)
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_ROOTSTOCK_RPC_URL));

// Contract addresses (should be defined in your environment variables)
const factoryContractAddress = process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS;

// Create contract instances using ABIs and addresses
const leasingFactory = new web3.eth.Contract(leasingFactoryABI, factoryContractAddress);

// Function to create a new leasing contract
const createLeasingContract = async (fromAddress) => {
    try {
        const result = await leasingFactory.methods.createLeasingContract().send({ from: fromAddress });
        console.log('Leasing contract created:', result);
        return result;
    } catch (error) {
        console.error('Error creating leasing contract:', error);
        throw error;
    }
};

// Function to get the address of a specific leasing contract
const getLeasingContractAddress = async (leaseId) => {
    try {
        const address = await leasingFactory.methods.leasingContracts(leaseId).call();
        console.log('Leasing contract address:', address);
        return address;
    } catch (error) {
        console.error('Error fetching leasing contract address:', error);
        throw error;
    }
};

// Initialize a leasing contract instance with its address
const initializeLeasingContract = (contractAddress) => {
    return new web3.eth.Contract(leasingContractABI, contractAddress);
};

// Function to create a leasing request within a specific leasing contract
const createLeasingRequest = async (contractInstance, fromAddress, amount, duration, fundingPeriod, tokenPrice) => {
    try {
        const result = await contractInstance.methods.createLeasingRequest(amount, duration, fundingPeriod, tokenPrice)
            .send({ from: fromAddress });
        console.log('Leasing request created:', result);
        return result;
    } catch (error) {
        console.error('Error creating leasing request:', error);
        throw error;
    }
};

// Function to invest in a leasing request
const investInLeasing = async (contractInstance, fromAddress, leaseId, amount) => {
    try {
        const result = await contractInstance.methods.investInLeasing(leaseId)
            .send({ from: fromAddress, value: web3.utils.toWei(amount, 'ether') });
        console.log('Investment successful:', result);
        return result;
    } catch (error) {
        console.error('Error investing in leasing:', error);
        throw error;
    }
};

// Function to get the remaining amount to be funded for a specific lease
const getRemainingAmount = async (contractInstance, leaseId) => {
    try {
        const remainingAmount = await contractInstance.methods.getRemainingAmount(leaseId).call();
        console.log('Remaining amount:', remainingAmount);
        return remainingAmount;
    } catch (error) {
        console.error('Error fetching remaining amount:', error);
        throw error;
    }
};

// List to keep track of active leasing requests
let activeLeasingRequests = [];

// **New Function** to handle leasing request state changes using the event
const watchLeasingRequestStateChanges = (contractInstance, callback) => {
    contractInstance.events.LeasingRequestStateChanged({}, (error, event) => {
        if (error) {
            console.error('Error in LeasingRequestStateChanged event:', error);
        } else {
            console.log('Leasing request state changed:', event);
            const { leaseId, newState } = event.returnValues;

            // Update the activeLeasingRequests list based on the new state
            if (newState === '1') { // If the state is 'Active'
                if (!activeLeasingRequests.includes(leaseId)) {
                    activeLeasingRequests.push(leaseId);
                }
            } else { // If the state is not 'Active'
                activeLeasingRequests = activeLeasingRequests.filter(id => id !== leaseId);
            }

            callback(event);
        }
    });
};

// Function to list all active leasing requests
const listActiveLeasingRequests = async (contractInstance) => {
    try {
        // Instead of calling the blockchain, return the activeLeasingRequests list
        console.log('Active leasing requests:', activeLeasingRequests);
        return activeLeasingRequests;
    } catch (error) {
        console.error('Error listing active leasing requests:', error);
        throw error;
    }
};

// Export all the functions and instances that are necessary for interaction
export {
    leasingFactory,
    createLeasingContract,
    getLeasingContractAddress,
    initializeLeasingContract,
    createLeasingRequest,
    investInLeasing,
    getRemainingAmount,
    listActiveLeasingRequests,
    watchLeasingRequestStateChanges
};
