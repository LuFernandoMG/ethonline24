// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/CrowdLeasingFactory.sol";

contract FactoryDeploy is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // Deploy factory Contract
        new CrowdLeasingFactory();

        vm.stopBroadcast();
    }
}
