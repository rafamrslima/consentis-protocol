pragma solidity ^0.8.13;

contract ConsentRegistry {
    // Nested mapping: Patient Address => Record ID => Researcher Address => Has Consent
    mapping(address => mapping(string => mapping(address => bool))) private _consents;

    event ConsentGranted(address indexed patient, address indexed researcher, string recordId);
    event ConsentRevoked(address indexed patient, address indexed researcher, string recordId);

    function grantConsent(address researcher, string calldata recordId) external {
        require(researcher != address(0), "Invalid researcher address");
        _consents[msg.sender][recordId][researcher] = true;
        emit ConsentGranted(msg.sender, researcher, recordId);
    }

    function revokeConsent(address researcher, string calldata recordId) external {
        _consents[msg.sender][recordId][researcher] = false;
        emit ConsentRevoked(msg.sender, researcher, recordId);
    }

    function hasConsent(address patient, address researcher, string calldata recordId) external view returns (bool) {
        return _consents[patient][recordId][researcher];
    }

    function checkAccess(address patient, address researcher, string calldata recordId) external view returns (bool) {
        if (patient == researcher) return true;
        return _consents[patient][recordId][researcher];
    }
}