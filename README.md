# 🛡️ SecureReport - Anonymous Whistleblowing Platform

> Secure, anonymous whistleblowing with Fully Homomorphic Encryption on Ethereum

A privacy-first decentralized application for reporting misconduct anonymously using blockchain and FHE technology. Your identity remains completely protected while organizations can receive and investigate reports securely.

[![Built with Zama](https://img.shields.io/badge/Built%20with-Zama%20FHE-blue)](https://zama.ai/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-purple)](https://sepolia.etherscan.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ Features

### For Whistleblowers
- 🎭 **100% Anonymous** - No identity data stored or tracked
- 🔐 **End-to-End Encryption** - Reports encrypted before leaving your device
- 📝 **Detailed Reports** - Include category, severity, content, and evidence
- 🔍 **Track Progress** - Use access code to check report status anonymously
- 💬 **Receive Feedback** - Get encrypted updates from organizations

### For Organizations
- 🏢 **Register Organization** - Create your whistleblowing portal
- 📊 **Manage Reports** - View, decrypt, and investigate submissions
- 🎯 **Update Status** - Track progress (Submitted → Under Review → Investigating → Resolved)
- 💬 **Send Feedback** - Communicate securely with anonymous reporters
- 📈 **Dashboard** - Overview of all reports and their statuses

### Privacy & Security
- 🔒 **FHE Encryption** - Reports encrypted using Fully Homomorphic Encryption
- 🎯 **Access Control** - Only designated organizations can decrypt their reports
- 🌐 **Blockchain Storage** - Immutable and tamper-proof on Ethereum
- 🛡️ **True Anonymity** - No way to link wallet address to report content
- 🔑 **Access Codes** - Secure tracking without revealing identity

## 🚀 Quick Start

```bash
# Install dependencies
npm install && cd frontend && npm install && cd ..

# Deploy contract
npx hardhat run scripts/deploy.js --network sepolia

# Configure frontend
cd frontend
cp .env.example .env
# Add your contract address to .env

# Run frontend
npm run dev
```

## 📖 How It Works

### For Whistleblowers:
1. **Select Organization** → Choose from registered organizations
2. **Submit Report** → Fill in details (category, severity, content, evidence)
3. **Get Access Code** → Save this code to track your report
4. **Track Status** → Use access code to check progress and read feedback

### For Organizations:
1. **Register** → Create your organization profile on-chain
2. **Receive Reports** → Reports appear in your dashboard
3. **Decrypt & Review** → Securely decrypt and investigate
4. **Update Status** → Mark progress and send encrypted feedback
5. **Resolve** → Close reports when investigation is complete

## 🏗️ Tech Stack

- **Smart Contracts**: Solidity 0.8.24 + Zama FHE
- **Frontend**: React 18 + TypeScript + Vite
- **Web3**: Wagmi + RainbowKit
- **Styling**: TailwindCSS
- **Network**: Ethereum Sepolia Testnet
- **Encryption**: fhevmjs (Zama FHE library)

## 📱 Contract Details

**Contract**: `SecureReport.sol`  
**Network**: Sepolia Testnet  
**Features**: 
- Organization registration
- Encrypted report submission
- Status management
- Encrypted feedback system

## 🔐 Report Categories

- 🏢 **Workplace** - Harassment, discrimination, safety violations
- 💰 **Financial** - Fraud, embezzlement, accounting irregularities
- 🔒 **Data** - Privacy breaches, data misuse
- ⚖️ **Legal** - Regulatory violations, compliance issues
- 🌍 **Environmental** - Pollution, safety hazards
- 📋 **Other** - Any other misconduct

## 📊 Severity Levels

- 🔵 **Low** - Minor issues requiring attention
- 🟡 **Medium** - Significant concerns
- 🟠 **High** - Serious violations
- 🔴 **Critical** - Urgent, severe misconduct

## 💻 Code Overview

### Smart Contract Structure

```solidity
// Core data structures
enum Category { Fraud, Harassment, Safety, Ethics, Legal, Environmental, Other }
enum Status { Submitted, UnderReview, Investigating, Resolved, Closed }
enum Severity { Low, Medium, High, Critical }

struct Report {
    uint256 id;
    address organization;      // Organization that can decrypt
    address reporter;          // For encrypted feedback
    Category category;
    Severity severity;
    Status status;
    bytes32 accessCode;        // Hashed code for anonymous tracking
    // ... encrypted content stored separately
}

struct Organization {
    address orgAddress;
    string name;
    bool isVerified;
    bool isActive;
    uint256 reportsReceived;
    uint256 reportsResolved;
}
```

### Key Functions

**Organization Management:**
```solidity
function registerOrganization(string name, string description)
function verifyOrganization(address orgAddress) // Admin only
```

**Report Submission:**
```solidity
function submitReport(
    address organization,
    Category category,
    Severity severity,
    externalEuint32 encryptedContent,  // FHE encrypted
    bytes calldata inputProof,
    bytes32 accessCode
) returns (uint256 reportId)
```

**Report Management:**
```solidity
function updateReportStatus(uint256 reportId, Status newStatus)
function sendFeedback(uint256 reportId, externalEuint32 encryptedFeedback, bytes inputProof)
```

**Anonymous Tracking:**
```solidity
function getReportByAccessCode(bytes32 accessCode) returns (ReportMetadata)
function decryptReportFeedback(uint256 reportId) // Reporter only
```

### FHE Encryption Flow

**Submission (Client → Contract):**
```typescript
// 1. Initialize FHE instance
const instance = await createInstance({ chainId, publicKey });

// 2. Encrypt report content
const encryptedContent = await instance.encrypt32(contentValue);

// 3. Submit with proof
await contract.submitReport(
    orgAddress,
    category,
    severity,
    encryptedContent.data,
    encryptedContent.proof,
    hashedAccessCode
);
```

**Decryption (Contract → Organization):**
```typescript
// 1. Get encrypted value from contract
const encryptedValue = await contract.getEncryptedContent(reportId);

// 2. Request decryption permission
await contract.requestDecryption(reportId);

// 3. Decrypt with organization's key
const decrypted = await instance.decrypt(orgAddress, encryptedValue);
```

### Frontend Architecture

```
src/
├── pages/
│   ├── HomePage.tsx              # Landing page
│   ├── SubmitReportPage.tsx      # Report submission
│   ├── OrganizationDashboard.tsx # Org management
│   └── TrackReportPage.tsx       # Anonymous tracking
├── hooks/
│   └── useSecureReport.ts        # Contract interactions + FHE
├── components/
│   ├── EncryptionProgress.tsx    # FHE loading states
│   └── ChainGuard.tsx            # Network validation
└── config/
    └── wagmi.ts                  # Web3 configuration
```

## 🤝 Contributing

Contributions welcome! Feel free to submit a Pull Request.

## 📄 License

MIT License

## 🙏 Acknowledgments

Built with [Zama FHE](https://zama.ai/), [Hardhat](https://hardhat.org/), and [RainbowKit](https://www.rainbowkit.com/)

---

**Built with ❤️ for anonymous whistleblowing and organizational transparency**
