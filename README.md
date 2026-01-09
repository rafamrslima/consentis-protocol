# Consentis Protocol

> A decentralized health data protocol designed to return ownership and control to patients.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.13-blue)](https://soliditylang.org/)
[![Go](https://img.shields.io/badge/Go-1.25.0-00ADD8?logo=go)](https://go.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Smart Contracts](#smart-contracts)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

Consentis solves the **"Data Silo" problem** by separating medical data from permission logic. Using blockchain as a tamper-proof gatekeeper, the protocol ensures that only authorized researchers can access sensitive information, with patients retaining a cryptographic **"kill switch"** to revoke access instantly.

The protocol empowers patients by giving them complete control over their health data while enabling legitimate research and medical collaboration through a secure, transparent, and decentralized infrastructure.

### The Problem

- Medical records are locked in institutional silos
- Patients lack control over their own health data
- Research access requires complex bureaucratic processes
- Data sharing is slow, opaque, and centralized

### The Solution

- **Decentralized ownership**: Patients control access via blockchain
- **Instant permissions**: Smart contracts manage consent in real-time
- **Encrypted storage**: IPFS + Lit Protocol ensure data privacy
- **Transparent audit trail**: All access changes recorded on-chain

## Key Features

- **Patient-Controlled Access**: Full ownership and control over medical data
- **Cryptographic Kill Switch**: Instant revocation of access permissions
- **Tamper-Proof Gatekeeping**: Blockchain-based permission management
- **Decentralized Storage**: IPFS for distributed, censorship-resistant storage
- **Research-Friendly**: Authorized researchers access data for legitimate studies
- **Privacy-Preserving**: End-to-end encryption with Lit Protocol
- **Comprehensive Audit Trail**: All consent events tracked on-chain
- **Multi-Party Support**: Patients, researchers, and institutions

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Patient   │      │  Researcher  │      │ Institution │
│   Portal    │      │    Portal    │      │   Portal    │
└──────┬──────┘      └──────┬───────┘      └──────┬──────┘
       │                    │                     │
       └────────────────────┼─────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   Frontend     │
                    │  (Next.js)     │
                    └───────┬────────┘
                            │
                    ┌───────▼────────┐
                    │  Backend API   │
                    │     (Go)       │
                    └───┬────────┬───┘
                        │        │
              ┌─────────▼──┐  ┌──▼──────────┐
              │ PostgreSQL │  │   IPFS      │
              │  Database  │  │  (Pinata)   │
              └────────────┘  └─────────────┘
                        │
                ┌───────▼────────┐
                │   Blockchain   │
                │ ConsentRegistry│
                │  + Lit Protocol│
                └────────────────┘
```

### Data Flow

1. **Upload**: Patient encrypts file → IPFS → stores CID in database
2. **Register**: Patient registers record on ConsentRegistry smart contract
3. **Grant**: Patient grants consent to researcher on-chain
4. **Access**: Researcher requests data → backend verifies consent → returns encrypted file + decryption key
5. **Revoke**: Patient revokes consent on-chain → researcher loses access immediately

## Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Lit Protocol SDK** - Decentralized encryption/access control
- **ethers.js** - Ethereum wallet integration
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives

### Backend
- **Go 1.25** - High-performance API server
- **PostgreSQL** - Relational database with JSONB support
- **pgx/v5** - PostgreSQL driver with connection pooling
- **IPFS (Pinata)** - Decentralized file storage
- **go-ethereum** - Ethereum client for event listening

### Smart Contracts
- **Solidity ^0.8.13** - Smart contract language
- **Foundry** - Development, testing, and deployment
- **EVM-compatible chains** - Ethereum, Sepolia, etc.

### DevOps & Tools
- **Docker** - Containerization (optional)
- **Git** - Version control
- **Foundry** - Smart contract tooling (forge, cast, anvil)

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **Go** >= 1.25
- **PostgreSQL** >= 13
- **Foundry** - [Installation guide](https://book.getfoundry.sh/getting-started/installation)
- **Pinata Account** - [Sign up](https://pinata.cloud)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/rafamrslima/consentis-protocol.git
cd consentis-protocol
```

2. **Setup Smart Contracts**
```bash
cd contracts
forge install
forge build
forge test
```

3. **Setup Backend**
```bash
cd ../backend

# Install dependencies
go mod download

# Create .env file
cp .env.example .env

# Configure environment variables
# - DATABASE_URL
# - PINATA_API_KEY
# - PINATA_API_SECRET
# - CONTRACT_ADDRESS
# - ETH_CLIENT_ADDRESS

# Run database migrations
psql -U postgres -d consentis -f internal/database/init.sql

# Start backend server
go run cmd/main.go
```

4. **Setup Frontend**
```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Configure environment variables
# - NEXT_PUBLIC_CONTRACT_ADDRESS
# - NEXT_PUBLIC_RPC_URL

# Start development server
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

## Project Structure

```
consentis-protocol/
├── contracts/                    # Smart contracts
│   ├── src/
│   │   └── ConsentRegistry.sol  # Main consent management contract
│   ├── test/
│   │   └── ConsentRegistry.t.sol # Contract tests
│   ├── script/                   # Deployment scripts
│   └── foundry.toml             # Foundry configuration
│
├── backend/                      # Go backend API
│   ├── cmd/
│   │   └── main.go              # Application entry point
│   ├── internal/
│   │   ├── handlers/            # HTTP request handlers
│   │   ├── repositories/        # Database layer
│   │   ├── models/              # Data models
│   │   ├── dtos/                # Data transfer objects
│   │   ├── helpers/             # Utility functions
│   │   ├── ipfs/                # IPFS/Pinata client
│   │   ├── chain-listener/      # Blockchain event indexer
│   │   └── database/            # SQL schemas
│   ├── go.mod                   # Go dependencies
│   └── .env                     # Environment variables
│
└── frontend/                     # Next.js frontend
    ├── src/
    │   ├── app/                 # App Router pages
    │   ├── components/          # React components
    │   ├── lib/                 # Utilities and clients
    │   └── hooks/               # Custom React hooks
    ├── package.json             # Node dependencies
    └── .env.local               # Frontend environment variables
```

## Smart Contracts

### ConsentRegistry.sol

Main contract managing record ownership and consent permissions.

**Key Functions:**
- `registerRecord(recordId)` - Register a medical record on-chain
- `grantConsent(researcher, recordId)` - Grant access to a researcher
- `revokeConsent(researcher, recordId)` - Revoke researcher access
- `hasConsent(patient, researcher, recordId)` - Check consent status
- `checkAccess(patient, researcher, recordId)` - Verify access rights

**Events:**
- `RecordRegistered(recordId, owner)`
- `ConsentGranted(patient, researcher, recordId)`
- `ConsentRevoked(patient, researcher, recordId)`

### Deployment

```bash
# Deploy to local network (Anvil)
anvil
forge script script/ConsentRegistry.s.sol --rpc-url http://localhost:8545 --broadcast

# Deploy to testnet (Sepolia)
forge script script/ConsentRegistry.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

## API Documentation

### Base URL
```
http://localhost:8080/api/v1
```

### Endpoints

#### Records
- `POST /records` - Upload and register a medical record
- `GET /records/patient/{address}` - Get all records for a patient
- `GET /records/researcher/{address}` - Get accessible records for researcher

#### Researchers
- `POST /users/researcher` - Register researcher profile
- `GET /users/researcher/{address}` - Get researcher profile

#### Health Check
- `GET /` - API health check

### Example: Upload Record

```bash
curl -X POST http://localhost:8080/api/v1/records \
  -H "Content-Type: application/json" \
  -d '{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "MRI Scan - Jan 2026",
    "ipfsCid": "QmXyz...",
    "dataToEncryptHash": "0xabc...",
    "accJson": {},
    "patientAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

## Testing

### Smart Contracts
```bash
cd contracts

# Run all tests
forge test

# Run with verbosity
forge test -vvv

# Run specific test
forge test --match-test test_GrantConsent_Success

# Generate coverage report
forge coverage
```

## Deployment

### Prerequisites
- Deployed smart contract address
- PostgreSQL database (e.g., AWS RDS, Supabase)
- IPFS provider (Pinata)
- RPC provider (Alchemy, Infura)

### Backend Deployment
1. Build the Go binary
```bash
CGO_ENABLED=0 GOOS=linux go build -o server cmd/main.go
```

2. Deploy to server (EC2, DigitalOcean, etc.)
3. Configure environment variables
4. Setup PostgreSQL database
5. Run migrations
6. Start server with systemd/supervisor

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to Vercel (recommended)
vercel deploy

# Or deploy to other platforms (Netlify, AWS Amplify, etc.)
```

### Smart Contract Deployment
```bash
# Deploy to mainnet (example: Ethereum)
forge script script/ConsentRegistry.s.sol \
  --rpc-url $MAINNET_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Go best practices and conventions
- Write tests for new features
- Update documentation as needed
- Use conventional commits
- Ensure all tests pass before submitting PR

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Lit Protocol](https://litprotocol.com/) - Decentralized access control
- [IPFS](https://ipfs.tech/) - Decentralized storage
- [Foundry](https://book.getfoundry.sh/) - Smart contract development
- [Next.js](https://nextjs.org/) - React framework
- [Go](https://go.dev/) - Backend programming language

**Consentis Protocol** - *Empowering patients, enabling research, protecting privacy.* 🏥🔐