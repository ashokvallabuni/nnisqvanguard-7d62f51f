// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NISQCertificateRegistry
 * @dev Immutable on-chain registry for NISQ Vanguard Academy certificate authenticity.
 * Only the designated owner/issuer can register or revoke certificates.
 * Records only cryptographic hashes (one-way certId hash and SHA-256 PDF hash), never PII.
 */
contract NISQCertificateRegistry {
    address public immutable owner;

    struct CertificateRecord {
        bytes32 pdfSha256;      // SHA-256 digest of stored PDF
        uint64 issuedAt;        // Unix timestamp of registration
        bool revoked;           // Revocation status
        uint64 revokedAt;       // Unix timestamp of revocation (0 if not revoked)
        string revokedReason;   // Revocation audit reason
    }

    // Mapping: certIdHash => CertificateRecord
    mapping(bytes32 => CertificateRecord) private _certificates;

    event CertificateRegistered(bytes32 indexed certIdHash, bytes32 indexed pdfSha256, uint256 timestamp);
    event CertificateRevoked(bytes32 indexed certIdHash, string reason, uint256 timestamp);

    error Unauthorized();
    error AlreadyRegistered();
    error NotRegistered();
    error AlreadyRevoked();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Register a newly issued certificate hash on-chain
     * @param certIdHash keccak256 hash of the unique certificate number
     * @param pdfSha256 SHA-256 hash of the deterministic generated PDF file
     */
    function registerCertificate(bytes32 certIdHash, bytes32 pdfSha256) external onlyOwner {
        if (_certificates[certIdHash].issuedAt != 0) revert AlreadyRegistered();

        _certificates[certIdHash] = CertificateRecord({
            pdfSha256: pdfSha256,
            issuedAt: uint64(block.timestamp),
            revoked: false,
            revokedAt: 0,
            revokedReason: ""
        });

        emit CertificateRegistered(certIdHash, pdfSha256, block.timestamp);
    }

    /**
     * @notice Revoke a previously registered certificate
     * @param certIdHash keccak256 hash of the certificate number
     * @param reason Human-readable administrative reason for revocation
     */
    function revokeCertificate(bytes32 certIdHash, string calldata reason) external onlyOwner {
        CertificateRecord storage record = _certificates[certIdHash];
        if (record.issuedAt == 0) revert NotRegistered();
        if (record.revoked) revert AlreadyRevoked();

        record.revoked = true;
        record.revokedAt = uint64(block.timestamp);
        record.revokedReason = reason;

        emit CertificateRevoked(certIdHash, reason, block.timestamp);
    }

    /**
     * @notice Query certificate registration status and integrity hash
     * @param certIdHash keccak256 hash of the certificate number
     */
    function getCertificate(bytes32 certIdHash)
        external
        view
        returns (
            bool exists,
            bytes32 pdfSha256,
            uint64 issuedAt,
            bool revoked,
            uint64 revokedAt,
            string memory revokedReason
        )
    {
        CertificateRecord memory record = _certificates[certIdHash];
        if (record.issuedAt == 0) {
            return (false, bytes32(0), 0, false, 0, "");
        }
        return (
            true,
            record.pdfSha256,
            record.issuedAt,
            record.revoked,
            record.revokedAt,
            record.revokedReason
        );
    }
}

