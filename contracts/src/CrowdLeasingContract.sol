// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "openzeppelin/security/ReentrancyGuard.sol"; // Protection against reentrancy attacks
import "openzeppelin/token/ERC20/ERC20.sol"; // Standard ERC20 token
import "openzeppelin/access/Ownable.sol"; // Access control mechanism

/// @title CrowdLeasingContract
/// @notice This contract allows users to create and fund leasing requests collectively.
/// @dev Implements security practices and optimized gas usage with OpenZeppelin libraries.
contract CrowdLeasingContract is ReentrancyGuard, ERC20, Ownable {
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
    enum State { Pending, Active, Funded, Minted, Expired, Cancelled, Complete }

    // Mapping to store leasing requests by their unique ID
    mapping(uint256 => LeasingRequest) public leasingRequests;

    // Mapping to track whether a user currently has an active leasing request
    mapping(address => bool) public hasActiveLeasingRequest;

    // Mapping to store the number of tokens for each investor per leaseId
    mapping(uint256 => mapping(address => uint256)) public investorTokens; 

    // Mapping to track if an account is temporarily locked to prevent reentrancy
    mapping(address => bool) private lockedAccounts;

    // Mapping to store the last interaction timestamp for each address
    mapping(address => uint256) private lastInteraction;

    // Array to store unique investors for each leasing request
    mapping(uint256 => address[]) public investorsList;


    // Define the cooldown period in seconds (e.g., 10 seconds)
    uint256 private constant COOLDOWN_PERIOD = 10;

    // Modifier to prevent reentrancy with a cooldown period
    modifier nonReentrantWithCooldown() {
        require(!lockedAccounts[msg.sender], "ReentrancyGuard: reentrant call");
        require(block.timestamp >= lastInteraction[msg.sender] + COOLDOWN_PERIOD, "ReentrancyGuard: cooldown period active");

        lockedAccounts[msg.sender] = true;
        lastInteraction[msg.sender] = block.timestamp;

        _; // Execute the function

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

    // Event emitted when tokens have been minted
    event TokensMinted(uint256 leaseId, uint256 totalTokensMinted);

    // Event emitted when tokens have been distributed
    event TokensDistributed(uint256 leaseId);

    // Event emitted when the state of a leasing request changes
    event LeasingRequestStateChanged(uint256 leaseId, State newState);
    

    // Modified Constructor to accept token name and symbol
    /**
     * @dev Constructor that initializes the leaseIdCounter and sets the ERC20 token name and symbol.
     * @param _tokenName The name of the ERC20 token.
     * @param _tokenSymbol The symbol of the ERC20 token.
     */
    constructor(string memory _tokenName, string memory _tokenSymbol) ERC20(_tokenName, _tokenSymbol) {
        leaseIdCounter = 0; // Initialize the lease ID counter
    }

    // Improved setOwner function with error handling
    /**
     * @dev Sets the owner of the contract to the specified address.
     * @param newOwner The address of the new owner.
     */
    function setOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is the zero address"); // Check that newOwner is not zero address
        transferOwnership(newOwner);
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
        require(_amount > 0, "Amount must be greater than zero");
        require(_duration > 0, "Duration must be greater than zero");
        require(_fundingPeriod > 0, "Funding period must be greater than zero");
        require(_tokenPrice > 0, "Token price must be greater than zero");

        uint256 newLeaseId = ++leaseIdCounter;
        uint256 fundingDeadline = block.timestamp + _fundingPeriod;

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

        hasActiveLeasingRequest[msg.sender] = true;

        require(leasingRequests[newLeaseId].status == State.Active, "Failed to set status to Active");

        // Emit an event to notify that a new leasing request has been created
        emit LeasingRequestCreated(newLeaseId, msg.sender, _amount, _duration, fundingDeadline, _tokenPrice);

        // Emit the state change event
        emit LeasingRequestStateChanged(newLeaseId, State.Active);
    }

    /**
     * @dev Returns the remaining amount needed to fully fund a leasing request.
     * @param _leaseId The ID of the leasing request.
     * @return The remaining amount needed.
     */
    function getRemainingAmount(uint256 _leaseId) public view returns (uint256) {
        LeasingRequest storage request = leasingRequests[_leaseId];
        require(request.status == State.Active, "Leasing request is not active");
        return request.amount - request.fundedAmount;
    }

    /**
     * @dev Returns the current status of a leasing request.
     * @param _leaseId The ID of the leasing request.
     * @return The current state of the leasing request.
     */
    function getStatus(uint256 _leaseId) external view returns (State) {
        LeasingRequest storage request = leasingRequests[_leaseId];
        return request.status;
    }


    /**
     * @dev Allows users to invest in an active leasing request by sending Ether.
     * Ensures that the leasing request is active, not expired, and that the investment does not exceed the required amount.
     * This function also handles the allocation of tokens to the investor based on the amount of Ether invested.
     * @param _leaseId The ID of the leasing request to invest in.
     */
    function investInLeasing(uint256 _leaseId) external payable nonReentrantWithCooldown {
        LeasingRequest storage request = leasingRequests[_leaseId];
        require(request.status == State.Active, "Leasing request is not active"); // Check if the leasing request is active
        require(block.timestamp <= request.fundingDeadline, "Funding deadline has passed"); // Ensure the funding deadline has not passed

        uint256 numTokens = msg.value / request.tokenPrice;
        require(numTokens > 0, "Investment does not meet the minimum token price"); // Ensure the investment amount meets the minimum token price

        uint256 remainingAmount = request.amount - request.fundedAmount;
        require(msg.value <= remainingAmount, "Investment exceeds the remaining funding amount"); // Ensure the investment does not exceed the remaining funding amount

        request.fundedAmount += msg.value;
        investorTokens[_leaseId][msg.sender] += numTokens;

        if (investorTokens[_leaseId][msg.sender] == numTokens) {
            investorsList[_leaseId].push(msg.sender); // Add the investor to the investors list if this is their first investment
        }

        if (request.fundedAmount == request.amount) {
            request.status = State.Funded; // Update status to Funded
            request.fulfilled = true; // Mark the request as fulfilled
            mintTokens(_leaseId); // Automatically mint tokens when funding is complete

            // Emit the state change event
            emit LeasingRequestStateChanged(_leaseId, State.Funded);
        }

        // Emit an event to notify that a leasing request has been funded
        emit LeasingRequestFunded(_leaseId, msg.sender, msg.value, request.fundedAmount, numTokens);
    }


    /**
     * @dev Mints tokens for a funded leasing request.
     * This function is called automatically once the leasing request is fully funded.
     * @param _leaseId The ID of the leasing request for which tokens are being minted.
     */
    function mintTokens(uint256 _leaseId) internal {
        LeasingRequest storage request = leasingRequests[_leaseId];
        require(request.status == State.Funded, "Leasing request is not funded yet");
        uint256 totalTokens = request.amount / request.tokenPrice;

        _mint(address(this), totalTokens);
        request.status = State.Minted;

        emit TokensMinted(_leaseId, totalTokens);

        // Start distribution in batches
        distributeTokensInBatches(_leaseId, 0);
    }

    /**
     * @dev Internal function to distribute tokens in batches to investors.
     * This function is called after tokens have been minted to distribute them efficiently.
     * @param _leaseId The ID of the leasing request for which tokens are being distributed.
     * @param startIndex The starting index for the batch distribution.
     */
    function distributeTokensInBatches(uint256 _leaseId, uint256 startIndex) internal {
        // Retrieve the leasing request
        LeasingRequest storage request = leasingRequests[_leaseId];
        require(request.status == State.Minted, "Tokens have not been minted yet"); // Ensure tokens have been minted

        uint256 batchSize = 10; // Define the number of investors to process per batch
        uint256 endIndex = startIndex + batchSize; // Calculate the end index for this batch
        address[] storage investors = investorsList[_leaseId]; // Get the list of investors for the given leaseId

        // Iterate over the list of investors for the given leaseId within the batch size
        for (uint256 i = startIndex; i < endIndex && i < investors.length; i++) {
            address investor = investors[i];
            uint256 tokens = investorTokens[_leaseId][investor]; // Retrieve the number of tokens the investor should receive

            if (tokens > 0) {
                _transfer(address(this), investor, tokens); // Transfer tokens to the investor
                investorTokens[_leaseId][investor] = 0; // Reset token count for the investor after transfer
            }
        }

        // Continue distributing in batches if there are more investors
        if (endIndex < investors.length) {
            distributeTokensInBatches(_leaseId, endIndex); // Recursively distribute tokens in the next batch
        } else {
            emit TokensDistributed(_leaseId); // Emit an event once distribution is complete
        }
    }

    // Additional functions can be added here as needed to manage leasing requests
}
