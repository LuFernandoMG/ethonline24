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

### Usage

To deploy and interact with the `CrowdLeasingContract`, follow these steps:

1. Compile the contract:

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
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

## Deployment
To deploy the smart contracts, make sure you have configured your .env file with the appropriate variables (refer to .env.example), and run the deployment script using Forge.

## Testing
Make sure to write unit tests for each function you implement to ensure contract functionality and security.

## License
This project is licensed under the MIT License - see the LICENSE file for details.