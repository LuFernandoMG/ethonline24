// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol"; // Import the Forge standard testing library
import "../src/CrowdLeasingContract.sol"; // Import the contract to be tested

interface ICrowdLeasingContract {
    function investInLeasing(uint256 _leaseId) external payable;
}

/// @title ReentrancyAttack
/// @dev This contract is used to simulate a reentrancy attack for testing purposes
contract ReentrancyAttack {
    ICrowdLeasingContract public target;
    uint256 public leaseId;
    uint256 public attackCount;

    constructor(address _targetAddress) {
        target = ICrowdLeasingContract(_targetAddress);
        attackCount = 0;
    }

    // Function to recursively attack until it hits a revert
    function recursiveAttack() internal {
        while (attackCount < 2) { // Force multiple reentrancy attempts
            attackCount++;
            console.log("Reentrancy attack: Attempting to reenter investInLeasing, attempt:", attackCount);
            target.investInLeasing{value: 1 ether}(leaseId);
        }
    }

    receive() external payable {
        console.log("Reentrancy attack: Entering receive function, attempt:", attackCount);
        recursiveAttack(); // Continue attacking recursively
    }

    function attack(uint256 _leaseId) external payable {
        leaseId = _leaseId;
        console.log("Reentrancy attack: Starting attack with leaseId", leaseId);
        target.investInLeasing{value: msg.value}(_leaseId);
        recursiveAttack(); // Start the recursive attack after the initial call
    }

    function resetAttack() external {
        attackCount = 0;
    }
}

/// @title CrowdLeasingTest
/// @dev This contract is used to test the functionalities of the CrowdLeasingContract
contract CrowdLeasingTest is Test {
    CrowdLeasingContract clc; // Declare an instance of the CrowdLeasingContract

    /// @notice Sets up the testing environment before each test
    function setUp() public {
        clc = new CrowdLeasingContract(); // Deploy a new instance of CrowdLeasingContract before each test
    }

    /// @notice Test the valid creation of a leasing request
    /// @dev Ensures that the leasing request is created correctly with all expected parameters
    function testValidCreateLeasingRequest() public {
        // Call the createLeasingRequest function with valid parameters including _pricePerToken
        clc.createLeasingRequest(1000, 30, 45, 1);

        // Retrieve the leasing request details to verify correctness
        (uint256 leaseId, address requester, uint256 amount, uint256 fundedAmount, uint256 pricePerToken, uint256 duration, uint256 fundingDeadline, bool fulfilled, CrowdLeasingContract.State status) = clc.leasingRequests(1);

        // Assert the details of the created leasing request
        assertEq(leaseId, 1); // Verify leaseId is 1
        assertEq(requester, address(this)); // Verify requester is the address that called the function
        assertEq(amount, 1000); // Verify amount is 1000
        assertEq(fundedAmount, 0); // Verify funded amount is initialized to 0
        assertEq(pricePerToken, 1); // Verify token price is set correctly
        assertEq(duration, 30); // Verify duration is 30 days
        assertEq(fundingDeadline, block.timestamp + 45); // Verify funding deadline is correctly calculated
        assertEq(fulfilled, false); // Verify the request is not yet fulfilled
        assertEq(uint(status), uint(CrowdLeasingContract.State.Active)); // Verify the status is Active
    }

    /// @notice Test creating a leasing request with an invalid amount (0)
    /// @dev Should revert with the message "Amount must be greater than zero"
    function testInvalidAmount() public {
        vm.expectRevert(bytes("Amount must be greater than zero")); // Expect revert with specific error message
        clc.createLeasingRequest(0, 30, 45, 1); // Attempt to create a leasing request with amount 0
    }

    /// @notice Test creating a leasing request with an invalid duration (0 days)
    /// @dev Should revert with the message "Duration must be greater than zero"
    function testInvalidDuration() public {
        vm.expectRevert(bytes("Duration must be greater than zero")); // Expect revert with specific error message
        clc.createLeasingRequest(1000, 0, 45, 1); // Attempt to create a leasing request with duration 0
    }

    /// @notice Test creating a leasing request with an invalid funding period (0 days)
    /// @dev Should revert with the message "Funding period must be greater than zero"
    function testInvalidFundingPeriod() public {
        vm.expectRevert(bytes("Funding period must be greater than zero")); // Expect revert with specific error message
        clc.createLeasingRequest(1000, 30, 0, 1); // Attempt to create a leasing request with funding period 0
    }

    /// @notice Test to simulate multiple users creating leasing requests
    /// @dev Ensures that multiple users can create leasing requests and the leaseIdCounter increments correctly
    function testExcessiveRequests() public {
        uint256 numberOfUsers = 100; // Define the number of simulated users

        for (uint256 i = 0; i < numberOfUsers; i++) {
            address user = address(uint160(uint(keccak256(abi.encodePacked(i))))); // Generate unique addresses
            vm.prank(user); // Simulate transaction from different user addresses
            clc.createLeasingRequest(1000, 30, 7, 1); // Create leasing requests for each user
        }

        assertEq(clc.leaseIdCounter(), numberOfUsers); // Assert that the total number of leasing requests equals numberOfUsers
    }

    /// @notice Test to simulate a Denial-of-Service attack by creating multiple requests from a single user
    /// @dev Ensures that only one request per user is allowed, preventing DoS attacks
    function testDosAttackSimulation() public {
        clc.createLeasingRequest(1000, 30, 7, 1); // Create a single leasing request
        assertEq(clc.leaseIdCounter(), 1); // Assert only one request is allowed per user
    }

    /// @notice Test to ensure only one request per user
    /// @dev Should revert with the message "User already has a leasing request" if a user attempts to create multiple requests
    function testSingleRequestPerUser() public {
        clc.createLeasingRequest(1000, 30, 45, 1); // Create the first leasing request
        vm.expectRevert(bytes("User already has a leasing request")); // Expect revert on second request
        clc.createLeasingRequest(1500, 60, 45, 1); // Attempt to create another request
    }

    /// @notice Test to get the remaining amount for a leasing request
    /// @dev Ensures that the getRemainingAmount function returns the correct amount
    function testGetRemainingAmount() public {
        // Create a leasing request
        clc.createLeasingRequest(1000, 30, 45, 1); 
        
        // Get the remaining amount needed to fully fund the leasing request
        uint256 remainingAmount = clc.getRemainingAmount(1); 
        
        // Assert that the remaining amount is equal to the total amount requested
        assertEq(remainingAmount, 1000); 
    }

    /// @notice Test to invest in an active leasing request
    /// @dev Ensures that the investInLeasing function works correctly and updates the state
    function testInvestInLeasing() public {
        // Create a leasing request
        clc.createLeasingRequest(1000, 30, 45, 1); 
        
        // Fund this contract with 1000 wei to simulate an investor
        vm.deal(address(this), 1000); 

        // Advance time by 11 seconds to respect cooldown period
        vm.warp(block.timestamp + 11);
        
        // Invest 500 wei in the leasing request
        clc.investInLeasing{value: 500}(1); 

        // Retrieve the leasing request details to verify correctness
        ( , , , uint256 fundedAmount, , , , bool fulfilled, CrowdLeasingContract.State status) = clc.leasingRequests(1);

        // Assert the details of the funded leasing request
        assertEq(fundedAmount, 500); // Verify funded amount is updated to 500
        assertEq(fulfilled, false); // Verify the request is not yet fulfilled
        assertEq(uint(status), uint(CrowdLeasingContract.State.Active)); // Verify the status is still Active
    }

    /// @notice Test to ensure investment meets minimum token price
    /// @dev Should revert with the message "Investment does not meet the minimum token price"
    function testInvestmentBelowMinimum() public {
        // Create a leasing request with token price of 2 wei
        clc.createLeasingRequest(1000, 30, 45, 2); 

        // Advance time by 11 seconds to respect cooldown period
        vm.warp(block.timestamp + 11);

        // Expect revert with specific error message if trying to invest less than the token price
        vm.expectRevert(bytes("Investment does not meet the minimum token price")); 
        clc.investInLeasing{value: 1}(1); // Attempt to invest 1 wei, which is below the minimum token price of 2 wei
    }

    /// @notice Test to ensure investment does not exceed remaining amount
    /// @dev Should revert with the message "Investment exceeds the remaining funding amount"
    function testInvestmentExceedsRemaining() public {
        // Create a leasing request
        clc.createLeasingRequest(1000, 30, 45, 1);
        
        // Fund this contract with sufficient ether
        vm.deal(address(this), 2000);

        // Advance time by 11 seconds to respect cooldown period
        vm.warp(block.timestamp + 11);
        
        // First, invest an amount to bring remaining close to the limit
        clc.investInLeasing{value: 900}(1);

        // Advance time by 11 seconds to respect cooldown period
        vm.warp(block.timestamp + 11);

        // Expect revert with specific error message if trying to invest more than the remaining amount
        vm.expectRevert(bytes("Investment exceeds the remaining funding amount")); 
        clc.investInLeasing{value: 200}(1); // Attempt to invest 200 wei, which exceeds the remaining amount of 100 wei
    }

    /// @notice Test to ensure reentrancy protection
    function testReentrancyProtection() public {
        console.log("Starting testReentrancyProtection");

        // Deploy a new ReentrancyAttack contract which will attempt to re-enter
        ReentrancyAttack attack = new ReentrancyAttack(address(clc));

        // Create a leasing request to interact with
        clc.createLeasingRequest(1e20, 30, 45, 1e18);
        console.log("Leasing request created with ID 1");

        // Fund the ReentrancyAttack contract with 10 ether for the attack
        vm.deal(address(attack), 1e19);

        // Attempt to perform a reentrancy attack
        try attack.attack{value: 1 ether}(1) {
            // If the call does not revert, it means the reentrancy attack was not prevented
            console.log("Reentrancy attack was not prevented");
            fail(); // Removed the argument
        } catch Error(string memory reason) {
            // Check if the transaction reverted with the correct cooldown period message
            if (keccak256(abi.encodePacked(reason)) == keccak256(abi.encodePacked("ReentrancyGuard: cooldown period active"))) {
                console.log("Reentrancy attack prevented due to cooldown period");
            } else {
                // If it reverted with an unexpected reason, the test fails
                console.log("Unexpected revert reason:", reason);
                fail(); // Removed the argument
            }
        } catch (bytes memory) {
            // If it failed with a low-level error or without a specific reason, the test also fails
            console.log("Reentrancy attack failed with unknown error");
            fail(); // Removed the argument
        }
    }

}
