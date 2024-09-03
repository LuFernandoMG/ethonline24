// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/CrowdLeasingFactory.sol";
import "../src/CrowdLeasingContract.sol";

contract CrowdLeasingFactoryTest is Test {
    CrowdLeasingFactory factory;
    address owner;

    function setUp() public {
        owner = address(this);
        factory = new CrowdLeasingFactory();
        factory.transferOwnership(owner);
    }

    function testCreateCrowdLeasingContract() public {
        // Create a new leasing contract
        factory.createCrowdLeasingContract("Test Token", "TTK");

        // Verify that the new contract was created and is owned by the factory owner
        address[] memory contracts = factory.getContractsByUser(owner);
        assertEq(contracts.length, 1);
        CrowdLeasingContract leasingContract = CrowdLeasingContract(contracts[0]);
        assertEq(leasingContract.owner(), owner);
    }

    // Add more tests as needed...
}
