// Import Web3 library to interact with the Ethereum blockchain
import Web3 from 'web3';
// Import ABI (Application Binary Interface) files for the contracts
import leasingFactoryABI from './abi/CrowdLeasingFactory.json';
import leasingContractABI from './abi/CrowdLeasingContract.json';

// Set max listeners to prevent MaxListenersExceededWarning
require('events').EventEmitter.defaultMaxListeners = 20;

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

        // Debug logs for received inputs
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

        // Extract the new contract address from the event logs
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

        // Calling the createLeasingRequest method to initialize the request for the new contract
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

// Function to create a leasing request after the contract is created
const createLeasingRequest = async (contractInstance, fromAddress, amount, duration, fundingPeriod, tokenPrice, provider) => {
    try {
        const web3 = new Web3(provider);
        const gasPrice = await web3.eth.getGasPrice();
        const gasLimit = 3000000;

        // Prepare the transaction for creating the leasing request
        const createLeasingRequestTx = contractInstance.methods.createLeasingRequest(amount, duration, fundingPeriod, tokenPrice);
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

// Function to get active leasing contracts
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

        // Loop through each contract created by the factory
        for (let i = 0; i < totalContracts; i++) {
            console.log(`Retrieving contract at index ${i}...`);
            const contractAddress = await leasingFactory.methods.getContractByIndex(i).call();
            console.log(`Contract address at index ${i}:`, contractAddress);

            // Crear una instancia del contrato para verificar su estado
            const leasingContract = new web3.eth.Contract(leasingContractABI, contractAddress);
            console.log(`Leasing contract instance created for address ${contractAddress}:`, leasingContract);

            // Obtener el leaseId adecuado, en este caso asumimos que comienza en 1
            const leaseId = 1; // Ajustado para reflejar que la primera solicitud tiene leaseId = 1
            console.log(`Retrieving status for leaseId ${leaseId} in contract ${contractAddress}...`);

            const status = await leasingContract.methods.getStatus(leaseId).call();
            const statusAsNumber = Number(status); // Convertir el estado a número
            console.log(`Status for leaseId ${leaseId} in contract ${contractAddress}:`, statusAsNumber);

            // Verificar si el estado es Active (1)
            if (statusAsNumber === 1) {
                console.log(`Contract ${contractAddress} with leaseId ${leaseId} is active, adding to list...`);

                // Obtener el remaining amount para el contrato activo
                const remainingAmountInWei = await leasingContract.methods.getRemainingAmount(leaseId).call();
                console.log(`Remaining amount in wei for contract ${contractAddress}: ${remainingAmountInWei}`);
                const remainingAmountInEther = web3.utils.fromWei(remainingAmountInWei, 'ether');
                console.log(`Remaining amount for contract ${contractAddress}: ${remainingAmountInEther} ETH`);

                // Añadir el contrato activo a la lista
                activeLeases.push({
                    contractAddress,
                    remainingAmount: remainingAmountInEther // Convertido correctamente a ether
                });
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


// Function to fund a leasing contract
const fundLeasingContract = async (contractAddress, fromAddress, investmentAmount, provider) => {
    try {
        console.log("=========== FUND LEASING CONTRACT INITIATED ===========");
        console.log(`Starting to fund leasing contract at address: ${contractAddress}`);
        console.log(`From address: ${fromAddress}`);
        console.log(`Investment amount: `, investmentAmount);
        console.log(`Investment amount (type): `, typeof investmentAmount);

        const web3 = new Web3(provider);
        console.log("Web3 instance created successfully with the provided provider");

        const leasingContract = new web3.eth.Contract(leasingContractABI, web3.utils.toChecksumAddress(contractAddress));
        console.log(`Leasing contract instance created for address: ${contractAddress}`);

        // Check balance before proceeding
        const balance = await web3.eth.getBalance(web3.utils.toChecksumAddress(fromAddress));
        console.log(`Balance of fromAddress: ${balance} wei`);
        console.log(`Balance of fromAddress in ether: ${web3.utils.fromWei(balance, 'ether')} ETH`);

        // Ensure the balance is sufficient
        const requiredBalanceInWei = web3.utils.toWei(investmentAmount.toString(), 'ether');
        console.log(`Investment amount converted to wei: ${requiredBalanceInWei}`);

        if (parseFloat(balance) < parseFloat(requiredBalanceInWei)) {
            console.error("Insufficient balance detected.");
            throw new Error("Insufficient balance to fund the contract.");
        }

        // Get gas price and log it
        const gasPrice = parseInt(await web3.eth.getGasPrice());
        console.log(`Gas price retrieved: ${gasPrice}`);
        console.log(`Gas price in gwei: ${web3.utils.fromWei(gasPrice.toString(), 'gwei')} gwei`);

        // Set gas limit and log it
        const gasLimit = 3000000;
        console.log(`Gas limit set: ${gasLimit}`);

        // Convert investment amount to wei and log it
        const investmentAmountInWei = web3.utils.toWei(investmentAmount.toString(), 'ether');
        console.log(`Investment amount in wei: ${investmentAmountInWei}`);

        // Prepare transaction and log it
        const tx = {
            from: web3.utils.toChecksumAddress(fromAddress),
            to: web3.utils.toChecksumAddress(contractAddress),
            value: investmentAmountInWei.toString(),  // Ensure it's sent as a string
            gas: gasLimit,
            gasPrice: gasPrice,
        };
        console.log("Prepared transaction object: ", JSON.stringify(tx, null, 2));

        // Estimate gas and log it
        const gasEstimate = await web3.eth.estimateGas(tx);
        console.log(`Estimated Gas: ${gasEstimate}`);

        console.log("Sending transaction...");
        // Send transaction and log the receipt
        const receipt = await web3.eth.sendTransaction(tx);
        console.log('Investment transaction receipt:', receipt);

        console.log("=========== FUND LEASING CONTRACT SUCCESSFULLY COMPLETED ===========");
        return receipt;
    } catch (error) {
        console.error("Error funding leasing contract:", error.message);
        console.error("Full error object:", error);
        throw error;
    }
};


// Export only necessary functions
export {
    createLeasingFactoryInstance,
    createLeasingContract,
    createLeasingRequest,
    getActiveLeasingContracts,
    fundLeasingContract,
};
