// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ContentCert {
    struct Cert {
        address creator;
        uint8 contentType; // 0=human, 1=ai, 2=mixed
        bytes32 hash;
        uint256 timestamp;
    }

    mapping(bytes32 => Cert) public certifications;

    event Certified(bytes32 indexed hash, address indexed creator, uint8 contentType);

    function certify(bytes32 hash, address creator, uint8 contentType) public {
        require(certifications[hash].timestamp == 0, "Already certified");
        certifications[hash] = Cert(creator, contentType, hash, block.timestamp);
        emit Certified(hash, creator, contentType);
    }

    function getCert(bytes32 hash) public view returns (Cert memory) {
        return certifications[hash];
    }
}
