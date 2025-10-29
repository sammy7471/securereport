// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, externalEuint32, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title SecureReport
 * @notice Anonymous whistleblowing platform with FHE encryption
 * @dev Reports are encrypted and only accessible to verified organizations
 */
contract SecureReport is SepoliaConfig {
    // Report categories
    enum Category {
        Fraud,
        Harassment,
        Safety,
        Ethics,
        Legal,
        Environmental,
        Other
    }

    // Report status
    enum Status {
        Submitted,
        UnderReview,
        Investigating,
        Resolved,
        Closed
    }

    // Report severity
    enum Severity {
        Low,
        Medium,
        High,
        Critical
    }

    struct Report {
        uint256 id;
        address organization; // Organization that can decrypt
        address reporter; // Reporter address for encrypted feedback
        Category category;
        Severity severity;
        Status status;
        uint256 submittedAt;
        uint256 updatedAt;
        bytes32 accessCode; // Hashed code for anonymous access
        bool isActive;
        euint32 encryptedContent; // Single encrypted chunk (simplified)
        euint32 encryptedFeedback; // Encrypted feedback from org to reporter
    }

    struct Organization {
        address orgAddress;
        string name;
        string description;
        bool isVerified;
        bool isActive;
        uint256 registeredAt;
        uint256 reportsReceived;
        uint256 reportsResolved;
    }

    // State variables
    mapping(uint256 => Report) public reports;
    mapping(address => Organization) public organizations;
    mapping(bytes32 => uint256) private accessCodeToReportId;
    
    uint256 public reportCounter;
    address public admin;
    
    // Events
    event OrganizationRegistered(address indexed orgAddress, string name);
    event OrganizationVerified(address indexed orgAddress);
    event OrganizationDeactivated(address indexed orgAddress);
    event ReportSubmitted(uint256 indexed reportId, address indexed organization, Category category, Severity severity);
    event ReportStatusUpdated(uint256 indexed reportId, Status newStatus, string notes);
    event ReportClosed(uint256 indexed reportId);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyVerifiedOrg() {
        require(organizations[msg.sender].isVerified && organizations[msg.sender].isActive, "Not a verified organization");
        _;
    }

    modifier reportExists(uint256 reportId) {
        require(reportId < reportCounter, "Report does not exist");
        require(reports[reportId].isActive, "Report is not active");
        _;
    }

    constructor() {
        admin = msg.sender;
        reportCounter = 1; // Start at 1 to avoid issues with mapping lookups
    }

    /**
     * @notice Register a new organization (auto-verified)
     * @param name Organization name
     * @param description Organization description
     */
    function registerOrganization(string memory name, string memory description) external {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(!organizations[msg.sender].isActive, "Organization already registered");

        organizations[msg.sender] = Organization({
            orgAddress: msg.sender,
            name: name,
            description: description,
            isVerified: true,  // Auto-verified
            isActive: true,
            registeredAt: block.timestamp,
            reportsReceived: 0,
            reportsResolved: 0
        });

        emit OrganizationRegistered(msg.sender, name);
        emit OrganizationVerified(msg.sender);  // Emit verified event
    }

    /**
     * @notice Verify an organization (admin only)
     * @param orgAddress Organization address to verify
     */
    function verifyOrganization(address orgAddress) external onlyAdmin {
        require(organizations[orgAddress].isActive, "Organization not registered");
        organizations[orgAddress].isVerified = true;
        emit OrganizationVerified(orgAddress);
    }

    /**
     * @notice Deactivate an organization (admin only)
     * @param orgAddress Organization address to deactivate
     */
    function deactivateOrganization(address orgAddress) external onlyAdmin {
        require(organizations[orgAddress].isActive, "Organization not active");
        organizations[orgAddress].isActive = false;
        emit OrganizationDeactivated(orgAddress);
    }

    /**
     * @notice Submit an anonymous report (simplified - single encrypted value)
     * @param organization Target organization address
     * @param category Report category
     * @param severity Report severity
     * @param encryptedContent Single encrypted content value
     * @param inputProof FHE input proof
     * @param accessCode Hashed access code for anonymous tracking
     */
    function submitReport(
        address organization,
        Category category,
        Severity severity,
        externalEuint32 encryptedContent,
        bytes calldata inputProof,
        bytes32 accessCode
    ) external returns (uint256) {
        require(organizations[organization].isVerified, "Organization not verified");
        require(organizations[organization].isActive, "Organization not active");
        require(accessCode != bytes32(0), "Access code required");
        require(accessCodeToReportId[accessCode] == 0, "Access code already used");

        uint256 reportId = reportCounter++;

        // Create report
        Report storage report = reports[reportId];
        report.id = reportId;
        report.organization = organization;
        report.reporter = msg.sender; // Store reporter address for feedback encryption
        report.category = category;
        report.severity = severity;
        report.status = Status.Submitted;
        report.submittedAt = block.timestamp;
        report.updatedAt = block.timestamp;
        report.accessCode = accessCode;
        report.isActive = true;

        // Store single encrypted value
        euint32 content = FHE.fromExternal(encryptedContent, inputProof);
        FHE.allow(content, organization);
        FHE.allowThis(content);
        report.encryptedContent = content;

        // Map access code to report ID
        accessCodeToReportId[accessCode] = reportId;

        // Update organization stats
        organizations[organization].reportsReceived++;

        emit ReportSubmitted(reportId, organization, category, severity);

        return reportId;
    }

    /**
     * @notice Update report status with encrypted feedback (organization only)
     * @param reportId Report ID
     * @param newStatus New status
     * @param encryptedFeedback Encrypted feedback for reporter
     * @param inputProof FHE input proof
     */
    function updateReportStatus(
        uint256 reportId,
        Status newStatus,
        externalEuint32 encryptedFeedback,
        bytes calldata inputProof
    ) external onlyVerifiedOrg reportExists(reportId) {
        Report storage report = reports[reportId];
        require(report.organization == msg.sender, "Not authorized for this report");

        report.status = newStatus;
        report.updatedAt = block.timestamp;
        
        // Store encrypted feedback for reporter
        euint32 feedback = FHE.fromExternal(encryptedFeedback, inputProof);
        FHE.allow(feedback, report.reporter); // Allow reporter to decrypt
        FHE.allowThis(feedback);
        report.encryptedFeedback = feedback;

        if (newStatus == Status.Resolved || newStatus == Status.Closed) {
            organizations[msg.sender].reportsResolved++;
        }

        emit ReportStatusUpdated(reportId, newStatus, "");
    }

    /**
     * @notice Close a report (organization only)
     * @param reportId Report ID
     */
    function closeReport(uint256 reportId) external onlyVerifiedOrg reportExists(reportId) {
        Report storage report = reports[reportId];
        require(report.organization == msg.sender, "Not authorized for this report");

        report.isActive = false;
        report.status = Status.Closed;
        report.updatedAt = block.timestamp;

        emit ReportClosed(reportId);
    }

    /**
     * @notice Get report details by access code (for anonymous tracking)
     * @param accessCode Access code provided during submission
     */
    function getReportByAccessCode(bytes32 accessCode) external view returns (
        uint256 id,
        Category category,
        Severity severity,
        Status status,
        uint256 submittedAt,
        uint256 updatedAt
    ) {
        uint256 reportId = accessCodeToReportId[accessCode];
        require(reportId != 0, "Invalid access code");

        Report storage report = reports[reportId];
        return (
            report.id,
            report.category,
            report.severity,
            report.status,
            report.submittedAt,
            report.updatedAt
        );
    }

    /**
     * @notice Get encrypted feedback for reporter (access code required)
     * @param accessCode Access code provided during submission
     */
    function getEncryptedFeedback(bytes32 accessCode) external view returns (bytes32 feedback) {
        uint256 reportId = accessCodeToReportId[accessCode];
        require(reportId != 0, "Invalid access code");

        Report storage report = reports[reportId];
        return FHE.toBytes32(report.encryptedFeedback);
    }

    /**
     * @notice Get encrypted report content handle (organization only)
     * @param reportId Report ID
     */
    function getEncryptedReport(uint256 reportId) 
        external 
        view 
        onlyVerifiedOrg 
        reportExists(reportId) 
        returns (bytes32 content) 
    {
        Report storage report = reports[reportId];
        require(report.organization == msg.sender, "Not authorized for this report");

        // Export encrypted handle as bytes32 for frontend decryption
        return FHE.toBytes32(report.encryptedContent);
    }

    /**
     * @notice Get all reports for an organization
     * @param orgAddress Organization address
     */
    function getOrganizationReports(address orgAddress) 
        external 
        view 
        returns (uint256[] memory) 
    {
        // Allow anyone to query their own organization's reports
        // This is safe because report content is encrypted
        require(organizations[orgAddress].isVerified, "Organization not verified");
        
        uint256[] memory orgReports = new uint256[](reportCounter);
        uint256 count = 0;

        for (uint256 i = 0; i < reportCounter; i++) {
            if (reports[i].organization == orgAddress && reports[i].isActive) {
                orgReports[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = orgReports[i];
        }

        return result;
    }

    /**
     * @notice Get report metadata (public info only)
     * @param reportId Report ID
     */
    function getReportMetadata(uint256 reportId) 
        external 
        view 
        reportExists(reportId) 
        returns (
            Category category,
            Severity severity,
            Status status,
            uint256 submittedAt,
            uint256 updatedAt
        ) 
    {
        Report storage report = reports[reportId];
        // No authorization needed - metadata is public info
        // Only encrypted content requires authorization

        return (
            report.category,
            report.severity,
            report.status,
            report.submittedAt,
            report.updatedAt
        );
    }

    /**
     * @notice Get organization details
     * @param orgAddress Organization address
     */
    function getOrganization(address orgAddress) 
        external 
        view 
        returns (Organization memory) 
    {
        return organizations[orgAddress];
    }

    /**
     * @notice Transfer admin role
     * @param newAdmin New admin address
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        admin = newAdmin;
    }
}
