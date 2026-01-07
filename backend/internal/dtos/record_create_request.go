package dtos

import "encoding/json"

type RecordCreateRequest struct {
	Name              string          `json:"name"`
	EncryptedFile     string          `json:"encrypted_file"`       // Link to the ciphertext
	DataToEncryptHash string          `json:"data_to_encrypt_hash"` // The Lit Fingerprint
	PatientAddress    string          `json:"patient_address"`      // Owner
	ACCJson           json.RawMessage `json:"acc_json"`             // The Stringified Rules
}
