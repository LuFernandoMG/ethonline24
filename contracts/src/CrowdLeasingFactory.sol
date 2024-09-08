// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CrowdLeasingContract.sol";
import "openzeppelin/access/Ownable.sol"; // Access control mechanism for factory
import "openzeppelin/security/ReentrancyGuard.sol"; // Prevent reentrancy attacks

/// @title CrowdLeasingFactory
/// @notice This contract allows users to create new instances of CrowdLeasingContract.
contract CrowdLeasingFactory is Ownable, ReentrancyGuard {
    // Mapping to track all leasing contracts created by users
    mapping(address => address[]) public userContracts;

    // Array to store all leasing contracts created
    address[] public allContracts;

    // Counter to track the number of contracts created
    uint256 public contractCount;

    // Event emitted when a new leasing contract is created
    event NewLeasingContract(address indexed user, address contractAddress);

    /**
     * @dev Creates a new instance of CrowdLeasingContract and sets its owner.
     * @param _tokenName The name of the ERC20 token for this leasing instance.
     * @param _tokenSymbol The symbol of the ERC20 token for this leasing instance.
     */
    function createCrowdLeasingContract(string memory _tokenName, string memory _tokenSymbol) external nonReentrant {
        // Deploy a new instance of CrowdLeasingContract
        CrowdLeasingContract newContract = new CrowdLeasingContract(_tokenName, _tokenSymbol);

        // Set the owner of the new contract to the owner of this factory 
        newContract.setOwner(owner());

        // Store the address of the new contract in the user's contract mapping
        userContracts[msg.sender].push(address(newContract));

        // Add the contract address to the array of all contracts
        allContracts.push(address(newContract));

        // Increment the contract count
        contractCount++;

        // Emit an event for the new contract creation
        emit NewLeasingContract(msg.sender, address(newContract));
    }

    /**
     * @dev Returns the list of leasing contracts deployed by a specific user.
     * @param user The address of the user.
     * @return An array of addresses of leasing contracts.
     */
    function getContractsByUser(address user) external view returns (address[] memory) {
        return userContracts[user];
    }

    /**
     * @dev Returns the address of a leasing contract by its index in the global list.
     * @param index The index of the contract.
     * @return The address of the leasing contract.
     */
    function getContractByIndex(uint256 index) external view returns (address) {
        require(index < contractCount, "Invalid index");
        return allContracts[index];
    }

    /**
     * @dev Returns the total number of leasing contracts created by the factory.
     * @return The total number of contracts.
     */
    function getTotalContracts() external view returns (uint256) {
        return contractCount;
    }
}
