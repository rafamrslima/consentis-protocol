package dtos

import "time"

type RecordMetadataResponse struct {
	Name           string    `json:"name"`
	PatientAddress string    `json:"patient_address"`
	CreatedAt      time.Time `json:"created_at"`
}
