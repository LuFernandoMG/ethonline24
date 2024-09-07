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

        console.log("Amount received:", amount);
        console.log("Duration received:", duration);
        console.log("Funding period received:", fundingPeriod);
        console.log("Token price received:", tokenPrice);

        // Convert amount and tokenPrice to wei
        const amountInWei = web3.utils.toWei(amount.toString(), 'ether');
        const tokenPriceInWei = web3.utils.toWei(tokenPrice.toString(), 'ether');

        console.log("Amount converted to wei:", amountInWei);
        console.log("Token price converted to wei:", tokenPriceInWei);

        // Prepare the raw transaction data for contract creation
        const createLeasingContractTx = leasingFactory.methods.createCrowdLeasingContract(tokenName, tokenSymbol);
        const txData = createLeasingContractTx.encodeABI();

        const tx = {
            from: fromAddress,
            to: web3.utils.toChecksumAddress(factoryContractAddress),
            data: txData,
            gas: gasLimit,
            gasPrice: gasPrice,
        };

        const receipt = await web3.eth.sendTransaction(tx);
        console.log('Leasing contract creation transaction receipt:', receipt);

        const eventSignature = web3.utils.sha3("NewLeasingContract(address,address)");
        let newContractAddress = null;
        receipt.logs.forEach((log) => {
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

        return contractInstance;
    } catch (error) {
        console.error('Error creating leasing contract:', error);
        throw error;
    }
};


const createLeasingRequest = async (contractInstance, fromAddress, amount, duration, fundingPeriod, tokenPrice, provider) => {
    try {
        const web3 = new Web3(provider);
        const amountInWei = web3.utils.toWei(amount, 'ether');
        const gasPrice = await web3.eth.getGasPrice();
        const gasLimit = 3000000;

        const createLeasingRequestTx = contractInstance.methods.createLeasingRequest(amountInWei, duration, fundingPeriod, tokenPrice);
        const txData = createLeasingRequestTx.encodeABI();

        const tx = {
            from: fromAddress,
            to: contractInstance.options.address,
            data: txData,
            gas: gasLimit,
            gasPrice: gasPrice,
        };

        const receipt = await web3.eth.sendTransaction(tx);
        console.log('Leasing request created:', receipt);
        return receipt;
    } catch (error) {
        console.error('Error creating leasing request:', error);
        throw error;
    }
};

// Function to get active leasing contract
const getActiveLeasingContracts = async (provider) => {
    try {
        console.log("Starting to retrieve active leasing contracts...");
        const web3 = new Web3(provider);
        console.log("Web3 instance created successfully with provider:", provider);
        
        const leasingFactory = createLeasingFactoryInstance(provider);
        console.log("Leasing factory instance created:", leasingFactory);

        const totalContracts = await leasingFactory.methods.getTotalContracts().call();
        console.log("Total number of contracts retrieved from factory:", totalContracts);

        const activeLeases = [];

        for (let i = 0; i < totalContracts; i++) {
            console.log(`Retrieving contract at index ${i}...`);
            const contractAddress = await leasingFactory.methods.getContractByIndex(i).call();
            console.log(`Contract address at index ${i}:`, contractAddress);

            const leasingContract = new web3.eth.Contract(leasingContractABI, contractAddress);
            console.log(`Leasing contract instance created for address ${contractAddress}:`, leasingContract);

            const leaseId = i; // Use `i` as the leaseId
            console.log(`Retrieving status for leaseId ${leaseId} in contract ${contractAddress}...`);

            const status = await leasingContract.methods.getStatus(leaseId).call();
            const statusAsNumber = Number(status); // Ensure it's treated as a number
            console.log(`Status for leaseId ${leaseId} in contract ${contractAddress}:`, statusAsNumber);

            // Check if status is Active (1)
            if (statusAsNumber === 1) {
                console.log(`Contract ${contractAddress} with leaseId ${leaseId} is active, adding to list...`);
                activeLeases.push(contractAddress);
            } else {
                console.log(`Contract ${contractAddress} with leaseId ${leaseId} is not active, skipping...`);
            }
        }

        console.log("All contracts processed. Active leases found:", activeLeases);
        return activeLeases;
    } catch (error) {
        console.error("Error retrieving active leasing contracts:", error);
        throw error;
    }
};







//Function to funding leasing request

const fundLeasingContract = async (contractAddress, fromAddress, investmentAmount, provider) => {
    try {
        console.log(`Starting to fund leasing contract at address: ${contractAddress}`);
        console.log(`From address: ${fromAddress}`);
        console.log(`Investment amount: `, investmentAmount);
        console.log(`Type of investmentAmount: `, typeof investmentAmount);

        if (typeof investmentAmount !== 'number' && typeof investmentAmount !== 'string') {
            throw new Error(`Invalid investmentAmount type: ${typeof investmentAmount}. It should be a number or string.`);
        }

        const web3 = new Web3(provider);
        console.log("Web3 instance created successfully with the provided provider");

        const leasingContract = new web3.eth.Contract(leasingContractABI, contractAddress);
        console.log(`Leasing contract instance created for address: ${contractAddress}`);

        // Check balance before proceeding
        const balance = await web3.eth.getBalance(fromAddress);
        console.log(`Balance of fromAddress: ${balance} wei`);

        if (parseFloat(balance) < parseFloat(web3.utils.toWei(investmentAmount.toString(), 'ether'))) {
            throw new Error("Insufficient balance to fund the contract.");
        }

        // Get gas price and log it
        const gasPrice = await web3.eth.getGasPrice();
        console.log(`Gas price retrieved: ${gasPrice}`);

        // Set gas limit and log it
        const gasLimit = 3000000;
        console.log(`Gas limit set: ${gasLimit}`);

        // Convert investment amount to wei and log it
        const investmentAmountInWei = web3.utils.toWei(investmentAmount.toString(), 'ether');
        console.log(`Investment amount in wei: ${investmentAmountInWei}`);

        // Prepare transaction and log it
        const tx = {
            from: fromAddress,
            to: contractAddress,
            value: investmentAmountInWei,
            gas: gasLimit,
            gasPrice: gasPrice,
        };
        console.log("Prepared transaction object: ", tx);

        // Send transaction and log the receipt
        const receipt = await web3.eth.sendTransaction(tx);
        console.log('Investment transaction receipt:', receipt);

        // Return the transaction receipt
        return receipt;
    } catch (error) {
        console.error("Error funding leasing contract:", error);
        throw error;
    }
};






// Export only necessary functions
export {
    createLeasingFactoryInstance,
    createLeasingContract,
    createLeasingRequest,
    getActiveLeasingContracts,
    fundLeasingContract
};
