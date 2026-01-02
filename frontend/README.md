# Consentis Protocol - Frontend

Decentralized health data management frontend built with Next.js.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS
- **Wallet:** RainbowKit + wagmi + viem
- **State:** React Query + Zustand
- **Encryption:** Lit Protocol SDK
- **Storage:** Pinata (IPFS)

## Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or compatible wallet

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_PINATA_GATEWAY=your_gateway.mypinata.cloud
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components
│   ├── wallet/          # Wallet connection
│   ├── records/         # Record management
│   └── access/          # Access control
├── hooks/               # Custom React hooks
├── services/            # External service integrations
├── store/               # Zustand stores
├── lib/                 # Utilities and config
└── types/               # TypeScript types
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID |
| `NEXT_PUBLIC_CHAIN_ID` | Target blockchain network (11155111 for Sepolia) |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | ConsentRegistry contract address |
| `NEXT_PUBLIC_PINATA_JWT` | Pinata API JWT token |
| `NEXT_PUBLIC_PINATA_GATEWAY` | Pinata gateway URL |
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_LIT_NETWORK` | Lit Protocol network (datil-dev) |
