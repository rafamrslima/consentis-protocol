pragma solidity ^0.8.13;

contract ConsentRegistry {
    // Record ownership mapping: Record ID => Owner Address
    mapping(string => address) private _recordOwners;
    
    // Nested mapping: Patient Address => Record ID => Researcher Address => Has Consent
    mapping(address => mapping(string => mapping(address => bool))) private _consents;

    event RecordRegistered(string indexed recordId, address indexed owner);
    event ConsentGranted(address indexed patient, address indexed researcher, string recordId);
    event ConsentRevoked(address indexed patient, address indexed researcher, string recordId);

    function registerRecord(string calldata recordId) external {
        require(bytes(recordId).length > 0, "Record ID cannot be empty");
        require(bytes(recordId).length <= 100, "Record ID too long");
        require(_recordOwners[recordId] == address(0), "Record already registered");
        
        _recordOwners[recordId] = msg.sender;
        emit RecordRegistered(recordId, msg.sender);
    }

    function isRecordOwner(string calldata recordId, address owner) external view returns (bool) {
        return _recordOwners[recordId] == owner;
    }

    function getRecordOwner(string calldata recordId) external view returns (address) {
        return _recordOwners[recordId];
    }

    function grantConsent(address researcher, string calldata recordId) external {
        require(researcher != address(0), "Invalid researcher address");
        require(msg.sender != researcher, "Self consent is not allowed");
        require(_recordOwners[recordId] == msg.sender, "Not record owner");
        _consents[msg.sender][recordId][researcher] = true;
        emit ConsentGranted(msg.sender, researcher, recordId);
    }

    function revokeConsent(address researcher, string calldata recordId) external {
        require(researcher != address(0), "Invalid researcher address");
        require(_recordOwners[recordId] == msg.sender, "Not record owner");
        _consents[msg.sender][recordId][researcher] = false;
        emit ConsentRevoked(msg.sender, researcher, recordId);
    }

    function hasConsent(address patient, address researcher, string calldata recordId) external view returns (bool) {
        return _consents[patient][recordId][researcher];
    }

    function checkAccess(address patient, address researcher, string calldata recordId) external view returns (bool) {
        require(_recordOwners[recordId] == patient, "Invalid record owner");
        if (patient == researcher) return true;
        return _consents[patient][recordId][researcher];
    }
}