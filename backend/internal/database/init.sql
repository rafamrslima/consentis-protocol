-- 1. Enable the extension to generate random UUIDs (Standard in Postgres 13+)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create the Users Table
-- We store the wallet address to link identity to records.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL, -- Standard ETH address length
    role VARCHAR(20) CHECK (role IN ('patient', 'researcher')) DEFAULT 'patient',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create the Medical Records Table
-- This stores the 'directions' for Lit Protocol and IPFS.
CREATE TABLE records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,               -- e.g., "MRI Scan - Dec 2025"
    ipfs_cid TEXT NOT NULL,                   -- The CID for the encrypted file
    data_to_encrypt_hash TEXT NOT NULL,       -- Fingerprint required by Lit SDK
    acc_json JSONB NOT NULL,                  -- Access Control Conditions as a JSON object
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Key Constraint
    CONSTRAINT fk_patient
        FOREIGN KEY(patient_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL REFERENCES records(id) ON DELETE CASCADE,
    researcher_address VARCHAR(42) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('granted', 'revoked', 'pending')) DEFAULT 'pending',
    last_tx_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_researcher_record UNIQUE(record_id, researcher_address)
);

-- 2. Create a specific table for Researcher Metadata
CREATE TABLE researcher_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    institution VARCHAR(150) NOT NULL,
    department VARCHAR(100),
    professional_email VARCHAR(255) UNIQUE NOT NULL,
    credentials_url TEXT, -- Link to a PDF/Image of their ID on IPFS/S3
    bio TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup by email or institution
    CREATE INDEX idx_researcher_institution ON researcher_profiles(institution);

    -- Indexes for the Researcher Portal
    -- This makes "Show me all records I have access to" near-instant
    CREATE INDEX idx_consents_researcher ON consents(researcher_address);
    CREATE INDEX idx_consents_status ON consents(status);

    -- Trigger to auto-update the updated_at column
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    CREATE TRIGGER update_consents_updated_at
        BEFORE UPDATE ON consents
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();

