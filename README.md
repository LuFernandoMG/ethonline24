# Invernez - ETHOnline 2024

Invernez is a crowdleasing platform where users lease assets via collective financing. Users can lease an asset with the option to return it or buy it at the end of the term. Investors, as asset owners, earn rental income through tokenized contracts.

## Project Structure

- **Frontend**: Located in the `frontend/` folder, this contains all the user interface code for interacting with the Invernez platform.
- **Smart Contracts**: Located in the `contracts/` folder, this contains the Solidity smart contracts that power the leasing and tokenization functionalities.

## Project Setup

### Requirements

- Node.js and npm
- Rust and Cargo
- Foundry

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/LuFernandoMG/ethonline24.git
    ```

2. Navigate to the contracts folder:

    ```bash
    cd ethonline24/contracts
    ```

3. Follow the instructions in the README.md inside the contracts folder for further setup.

### How It Works

Invernez aims to provide a decentralized platform for leasing assets. Here’s a brief overview of the process:

1. **Lease Application**: Users can apply to lease an asset by submitting a leasing request.
2. **Collective Financing**: Investors can collectively finance these leasing requests by purchasing tokens, which represent shares in the leasing contracts.
3. **Tokenized Income**: Investors earn rental income from their investments through these tokens, which can be traded or held for returns.
4. **Security Measures**: The platform includes safeguards such as reentrancy protection with a cooldown period to ensure that all interactions are secure and protected from typical smart contract vulnerabilities.
5. **End of Term Options**: At the end of the lease term, the lessee has the option to return the asset or purchase it at a pre-agreed price.


### Current Progress

1. **Smart Contracts:**
   - Implemented the basic `CrowdLeasingContract` which allows users to create leasing requests and manage them through different states like `Pending`, `Active`, `Funded`, `Expired`, etc.
    - Enhanced `CrowdLeasingContract` with additional security measures, including cooldown-based reentrancy protection for the `investInLeasing` function.
    - Comprehensive test coverage to ensure the robustness and security of the smart contract, including reentrancy protection and edge cases for investment.
    - Implemented `mintTokens` and `distributeTokens` functions to handle the minting and distribution of ERC20 tokens when a leasing request is fully funded.
   - Integrated OpenZeppelin libraries for ERC20, ReentrancyGuard, and Ownable for security and standard compliance.
   - Added a new mapping (`investorsByLeaseId`) to improve the efficiency of token distribution by tracking unique investors for each leasing request.
    - Refined the investment and token distribution process to ensure accurate tracking and distribution, especially for investors who make multiple investments.
   - Implemented `CrowdLeasingFactory` to dynamically deploy new instances of `CrowdLeasingContract` for different users. This factory contract ensures that each user can create a leasing contract with unique parameters, including the token name and symbol.
   - Developed comprehensive tests for `CrowdLeasingFactory` to verify the correct deployment of new contracts and proper initialization with user-provided parameters.
   - Integrated factory contract deployment script (`FactoryDeploy.s.sol`) to automate the deployment process.

    - **Factory Deployment:**
        - Successfully deployed the `CrowdLeasingFactory` contract on the Rootstock testnet.
        - This factory contract allows the creation of multiple `CrowdLeasingContract` instances dynamically, facilitating decentralized leasing operations on the platform.
        - Tested the deployment on the testnet, confirming contract creation and interaction functionalities.

   2. **Frontend Integration:**
   - Integrated Web3Auth for user authentication, allowing users to log in with their social accounts or email.
   - Configured Web3Auth to connect with the Rootstock Testnet, enabling secure interactions with the blockchain.
   - Developed functionalities to fetch user info, account details, balances, sign messages, and send transactions using Web3.js.



### Contract Deployment and Interaction

To deploy and interact with the smart contracts, follow these steps:

1. **Setup Environment Variables:**
   - You will need to set up your environment variables for contract deployment and interaction. Create a file named `.env.local` in the `contracts` directory with the following structure:
     ```
     PRIVATE_KEY=your_private_key
     ROOTSTOCK_RPC_URL=your_rpc_url
     FACTORY_CONTRACT_ADDRESS=your_factory_contract_address
     ```
   - Replace `your_private_key` with your Ethereum private key, `your_rpc_url` with your Rootstock RPC URL, and `your_factory_contract_address` with the deployed factory contract address.

2. **Deploying Contracts:**
   - Navigate to the `contracts` directory:
     ```bash
     cd ethonline24/contracts
     ```
   - Run the deployment script using Foundry:
     ```bash
     forge script script/FactoryDeploy.s.sol --rpc-url $ROOTSTOCK_RPC_URL --private-key $PRIVATE_KEY --broadcast
     ```

3. **Interacting with Contracts:**
   - The ABI for the `CrowdLeasingFactory` contract is located in `frontend/abi/CrowdLeasingFactory.json`. Ensure this file is updated after any changes to the contract.
   - Use the `contract.js` file in the `frontend/src` directory to set up and manage interactions with the contract using Web3 or Ethers.js.


### To Do

Here are the functionalities that are planned to be added to the Invernez platform in the future:

1. **Withdrawals by the Owner**: Implement functions to allow the owner (Invernez) to withdraw funds. This is crucial for purchasing assets on behalf of lessees.
   
2. **Leasing Payment Function**: Develop a function to handle regular leasing payments from users. This will facilitate the ongoing lease agreements and revenue collection.
   
3. **Asset Liquidation**: Add functionality to handle asset liquidation in case the leasing payments are not met. This is important to protect investor funds.
   
4. **Contract Renewal**: Provide an option for lessees to renew their lease at the end of the term, allowing for flexibility and extended asset use.

5. **Refund Functionality for Unmet Funding Goals**: Implement a feature in the `CrowdLeasingContract` to automatically refund investors if the funding goal is not met within the specified period. This ensures that investor funds are protected in case a leasing request fails to attract enough investment.

6. **Frontend Integration for Factory Contract**: Develop a user interface to interact with the deployed factory contract. This includes creating leasing requests and viewing existing ones on the platform.

7. **Verification of Deployed Contracts**: Verify the deployed contracts on Rootstock to ensure transparency and ease of access for developers and users.





2. **Frontend:**
   - Initial setup is complete. Further development will focus on integrating the frontend with the deployed contracts.

### Contribution

We welcome contributions! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

### License

This project is licensed under the MIT License - see the LICENSE file for details.
