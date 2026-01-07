# Consentis Backend

Go API service for the Consentis Protocol.

## Prerequisites

- Go 1.25+
- PostgreSQL 13+
- Docker (optional, for running PostgreSQL)

## Environment Setup

Create a `.env` file in the `backend` directory:

```env
DATABASE_CONNECTION_STRING="postgres://admin:mypassword@localhost:5432/consentisdb?sslmode=disable"
PINATA_API_KEY="your_pinata_api_key"
PINATA_API_SECRET="your_pinata_api_secret"
CONTRACT_ADDRESS="0xYourContractAddress"
ETH_CLIENT_ADDRESS="wss://eth-sepolia.g.alchemy.com/v2/your_api_key"
```

## Database Setup

### Option 1: Docker (Recommended)

```bash
docker run -d \
  --name consentis-postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=consentisdb \
  -p 5432:5432 \
  postgres:16
```

Initialize the schema:

```bash
docker exec -i consentis-postgres psql -U admin -d consentisdb < internal/database/init.sql
```

### Option 2: Local PostgreSQL

1. Create database:
```bash
psql -U postgres -c "CREATE DATABASE consentisdb;"
psql -U postgres -c "CREATE USER admin WITH PASSWORD 'mypassword';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE consentisdb TO admin;"
```

2. Initialize schema:
```bash
psql -U admin -d consentisdb -f internal/database/init.sql
```

## Running the Project

```bash
cd backend
go mod download
go run cmd/main.go
```

The server starts on `http://localhost:8080`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/records` | Create record (multipart form) |
| GET | `/api/v1/records/patient/:address` | Get patient's records |
| GET | `/api/v1/records/researcher/:address` | Get researcher's accessible records |

## Project Structure

```
backend/
├── cmd/
│   └── main.go              # Entry point
├── contracts/
│   └── consentRegistry.go   # Contract ABI bindings
├── internal/
│   ├── chain-listener/      # Blockchain event indexer
│   ├── database/            # SQL schema
│   ├── dtos/                # Request/response types
│   ├── handlers/            # HTTP handlers
│   ├── helpers/             # Utilities
│   ├── ipfs/                # Pinata integration
│   ├── models/              # Database models
│   └── repositories/        # Data access layer
└── .env
```
