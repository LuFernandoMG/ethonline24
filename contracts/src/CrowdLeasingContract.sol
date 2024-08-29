// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "openzeppelin/security/ReentrancyGuard.sol"; // Import the ReentrancyGuard for protection against reentrancy attacks

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

    // Mapping to store the number of tokens for each investor per leaseId
    mapping(uint256 => mapping(address => uint256)) public investorTokens; 

    // Mapping to track if an account is temporarily locked
    mapping(address => bool) private lockedAccounts;

    // Mapping to track
    mapping(address => uint256) private lastInteraction;


    // Define the cooldown period in seconds (e.g., 30 seconds)
    uint256 private constant COOLDOWN_PERIOD = 10;

    // Modifier to prevent reentrancy with a cooldown period
    modifier nonReentrantWithCooldown() {
        require(!lockedAccounts[msg.sender], "ReentrancyGuard: reentrant call");
        
        // Check the last interaction timestamp
        require(block.timestamp >= lastInteraction[msg.sender] + COOLDOWN_PERIOD, "ReentrancyGuard: cooldown period active");

        // Lock the account
        lockedAccounts[msg.sender] = true;

        // Update the last interaction timestamp
        lastInteraction[msg.sender] = block.timestamp;

        // Execute the function
        _;

        // Unlock the account
        lockedAccounts[msg.sender] = false;
    }



    // Event emitted when a new leasing request is created
    event LeasingRequestCreated(
        uint256 leaseId,
        address indexed requester,
        uint256 amount,
        uint256 duration,
        uint256 fundingDeadline,
        uint256 tokenPrice
    );

    // Event emitted when a leasing request is funded
    event LeasingRequestFunded(
        uint256 leaseId,
        address indexed funder,
        uint256 amount,
        uint256 fundedAmount,
        uint256 numTokens
    );

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
    function createLeasingRequest(
        uint256 _amount,
        uint256 _duration,
        uint256 _fundingPeriod,
        uint256 _tokenPrice
    ) external {
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
     * Ensures that the leasing request is active, not expired, and that the investment does not exceed the required amount.
     * This function also handles the allocation of tokens to the investor based on the amount of Ether invested.
     * @param _leaseId The ID of the leasing request to invest in.
     */
    function investInLeasing(uint256 _leaseId) external payable nonReentrantWithCooldown {
         // Retrieve the leasing request from storage using the leaseId
        LeasingRequest storage request = leasingRequests[_leaseId];

        // Ensure the leasing request is active
        require(request.status == State.Active, "Leasing request is not active");

        // Ensure the current time is before the funding deadline
        require(block.timestamp <= request.fundingDeadline, "Funding deadline has passed");

        // Calculate the number of tokens the investor should receive based on the token price
        uint256 numTokens = msg.value / request.tokenPrice;

        // Ensure the investment amount is sufficient to purchase at least one token
        require(numTokens > 0, "Investment does not meet the minimum token price");

        // Calculate the remaining amount needed to fully fund the leasing request
        uint256 remainingAmount = request.amount - request.fundedAmount;

        // Ensure the investment does not exceed the remaining funding amount
        require(msg.value <= remainingAmount, "Investment exceeds the remaining funding amount");

        // Update the funded amount to include the new investment
        request.fundedAmount += msg.value;

        // Store the number of tokens purchased by the investor based on leaseId and investor address
        investorTokens[_leaseId][msg.sender] += numTokens;

        // Check if the leasing request is now fully funded
        if (request.fundedAmount == request.amount) {
            request.status = State.Funded; // Update the status to funded
            request.fulfilled = true; // Mark the request as fulfilled
        }

        // Emit an event to notify that a leasing request has been funded
        emit LeasingRequestFunded(_leaseId, msg.sender, msg.value, request.fundedAmount, numTokens);
    }


    // Additional functions can be added here as needed to manage leasing requests
}
