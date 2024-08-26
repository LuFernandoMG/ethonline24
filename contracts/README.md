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

## Usage

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