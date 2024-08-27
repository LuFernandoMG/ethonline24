// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/CrowdLeasingContract.sol";

contract CrowdLeasingTest is Test {
    CrowdLeasingContract clc;

    function setUp() public {
        clc = new CrowdLeasingContract();
    }

    function testInitialLeaseIdCounter() public {
        assertEq(clc.leaseIdCounter(), 0);
    }

    // Add more tests here
}
