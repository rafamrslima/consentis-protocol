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
CREATE TABLE medical_records (
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
