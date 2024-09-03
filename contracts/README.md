# Invernez Smart Contracts

This directory contains the smart contracts for the Invernez platform, built using Foundry.

## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

For comprehensive Foundry documentation, visit [Foundry Book](https://book.getfoundry.sh/).

## Installation

Ensure you have Rust, Cargo, and Foundry installed. To install Foundry, follow these steps:

```bash
foundryup
forge install
```
## CrowdLeasingContract

The `CrowdLeasingContract` is a smart contract designed for the Invernez platform, enabling users to create leasing requests that can be collectively funded by investors. The contract is optimized for gas efficiency and security, and it includes functionality to manage different states of leasing requests.

### Functions

#### createLeasingRequest

**Description:** Allows a user to initiate a leasing request on the platform.

**Parameters:**
- `_amount` (uint256): The amount of funding needed for the lease. Must be greater than zero.
- `_duration` (uint256): The duration of the lease in days. Must be greater than zero.
- `_fundingPeriod` (uint256): The period in seconds within which the lease must be fully funded. Must be greater than zero.

**Logic:**
- Increments the `leaseIdCounter` to assign a unique ID to the new leasing request.
- Calculates the `fundingDeadline` based on the current block timestamp and the `_fundingPeriod`.
- Initializes a new leasing request with state set to `Active`.

**Security:**
- Ensures that the function parameters `_amount`, `_duration`, and `_fundingPeriod` are greater than zero to prevent invalid leasing requests.
- The function is designed to be extensible for future access control measures.

**Events:**
- `LeasingRequestCreated`: Emitted when a new leasing request is created, capturing the `leaseId`, `requester`, `amount`, `duration`, and `fundingDeadline`.

#### investInLeasing

**Description:** Allows users to invest in an active leasing request by sending Ether. This function calculates the number of tokens the investor should receive based on the amount of Ether invested and the token price.

**Parameters:**
- `_leaseId` (uint256): The ID of the leasing request to invest in.

**Logic:**
- Validates that the leasing request is active and not expired.
- Ensures that the investment amount does not exceed the required amount to fully fund the leasing request.
- Calculates and stores the number of tokens for the investor based on the Ether invested.
- Updates the state of the leasing request if fully funded.

**Security:**
- Implements a cooldown-based reentrancy guard (`nonReentrantWithCooldown`) to prevent reentrancy attacks.
- The cooldown period between interactions is currently set to 10 seconds.

**Events:**
- `LeasingRequestFunded`: Emitted when a leasing request receives funding, capturing details like the leaseId, funder, amount, fundedAmount, and numTokens.


### Mint and Distribute Tokens

**mintTokens**: This function is called when a leasing request is fully funded. It mints ERC20 tokens equivalent to the amount funded for each investor. 

**distributeTokens**: After minting, this function distributes the tokens to the investors based on their investment.

**Security Considerations**: 
- Uses OpenZeppelin's `ReentrancyGuard` to prevent reentrancy attacks.

**Events:**
- `TokensMinted`: Emitted when tokens are minted successfully.


### Usage

To deploy and interact with the `CrowdLeasingContract`, follow these steps:

1. Compile the contract:

### Build

```shell
$ forge build
```

## Testing

We have implemented a suite of tests for the `CrowdLeasingContract` to ensure its functionality and security.

### Available Tests

1. **testValidCreateLeasingRequest**: Ensures a leasing request is created correctly with valid parameters.
2. **testInvalidAmount**: Verifies that creating a leasing request with an amount of 0 fails.
3. **testInvalidDuration**: Checks that creating a leasing request with a duration of 0 days fails.
4. **testInvalidFundingPeriod**: Ensures that creating a leasing request with a funding period of 0 fails.
5. **testSingleRequestPerUser**: Confirms that a user cannot create more than one leasing request.
6. **testExcessiveRequests**: Simulates the creation of multiple leasing requests to test the contract's ability to handle large numbers of requests.
7. **testDosAttackSimulation**: Tests the contract's resistance to a denial-of-service attack by simulating a large number of requests from different users.
8. **testInvestInLeasing**: Ensures that the `investInLeasing` function works correctly, respects the cooldown period, and updates the leasing request state.
9. **testInvestmentBelowMinimum**: Verifies that investing less than the token price results in a failure.
10. **testInvestmentExceedsRemaining**: Ensures that an investment exceeding the remaining funding amount fails.
11. **testReentrancyProtection**: Tests the reentrancy protection mechanism to confirm it prevents reentrant calls effectively.
12. **testReentrancyExplicitCheck**: Performs an explicit check to ensure the contract is safeguarded against reentrancy attacks.


### Testing the New Features

The recent updates to the smart contract include tests to ensure that the new mapping and token distribution logic function correctly:

- **testDistributeTokensInBatches**: Verifies that tokens are distributed correctly in batches, considering multiple investors and multiple investments.
- **Test Investors with Multiple Investments**: Ensures that investors who invest multiple times receive the correct total amount of tokens.

**Important Note**:
- Some tests related to internal functions may be commented out or removed after confirming functionality to prevent access to these functions from outside the contract.



### Running Tests

To run the tests, ensure you have Foundry installed and set up correctly. Then, execute the following command:

```shell
forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
### Smart Contracts Overview
The smart contracts in this repository handle the core functionalities of the Invernez platform:

    **CrowdLeasingContract (CLC)**: The main contract that manages the creation of leasing requests, tokenization of assets, and the distribution of rental income.

    - **CrowdLeasingFactory**: A factory contract designed to deploy new instances of `CrowdLeasingContract` based on user input. This allows for dynamic creation of leasing contracts with unique parameters such as token name and symbol, enhancing scalability and flexibility of the platform.



### To Do

The following features are planned for future updates to enhance the functionality and security of the smart contracts:

1. **Withdrawals by the Owner**: Functions will be added to allow the contract owner to withdraw funds safely and securely, adhering to best practices.
   
2. **Leasing Payment Functionality**: A system for regular leasing payments will be implemented, ensuring smooth operation and proper accounting for lease payments.
   
3. **Asset Liquidation Process**: This will enable the platform to manage and liquidate assets if leasing payments are defaulted, protecting the investments of users.
   
4. **Lease Renewal Options**: Functions to support lease renewal, providing more options for users who wish to continue using the leased assets.

5. **Investor Refund Functionality**: Plan to add a feature to the `CrowdLeasingContract` to automatically refund investors if the funding goal is not reached by the end of the funding period. This is crucial for protecting investor interests and ensuring funds are returned promptly in case of unsuccessful funding.



## Deployment
To deploy the smart contracts, make sure you have configured your .env file with the appropriate variables (refer to .env.example), and run the deployment script using Forge.

## Testing
Make sure to write unit tests for each function you implement to ensure contract functionality and security.

## License
This project is licensed under the MIT License - see the LICENSE file for details.