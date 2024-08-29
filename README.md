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
