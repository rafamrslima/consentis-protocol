// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {ConsentRegistry} from "../src/ConsentRegistry.sol";

contract ConsentRegistryTest is Test {
    ConsentRegistry public registry;
    
    address patient = address(0x1);
    address researcher = address(0x2);
    string recordId = "record-123";

    function setUp() public {
        registry = new ConsentRegistry();
    }

    function test_RegisterRecord() public {
        vm.prank(patient);
        registry.registerRecord(recordId);
        
        assertEq(registry.getRecordOwner(recordId), patient);
        assertTrue(registry.isRecordOwner(recordId, patient));
    }

    function test_RegisterRecord_RevertIfDuplicate() public {
        vm.prank(patient);
        registry.registerRecord(recordId);
        
        vm.prank(patient);
        vm.expectRevert("Record already registered");
        registry.registerRecord(recordId);
    }

    function test_GrantConsent_Success() public {
        // Register record first
        vm.prank(patient);
        registry.registerRecord(recordId);
        
        // Grant consent
        vm.prank(patient);
        registry.grantConsent(researcher, recordId);
        
        assertTrue(registry.hasConsent(patient, researcher, recordId));
    }

    function test_GrantConsent_RevertIfNotOwner() public {
        vm.prank(patient);
        registry.registerRecord(recordId);
        
        // Someone else tries to grant consent
        address thirdParty = address(0x3);
        vm.prank(thirdParty);
        vm.expectRevert("Not record owner");
        registry.grantConsent(researcher, recordId);
    }

    function test_RevokeConsent() public {
        // Register and grant
        vm.prank(patient);
        registry.registerRecord(recordId);
        
        vm.prank(patient);
        registry.grantConsent(researcher, recordId);
        
        // Revoke
        vm.prank(patient);
        registry.revokeConsent(researcher, recordId);
        
        assertFalse(registry.hasConsent(patient, researcher, recordId));
    }

    function test_CheckAccess_OwnerAlwaysHasAccess() public {
        vm.prank(patient);
        registry.registerRecord(recordId);
        
        assertTrue(registry.checkAccess(patient, patient, recordId));
    }

    function test_RegisterRecord_RevertIfEmpty() public {
        vm.prank(patient);
        vm.expectRevert("Record ID cannot be empty");
        registry.registerRecord("");
    }

    function test_RegisterRecord_RevertIfTooLong() public {
        string memory longId = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        
        vm.prank(patient);
        vm.expectRevert("Record ID too long");
        registry.registerRecord(longId);
    }

    function test_GrantConsent_RevertIfZeroAddress() public {
        vm.prank(patient);
        registry.registerRecord(recordId);
        
        vm.prank(patient);
        vm.expectRevert("Invalid researcher address");
        registry.grantConsent(address(0), recordId);
    }

    function test_GrantConsent_RevertIfSelfConsent() public {
        vm.prank(patient);
        registry.registerRecord(recordId);
        
        vm.prank(patient);
        vm.expectRevert("Self consent is not allowed");
        registry.grantConsent(patient, recordId);
    }

    function test_GrantConsent_RevertIfRecordNotRegistered() public {
        vm.prank(patient);
        vm.expectRevert("Not record owner");
        registry.grantConsent(researcher, "unregistered-record-id");
    }

    function test_RevokeConsent_WorksEvenIfNotGranted() public {
        vm.prank(patient);
        registry.registerRecord(recordId);
        
        // Revoke consent that was never granted (should not revert)
        vm.prank(patient);
        registry.revokeConsent(researcher, recordId);
        
        assertFalse(registry.hasConsent(patient, researcher, recordId));
    }

    function test_MultipleResearchers_IndependentConsent() public {
        address researcher2 = address(0x4);
        
        vm.prank(patient);
        registry.registerRecord(recordId);
        
        // Grant consent to both researchers
        vm.prank(patient);
        registry.grantConsent(researcher, recordId);
        
        vm.prank(patient);
        registry.grantConsent(researcher2, recordId);
        
        // Both should have independent consent
        assertTrue(registry.hasConsent(patient, researcher, recordId));
        assertTrue(registry.hasConsent(patient, researcher2, recordId));
        
        // Revoke only one researcher's consent
        vm.prank(patient);
        registry.revokeConsent(researcher, recordId);
        
        // First researcher loses access, second keeps it
        assertFalse(registry.hasConsent(patient, researcher, recordId));
        assertTrue(registry.hasConsent(patient, researcher2, recordId));
    }
}
