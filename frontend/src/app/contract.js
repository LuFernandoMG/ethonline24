// Import Web3 library to interact with the Ethereum blockchain
import Web3 from 'web3';
// Import ABI (Application Binary Interface) files for the contracts
import leasingFactoryABI from './abi/CrowdLeasingFactory.json';
import leasingContractABI from './abi/CrowdLeasingContract.json';

// Note: The provider is now expected to be passed from the calling function (e.g., from page.tsx)

// Contract addresses, using toChecksumAddress to ensure address format correctness
const factoryContractAddress = process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS;

// Create contract instances using ABIs and addresses
const createLeasingFactoryInstance = (provider) => {
    const web3 = new Web3(provider);
    return new web3.eth.Contract(leasingFactoryABI, web3.utils.toChecksumAddress(factoryContractAddress));
};

// Function to create a new leasing contract using the Web3Auth-connected user's wallet
const createLeasingContract = async (fromAddress, tokenName, tokenSymbol, provider, amount, duration, fundingPeriod, tokenPrice) => {
    try {
        const web3 = new Web3(provider);
        const leasingFactory = createLeasingFactoryInstance(provider);
        const gasPrice = await web3.eth.getGasPrice();
        const gasLimit = 3000000;

        // Log the received amount and other parameters for debugging
        console.log("Amount received:", amount);
        console.log("Duration received:", duration);
        console.log("Funding period received:", fundingPeriod);
        console.log("Token price received:", tokenPrice);

        // Validate parameters before proceeding
        if (!amount || isNaN(parseFloat(amount))) {
            throw new Error('Invalid amount');
        }
        if (!duration || isNaN(parseInt(duration))) {
            throw new Error('Invalid duration');
        }
        if (!fundingPeriod || isNaN(parseInt(fundingPeriod))) {
            throw new Error('Invalid funding period');
        }
        if (!tokenPrice || isNaN(parseFloat(tokenPrice))) {
            throw new Error('Invalid token price');
        }

        // Convert amount and tokenPrice to wei
        const amountInWei = web3.utils.toWei(amount.toString(), 'ether');
        const tokenPriceInWei = web3.utils.toWei(tokenPrice.toString(), 'ether');

        console.log("Amount converted to wei:", amountInWei);
        console.log("Token price converted to wei:", tokenPriceInWei);

        // Prepare the raw transaction data for contract creation
        const createLeasingContractTx = leasingFactory.methods.createCrowdLeasingContract(tokenName, tokenSymbol);
        const txData = createLeasingContractTx.encodeABI();

        // Log the transaction data before sending
        console.log("Transaction data for contract creation:", txData);

        // Define the transaction object
        const tx = {
            from: fromAddress,
            to: web3.utils.toChecksumAddress(factoryContractAddress),
            data: txData,
            gas: gasLimit,
            gasPrice: gasPrice,
        };

        // Log the transaction object to be sent
        console.log("Transaction object:", tx);

        // Send the transaction using the Web3Auth user's wallet
        const receipt = await web3.eth.sendTransaction(tx);
        console.log('Leasing contract creation transaction receipt:', receipt);

        // Find the event signature for NewLeasingContract
        const eventSignature = web3.utils.sha3("NewLeasingContract(address,address)");

        // Log event signature for reference
        console.log("Event signature for NewLeasingContract:", eventSignature);

        // Loop through logs to find the NewLeasingContract event
        let newContractAddress = null;
        receipt.logs.forEach((log, index) => {
            console.log(`Log ${index}:`, log); // Log each log for inspection

            if (log.topics[0] === eventSignature) {
                try {
                    const decodedLog = web3.eth.abi.decodeLog(
                        [
                            { type: 'address', name: 'user', indexed: true },
                            { type: 'address', name: 'contractAddress', indexed: false }
                        ],
                        log.data,
                        log.topics.slice(1)
                    );

                    if (decodedLog && decodedLog.contractAddress) {
                        newContractAddress = decodedLog.contractAddress;
                        console.log('New Leasing Contract created at:', newContractAddress);
                    }
                } catch (err) {
                    console.error('Error decoding NewLeasingContract log:', err);
                }
            }
        });

        if (!newContractAddress) {
            throw new Error('NewLeasingContract event not found in the receipt');
        }

        // Now call `createLeasingRequest` with the validated and converted parameters
        console.log('Calling createLeasingRequest with:', {
            newContractAddress,
            amountInWei,
            duration,
            fundingPeriod,
            tokenPriceInWei
        });

        const contractInstance = new web3.eth.Contract(leasingContractABI, newContractAddress);
        const leasingRequestReceipt = await createLeasingRequest(contractInstance, fromAddress, amountInWei, duration, fundingPeriod, tokenPriceInWei, provider);
        console.log('Leasing request created:', leasingRequestReceipt);

        return contractInstance; // Return the newly created contract instance
    } catch (error) {
        console.error('Error creating leasing contract:', error);
        throw error;
    }
};


// Function to get the address of a specific leasing contract by its leaseId
const getLeasingContractAddress = async (leaseId, provider) => {
    try {
        const web3 = new Web3(provider);
        const leasingFactory = createLeasingFactoryInstance(provider);
        const address = await leasingFactory.methods.leasingContracts(leaseId).call();
        console.log('Leasing contract address:', address);
        return address;
    } catch (error) {
        console.error('Error fetching leasing contract address:', error);
        throw error;
    }
};

// Function to initialize a leasing contract instance by its address
const initializeLeasingContract = (contractAddress, provider) => {
    const web3 = new Web3(provider);
    return new web3.eth.Contract(leasingContractABI, contractAddress);
};

// Function to create a leasing request within a specific leasing contract
const createLeasingRequest = async (contractInstance, fromAddress, amount, duration, fundingPeriod, tokenPrice, provider) => {
    try {
        const web3 = new Web3(provider);
        const amountInWei = web3.utils.toWei(amount, 'ether');
        const gasPrice = await web3.eth.getGasPrice();
        const gasLimit = 3000000;

        // Create the raw transaction data for creating a leasing request
        const createLeasingRequestTx = contractInstance.methods.createLeasingRequest(amountInWei, duration, fundingPeriod, tokenPrice);
        const txData = createLeasingRequestTx.encodeABI();

        // Define the transaction object
        const tx = {
            from: fromAddress, // User's address
            to: contractInstance.options.address, // Leasing contract address
            data: txData, // Encoded ABI data
            gas: gasLimit, // Gas limit
            gasPrice: gasPrice, // Gas price
        };

        // Send the transaction using the Web3Auth user's wallet
        const receipt = await web3.eth.sendTransaction(tx);
        console.log('Leasing request created:', receipt);
        return receipt;
    } catch (error) {
        console.error('Error creating leasing request:', error);
        throw error;
    }
};

// Function to invest in a leasing request
const investInLeasing = async (contractInstance, fromAddress, leaseId, amount, provider) => {
    try {
        const web3 = new Web3(provider);
        const gasPrice = await web3.eth.getGasPrice();
        const gasLimit = 3000000;
        const amountInWei = web3.utils.toWei(amount, 'ether');

        // Create the raw transaction data for the investment
        const investInLeasingTx = contractInstance.methods.investInLeasing(leaseId);
        const txData = investInLeasingTx.encodeABI();

        // Define the transaction object
        const tx = {
            from: fromAddress, // User's address
            to: contractInstance.options.address, // Leasing contract address
            data: txData, // Encoded ABI data
            gas: gasLimit, // Gas limit
            gasPrice: gasPrice, // Gas price
            value: amountInWei, // Amount being invested in wei
        };

        // Send the transaction using the Web3Auth user's wallet
        const receipt = await web3.eth.sendTransaction(tx);
        console.log('Investment successful:', receipt);
        return receipt;
    } catch (error) {
        console.error('Error investing in leasing:', error);
        throw error;
    }
};

// Function to get the remaining amount to be funded for a specific lease
const getRemainingAmount = async (contractInstance, leaseId, provider) => {
    try {
        const web3 = new Web3(provider);
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

// Function to handle leasing request state changes using the event
const watchLeasingRequestStateChanges = (contractInstance, callback, provider) => {
    const web3 = new Web3(provider);
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
const listActiveLeasingRequests = async (contractInstance, provider) => {
    try {
        console.log('Active leasing requests:', activeLeasingRequests);
        return activeLeasingRequests;
    } catch (error) {
        console.error('Error listing active leasing requests:', error);
        throw error;
    }
};

// Export all the functions and instances that are necessary for interaction
export {
    createLeasingFactoryInstance,
    createLeasingContract,
    getLeasingContractAddress,
    initializeLeasingContract,
    createLeasingRequest,
    investInLeasing,
    getRemainingAmount,
    listActiveLeasingRequests,
    watchLeasingRequestStateChanges
};

