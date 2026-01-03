# Consentis Protocol - Frontend

Decentralized health data management frontend built with Next.js. Enables patients to securely upload encrypted medical records and control access via blockchain.

## Core Features

### Patient
- Connect wallet and register as patient
- Upload medical records (encrypted with Lit Protocol)
- Store encrypted files on IPFS
- Grant/revoke researcher access via smart contract

### Researcher
- Connect wallet and register as researcher
- View records with granted access
- Decrypt and download authorized records

## Data Flow

### Patient Upload Flow
```
1. Patient connects wallet (RainbowKit)
2. Patient uploads medical record file
3. Frontend encrypts file using Lit SDK
4. Frontend uploads encrypted file to IPFS → gets CID
5. Frontend calls POST /api/v1/records with:
   - name, ipfs_cid, data_to_encrypt_hash
   - patient_address, acc_json
6. Patient can grant/revoke access via smart contract
```

### Researcher Decrypt Flow
```
1. Researcher connects wallet
2. Views list of records (granted access)
3. Fetches encrypted file from IPFS
4. Lit Protocol checks smart contract access
5. If granted: decrypts and displays file
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Wallet | RainbowKit + wagmi + viem |
| State | React Query + Zustand |
| Encryption | Lit Protocol SDK |
| Storage | Pinata (IPFS) |
| Blockchain | Sepolia Testnet |

## Getting Started

### Prerequisites
- Node.js 18+
- MetaMask or compatible wallet
- Pinata account (for IPFS)
- WalletConnect Project ID

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

> Note: `--legacy-peer-deps` is required due to Lit Protocol's viem version conflict.

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Blockchain
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# WalletConnect (https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Pinata IPFS (https://pinata.cloud)
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_PINATA_GATEWAY=your_gateway.mypinata.cloud

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8080

# Lit Protocol
NEXT_PUBLIC_LIT_NETWORK=datil-dev
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (connect wallet)
│   └── (dashboard)/       # Protected pages
│       ├── records/       # Patient record management
│       ├── access/        # Access control management
│       └── shared/        # Researcher shared records
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── wallet/            # Wallet connection
│   ├── records/           # Record upload/list
│   └── access/            # Access management
├── services/
│   ├── lit.ts             # Lit Protocol encryption
│   ├── pinata.ts          # IPFS upload/download
│   └── api.ts             # Backend API calls
├── hooks/                 # Custom React hooks
├── store/                 # Zustand stores
├── lib/
│   ├── wagmi.ts           # Wallet config
│   └── abi/               # Contract ABIs
└── types/                 # TypeScript types
```

## Smart Contract Integration

The frontend interacts with `ConsentRegistry.sol`:

```solidity
// Grant researcher access to a record
grantConsent(address researcher, string recordId)

// Revoke researcher access
revokeConsent(address researcher, string recordId)

// Check if researcher has access
hasConsent(address patient, address researcher, string recordId) → bool
```

## Access Control Conditions (Lit Protocol)

Encryption uses ACC that checks the smart contract:

```json
{
  "contractAddress": "0xYourContractAddress",
  "chain": "sepolia",
  "method": "hasConsent",
  "parameters": [":userAddress", "record_id", "0xPatientAddress"],
  "returnValueTest": {
    "comparator": "==",
    "value": "true"
  }
}
```

## Backend API

The frontend calls these endpoints on the Go backend:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/records` | Create new record |
| GET | `/api/v1/records/patient/:address` | Get patient's records |
| GET | `/api/v1/records/:id` | Get single record |

### Record DTO

```json
{
  "name": "Blood Work - Dec 2025",
  "ipfs_cid": "QmXoypiz...",
  "data_to_encrypt_hash": "a1b2c3d4e5f6...",
  "patient_address": "0x1234...",
  "acc_json": [...]
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Notes

- Smart contract must be deployed to Sepolia before use
- Lit Protocol uses `datil-dev` network (free for development)
- FHIR JSON format is optional - any file type supported
- Backend runs on port 8080 with CORS enabled
