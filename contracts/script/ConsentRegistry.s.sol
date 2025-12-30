// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {ConsentRegistry} from "../src/ConsentRegistry.sol";

contract CrowdFundingScript is Script {
    ConsentRegistry public consentRegistry;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        consentRegistry = new ConsentRegistry();
        vm.stopBroadcast();
    }
}