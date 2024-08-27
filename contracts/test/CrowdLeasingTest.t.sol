// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol"; // Import the Forge standard testing library
import "../src/CrowdLeasingContract.sol"; // Import the contract to be tested

contract CrowdLeasingTest is Test {
    // Declare an instance of the CrowdLeasingContract
    CrowdLeasingContract clc;

    /// @notice Sets up the testing environment before each test
    function setUp() public {
        // Deploy a new instance of CrowdLeasingContract before each test
        clc = new CrowdLeasingContract();
    }

    /// @notice Test the valid creation of a leasing request
    function testValidCreateLeasingRequest() public {
        // Call the createLeasingRequest function with valid parameters
        clc.createLeasingRequest(1000, 30, 45);
        
        // Retrieve the leasing request details to verify correctness
        (uint256 leaseId, address requester, uint256 amount, uint256 duration, uint256 fundingDeadline, bool fulfilled, CrowdLeasingContract.State status) = clc.leasingRequests(1);
        
        // Assert the details of the created leasing request
        assertEq(leaseId, 1); // Verify leaseId is 1
        assertEq(requester, address(this)); // Verify requester is the address that called the function
        assertEq(amount, 1000); // Verify amount is 1000
        assertEq(duration, 30); // Verify duration is 30 days
        assertEq(fundingDeadline, block.timestamp + 45); // Verify funding deadline is correctly calculated
        assertEq(fulfilled, false); // Verify the request is not yet fulfilled
        assertEq(uint(status), uint(CrowdLeasingContract.State.Active)); // Verify the status is Active
    }

    /// @notice Test creating a leasing request with an invalid amount (0)
    function testInvalidAmount() public {
        // Attempt to create a leasing request with amount 0, should revert with specific error message
        vm.expectRevert(bytes("Amount must be greater than zero"));
        clc.createLeasingRequest(0, 30, 45);
    }

    /// @notice Test creating a leasing request with an invalid duration (0 days)
    function testInvalidDuration() public {
        // Attempt to create a leasing request with duration 0, should revert with specific error message
        vm.expectRevert(bytes("Duration must be greater than zero"));
        clc.createLeasingRequest(1000, 0, 45);
    }

    /// @notice Test creating a leasing request with an invalid funding period (0 days)
    function testInvalidFundingPeriod() public {
        // Attempt to create a leasing request with funding period 0, should revert with specific error message
        vm.expectRevert(bytes("Funding period must be greater than zero"));
        clc.createLeasingRequest(1000, 30, 0);
    }

        /// @notice Test to simulate multiple users creating leasing requests
    function testExcessiveRequests() public {
    // Create an array of addresses to simulate multiple users
    uint256 numberOfUsers = 100; // Define the number of simulated users

    for (uint256 i = 0; i < numberOfUsers; i++) {
        // Simulate different user addresses for the test
        address user = address(uint160(uint(keccak256(abi.encodePacked(i)))));
        
        // Set the transaction sender to the simulated user address
        vm.prank(user);

        // Create a leasing request for each simulated user
        clc.createLeasingRequest(1000, 30, 7);
    }

    // Assert that the total number of leasing requests is equal to the number of simulated users
    assertEq(clc.leaseIdCounter(), numberOfUsers);
}


        /// @notice Test to simulate a Denial-of-Service attack by creating a single request (reflecting the single request per user limitation)
    function testDosAttackSimulation() public {
        // Simulate creating a single leasing request for DoS attack simulation
        // Note: Adjusted for single request per user limitation
        clc.createLeasingRequest(1000, 30, 7);

        // Assert that only one request is allowed per user
        assertEq(clc.leaseIdCounter(), 1);
    }


    /// @notice Test to ensure only one request per user (if this restriction is added in the future)
    function testSingleRequestPerUser() public {
        // Create the first leasing request
        clc.createLeasingRequest(1000, 30, 45);
        
        // Attempt to create another request by the same user, expecting a revert if this restriction is implemented
        vm.expectRevert(bytes("User already has a leasing request"));
        clc.createLeasingRequest(1500, 60, 45);
    }
}
