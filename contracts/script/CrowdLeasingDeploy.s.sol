// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/CrowdLeasingContract.sol";

contract CrowdLeasingDeploy is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        string memory tokenName = "DefaultToken";
        string memory tokenSymbol = "DFT";

        new CrowdLeasingContract(tokenName, tokenSymbol);

        vm.stopBroadcast();
    }
}

