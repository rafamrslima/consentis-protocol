package dtos

import "time"

type RecordMetadataWithConsentResponse struct {
	Name               string     `json:"name"`
	PatientAddress     string     `json:"patient_address"`
	CreatedAt          time.Time  `json:"created_at"`
	ConsentStatus      string     `json:"consent_status"`
	LastUpdatedConsent *time.Time `json:"last_updated_consent"`
}
