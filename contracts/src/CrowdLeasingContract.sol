// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CrowdLeasingContract {
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

    // Mapping to track whether a user currently has an active leasing request.
    mapping(address => bool) public hasActiveLeasingRequest;

    // Event emitted when a new leasing request is created
    event LeasingRequestCreated(uint256 leaseId, address indexed requester, uint256 amount, uint256 duration, uint256 fundingDeadline, uint256 tokenPrice);

    /**
     * @dev Constructor that initializes the leaseIdCounter to 0
     */
    constructor() {
        leaseIdCounter = 0;
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

    // Additional functions can be added here as needed to manage leasing requests
}

