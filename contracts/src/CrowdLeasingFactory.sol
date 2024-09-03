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

        // Set the owner of the new contract to the owner of this factory (Invernez)
        newContract.setOwner(owner());

        // Store the address of the new contract in the mapping
        userContracts[msg.sender].push(address(newContract));

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
}
