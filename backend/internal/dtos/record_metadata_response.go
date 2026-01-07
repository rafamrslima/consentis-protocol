package dtos

import (
	"encoding/json"
	"time"
)

type RecordMetadataWithConsentResponse struct {
	Id                 string          `json:"id"`
	Name               string          `json:"name"`
	IPFSCid            string          `json:"ipfs_cid"`
	DataToEncryptHash  string          `json:"data_to_encrypt_hash"`
	AccJson            json.RawMessage `json:"acc_json"`
	PatientAddress     string          `json:"patient_address"`
	CreatedAt          time.Time       `json:"created_at"`
	ConsentStatus      string          `json:"consent_status"`
	LastUpdatedConsent *time.Time      `json:"last_updated_consent"`
}
