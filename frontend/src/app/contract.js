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



// Export only necessary functions
export {
    createLeasingFactoryInstance,
    createLeasingContract,
    createLeasingRequest
};
