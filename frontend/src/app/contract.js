import Web3 from 'web3';
import contractABI from './abi/CrowdLeasingFactory.json';

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_ROOTSTOCK_RPC_URL));
const contractAddress = process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS;
const contractInstance = new web3.eth.Contract(contractABI, contractAddress);

export default contractInstance;
