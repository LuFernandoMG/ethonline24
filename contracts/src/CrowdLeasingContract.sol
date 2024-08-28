// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; // Import the ReentrancyGuard for protection against reentrancy attacks

import "forge-std/Test.sol"; // ELIMINAR AL TERMINAR TEST

/// @title CrowdLeasingContract
/// @notice This contract allows users to create and fund leasing requests collectively.
/// @dev Implements security practices and optimized gas usage with OpenZeppelin libraries.
contract CrowdLeasingContract is ReentrancyGuard {
    // Counter to track the total number of leasing requests
    uint256 public leaseIdCounter;

    // Structure to store details of each leasing request
    struct LeasingRequest {
        uint256 leaseId;            // Unique ID for the leasing request
        address requester;          // Address of the user who created the request
        uint256 amount;             // Total amount of funding requested
        uint256 fundedAmount;       // Amount funded so far
        uint256 tokenPrice;         // Price per token for this leasing request
        uint256 duration;           // Duration of the lease in days
        uint256 fundingDeadline;    // Timestamp until which the leasing request can be funded
        bool fulfilled;             // Status indicating whether the request has been fulfilled
        State status;               // Current status of the leasing request
    }

    // Enum to represent the possible states of a leasing request
    enum State { Pending, Active, Funded, Expired, Cancelled, Complete }

    // Mapping to store leasing requests by their unique ID
    mapping(uint256 => LeasingRequest) public leasingRequests;

    // Mapping to track whether a user currently has an active leasing request
    mapping(address => bool) public hasActiveLeasingRequest;

    // Event emitted when a new leasing request is created
    event LeasingRequestCreated(uint256 leaseId, address indexed requester, uint256 amount, uint256 duration, uint256 fundingDeadline, uint256 tokenPrice);

    // Event emitted when a leasing request is funded
    event LeasingRequestFunded(uint256 leaseId, address indexed funder, uint256 amount, uint256 fundedAmount, uint256 numTokens);

    /**
     * @dev Constructor that initializes the leaseIdCounter to 0
     */
    constructor() {
        leaseIdCounter = 0; // Initialize the lease ID counter
    }

    /**
     * @dev Creates a new leasing request with the specified amount, duration, funding period, and token price.
     * @param _amount The total amount of funding needed for the lease. Must be greater than zero.
     * @param _duration The duration of the lease in days. Must be greater than zero.
     * @param _fundingPeriod The period within which the lease must be fully funded.
     * @param _tokenPrice The price per token for the leasing request. Must be greater than zero.
     */
    function createLeasingRequest(uint256 _amount, uint256 _duration, uint256 _fundingPeriod, uint256 _tokenPrice) external {
        // Ensure that a user can only have one active leasing request at a time
        require(!hasActiveLeasingRequest[msg.sender], "User already has a leasing request");
        // Ensure that the amount requested is greater than zero
        require(_amount > 0, "Amount must be greater than zero");
        // Ensure that the duration of the lease is greater than zero
        require(_duration > 0, "Duration must be greater than zero");
        // Ensure that the funding period is greater than zero
        require(_fundingPeriod > 0, "Funding period must be greater than zero");
        // Ensure that the token price is greater than zero
        require(_tokenPrice > 0, "Token price must be greater than zero");

        // Increment the lease ID counter and assign it to a new leasing request
        uint256 newLeaseId = ++leaseIdCounter;

        // Calculate the funding deadline based on the provided funding period
        uint256 fundingDeadline = block.timestamp + _fundingPeriod;

        // Store the new leasing request in the mapping
        leasingRequests[newLeaseId] = LeasingRequest({
            leaseId: newLeaseId,
            requester: msg.sender,
            amount: _amount,
            fundedAmount: 0,  // Initially funded amount is 0
            tokenPrice: _tokenPrice,
            duration: _duration,
            fundingDeadline: fundingDeadline,
            fulfilled: false,
            status: State.Active // Initial state is set to Active
        });

        // Set the user's active leasing request to true
        hasActiveLeasingRequest[msg.sender] = true;

        // Emit an event to notify that a new leasing request has been created
        emit LeasingRequestCreated(newLeaseId, msg.sender, _amount, _duration, fundingDeadline, _tokenPrice);
    }

    /**
     * @dev Returns the remaining amount needed to fully fund a leasing request.
     * @param _leaseId The ID of the leasing request.
     * @return The remaining amount needed.
     */
    function getRemainingAmount(uint256 _leaseId) public view returns (uint256) {
        // Retrieve the leasing request from storage
        LeasingRequest storage request = leasingRequests[_leaseId];
        // Ensure the leasing request is in an active state
        require(request.status == State.Active, "Leasing request is not active");
        // Calculate and return the remaining amount needed
        return request.amount - request.fundedAmount;
    }

    /**
     * @dev Allows users to invest in an active leasing request by sending Ether.
     * @param _leaseId The ID of the leasing request to invest in.
     */
    function investInLeasing(uint256 _leaseId) external payable nonReentrant {
        // Log to indicate the entry into the function with the given leaseId
        console.log("Entering investInLeasing with leaseId:", _leaseId);

        // Retrieve the leasing request from storage using the leaseId
        LeasingRequest storage request = leasingRequests[_leaseId];

        // Log the lease ID, current status, and funded amount before investment
        console.log("Lease ID:", _leaseId);
        console.log("Current status:", uint(request.status));
        console.log("Funded amount before investment:", request.fundedAmount);

        // Ensure the leasing request is active; if not, revert the transaction
        require(request.status == State.Active, "Leasing request is not active");
        console.log("Verified: Leasing request is active");

        // Ensure the funding deadline has not passed; if it has, revert the transaction
        require(block.timestamp <= request.fundingDeadline, "Funding deadline has passed");
        console.log("Verified: Funding deadline has not passed");

        // Calculate the number of tokens that can be purchased with the sent Ether
        uint256 numTokens = msg.value / request.tokenPrice;

        // Log the investment amount and the number of tokens calculated
        console.log("Investment amount:", msg.value);
        console.log("Number of tokens:", numTokens);

        // Ensure the investor is sending enough Ether to buy at least one token
        require(numTokens > 0, "Investment does not meet the minimum token price");

        // Calculate the remaining amount needed to fully fund the leasing request
        uint256 remainingAmount = getRemainingAmount(_leaseId);

        // Log the remaining amount after calculations
        console.log("Remaining amount after calculations:", remainingAmount);

        // Ensure the investment does not exceed the remaining amount; if it does, revert the transaction
        require(msg.value <= remainingAmount, "Investment exceeds the remaining funding amount");

        // Update the funded amount with the value sent in the transaction
        request.fundedAmount += msg.value;

        // Log the updated funded amount after the investment
        console.log("Funded amount after investment:", request.fundedAmount);

        // Check if the leasing request is fully funded
        if (request.fundedAmount == request.amount) {
            // Update the status to Funded and mark it as fulfilled
            request.status = State.Funded;
            request.fulfilled = true;
            console.log("Request is fully funded and marked as fulfilled.");
        }

        // Log before emitting the event to indicate a successful funding
        console.log("Emitting LeasingRequestFunded event");

        // Emit an event to log the funding details
        emit LeasingRequestFunded(_leaseId, msg.sender, msg.value, request.fundedAmount, numTokens);
    }


    // Additional functions can be added here as needed to manage leasing requests
}
